from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, TrekkerProfile, Trek, Booking, Notification
from utils.cache import (get_cached_trek, cache_trek, invalidate_trek_cache,
                         get_cached_treks, cache_treks)
from utils.helpers import generate_booking_ref, serialize_trek, serialize_booking
from datetime import datetime
from functools import wraps
import os

user_bp = Blueprint('user', __name__)


def ok(data=None, message='Success', status=200):
    r = {'status': 'success', 'message': message}
    if data is not None:
        r['data'] = data
    return jsonify(r), status


def err(message='Error', status=400):
    return jsonify({'status': 'error', 'message': message}), status


def trekker_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user = User.query.get(int(get_jwt_identity()))
        if not user or user.role != 'trekker':
            return err('Trekker access required', 403)
        if user.is_blacklisted:
            return err('Your account has been blacklisted. Contact admin.', 403)
        if not user.is_active:
            return err('Account is inactive. Contact admin.', 403)
        return f(*args, **kwargs)
    return decorated


@user_bp.route('/treks', methods=['GET'])
@trekker_required
def list_treks():
    page       = request.args.get('page', 1, type=int)
    per_page   = request.args.get('per_page', 12, type=int)
    difficulty = request.args.get('difficulty', '')
    location   = request.args.get('location', '')
    search     = request.args.get('search', '')
    max_dur    = request.args.get('max_duration', type=int)
    min_price  = request.args.get('min_price', type=float)
    max_price  = request.args.get('max_price', type=float)

    is_default = (page == 1 and not difficulty and not location and not search
                  and max_dur is None and min_price is None and max_price is None)
    if is_default:
        cached = get_cached_treks()
        if cached:
            return ok(cached)

    q = Trek.query.filter_by(status='Open')
    if difficulty: q = q.filter_by(difficulty=difficulty)
    if location:   q = q.filter(Trek.location.ilike(f'%{location}%'))
    if max_dur:    q = q.filter(Trek.duration <= max_dur)
    if min_price is not None: q = q.filter(Trek.price >= min_price)
    if max_price is not None: q = q.filter(Trek.price <= max_price)
    if search:
        q = q.filter(Trek.trek_name.ilike(f'%{search}%') | Trek.location.ilike(f'%{search}%'))

    paged = q.order_by(Trek.start_date.asc()).paginate(page=page, per_page=per_page, error_out=False)
    payload = {'treks': [serialize_trek(t) for t in paged.items],
               'total': paged.total, 'pages': paged.pages, 'page': page}
    if is_default:
        cache_treks(payload, ttl=300)
    return ok(payload)


@user_bp.route('/treks/<int:trek_id>', methods=['GET'])
@trekker_required
def get_trek(trek_id):
    cached = get_cached_trek(trek_id)
    if cached:
        return ok(cached)

    trek = Trek.query.get_or_404(trek_id)
    td   = serialize_trek(trek)
    if trek.assigned_staff:
        td['staff'] = {
            'name': f"{trek.assigned_staff.first_name} {trek.assigned_staff.last_name}",
            'specialization': trek.assigned_staff.specialization,
        }
    cache_trek(trek_id, td, ttl=600)
    return ok(td)


@user_bp.route('/bookings', methods=['GET'])
@trekker_required
def list_bookings():
    user_id  = int(get_jwt_identity())
    status_f = request.args.get('status', '')

    q = Booking.query.filter_by(user_id=user_id)
    if status_f:
        q = q.filter_by(status=status_f)

    return ok({'bookings': [serialize_booking(b) for b in q.order_by(Booking.booking_date.desc()).all()]})


@user_bp.route('/bookings', methods=['POST'])
@trekker_required
def create_booking():
    user_id = int(get_jwt_identity())
    data    = request.get_json() or {}
    trek_id = data.get('trek_id')

    if not trek_id:
        return err('trek_id is required')

    trek = Trek.query.get(trek_id)
    if not trek:
        return err('Trek not found', 404)
    if trek.status != 'Open':
        return err('Bookings are only allowed for Open treks')
    if trek.available_slots <= 0:
        return err('No available slots for this trek')

    existing = Booking.query.filter_by(user_id=user_id, trek_id=trek_id, status='Booked').first()
    if existing:
        return err('You already have an active booking for this trek')

    booking = Booking(
        booking_ref=generate_booking_ref(),
        user_id=user_id, trek_id=trek_id,
        booking_date=datetime.utcnow(),
        status='Booked', payment_status='Pending',
        amount_paid=trek.price or 0.0,
    )
    trek.available_slots -= 1
    trek.updated_at = datetime.utcnow()
    db.session.add(booking)

    notif = Notification(
        recipient_user_id=user_id,
        title='Booking Confirmed',
        content=f'Your booking for "{trek.trek_name}" is confirmed. Ref: {booking.booking_ref}',
        notification_type='Booking',
    )
    db.session.add(notif)
    db.session.commit()
    invalidate_trek_cache(trek_id)
    return ok(serialize_booking(booking), 'Booking confirmed successfully', 201)


@user_bp.route('/bookings/<int:booking_id>', methods=['DELETE'])
@trekker_required
def cancel_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get_or_404(booking_id)

    if booking.user_id != user_id:
        return err('Unauthorized', 403)
    if booking.status != 'Booked':
        return err(f'Cannot cancel a {booking.status} booking')

    trek = booking.trek
    if trek.start_date <= datetime.utcnow().date():
        return err('Cannot cancel a trek that has already started')

    data = request.get_json(silent=True) or {}
    booking.status      = 'Cancelled'
    booking.cancelled_at = datetime.utcnow()
    booking.cancellation_reason = data.get('reason', '')

    trek.available_slots += 1
    trek.updated_at = datetime.utcnow()

    notif = Notification(
        recipient_user_id=user_id,
        title='Booking Cancelled',
        content=f'Your booking for "{trek.trek_name}" has been cancelled. Ref: {booking.booking_ref}',
        notification_type='Booking',
    )
    db.session.add(notif)
    db.session.commit()
    invalidate_trek_cache(trek.id)
    return ok(message='Booking cancelled successfully')


@user_bp.route('/bookings/export', methods=['POST'])
@trekker_required
def export_bookings():
    user_id = int(get_jwt_identity())
    from tasks.export import export_user_bookings
    task = export_user_bookings.delay(user_id)
    return ok({'task_id': task.id}, 'Export started. You will receive an email when ready.', 202)


@user_bp.route('/profile', methods=['GET'])
@trekker_required
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    pd   = {'id': user.id, 'email': user.email, 'username': user.username}
    if user.trekker_profile:
        p = user.trekker_profile
        pd.update({
            'first_name': p.first_name, 'last_name': p.last_name,
            'phone': p.phone,
            'date_of_birth': p.date_of_birth.isoformat() if p.date_of_birth else None,
            'gender': p.gender, 'address': p.address,
            'emergency_contact_name': p.emergency_contact_name,
            'emergency_contact_phone': p.emergency_contact_phone,
            'experience_level': p.experience_level,
            'profile_picture': p.profile_picture,
        })
    return ok(pd)


@user_bp.route('/profile', methods=['PUT'])
@trekker_required
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json() or {}

    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return err('Username already taken')
        user.username = data['username']

    if user.trekker_profile:
        p = user.trekker_profile
        for field in ['first_name', 'last_name', 'phone', 'gender', 'address',
                      'emergency_contact_name', 'emergency_contact_phone', 'experience_level']:
            if field in data:
                setattr(p, field, data[field])
        if data.get('date_of_birth'):
            try:
                p.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                pass
        p.updated_at = datetime.utcnow()

    db.session.commit()
    return ok(message='Profile updated successfully')


@user_bp.route('/profile/upload-picture', methods=['POST'])
@trekker_required
def upload_picture():
    user = User.query.get(int(get_jwt_identity()))

    if 'file' not in request.files:
        return err('No file provided')
    file = request.files['file']
    if not file.filename:
        return err('No file selected')

    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in {'png', 'jpg', 'jpeg', 'gif'}:
        return err('Invalid file type. Allowed: png, jpg, jpeg, gif')

    filename = f"user_{user.id}.{ext}"
    file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
    url = f"/static/uploads/{filename}"

    if user.trekker_profile:
        user.trekker_profile.profile_picture = url
        user.trekker_profile.updated_at = datetime.utcnow()
    db.session.commit()
    return ok({'picture_url': url}, 'Profile picture uploaded')


@user_bp.route('/notifications', methods=['GET'])
@trekker_required
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs  = Notification.query.filter(
        (Notification.recipient_user_id == user_id) |
        (Notification.recipient_user_id == None)
    ).order_by(Notification.created_at.desc()).limit(20).all()

    return ok({'notifications': [{
        'id': n.id, 'title': n.title, 'content': n.content,
        'notification_type': n.notification_type, 'is_read': n.is_read,
        'created_at': n.created_at.isoformat() if n.created_at else None,
    } for n in notifs]})


@user_bp.route('/notifications/<int:notif_id>/read', methods=['PUT'])
@trekker_required
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif   = Notification.query.get_or_404(notif_id)
    if notif.recipient_user_id != user_id:
        return err('Unauthorized', 403)
    notif.is_read = True
    db.session.commit()
    return ok(message='Marked as read')
