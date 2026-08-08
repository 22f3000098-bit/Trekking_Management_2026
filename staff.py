from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, StaffProfile, Trek, Booking, Notification
from utils.cache import invalidate_trek_cache
from utils.helpers import log_audit
from datetime import datetime
from functools import wraps

staff_bp = Blueprint('staff', __name__)


def ok(data=None, message='Success', status=200):
    r = {'status': 'success', 'message': message}
    if data is not None:
        r['data'] = data
    return jsonify(r), status


def err(message='Error', status=400):
    return jsonify({'status': 'error', 'message': message}), status


def staff_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user = User.query.get(int(get_jwt_identity()))
        if not user or user.role != 'staff':
            return err('Staff access required', 403)
        if not user.is_active:
            return err('Account is inactive', 403)
        return f(*args, **kwargs)
    return decorated


def _get_staff():
    user = User.query.get(int(get_jwt_identity()))
    return user.staff_profile if user else None


@staff_bp.route('/dashboard', methods=['GET'])
@staff_required
def dashboard():
    staff = _get_staff()
    if not staff:
        return err('Staff profile not found', 404)

    treks = staff.assigned_treks.all()
    trek_data = []
    for t in treks:
        booked = Booking.query.filter_by(trek_id=t.id, status='Booked').count()
        trek_data.append({
            'id': t.id, 'trek_name': t.trek_name, 'location': t.location,
            'difficulty': t.difficulty, 'status': t.status,
            'available_slots': t.available_slots, 'total_slots': t.total_slots,
            'start_date': t.start_date.isoformat() if t.start_date else None,
            'end_date': t.end_date.isoformat() if t.end_date else None,
            'booked_count': booked,
        })

    return ok({
        'staff': {
            'id': staff.id, 'staff_code': staff.staff_code,
            'first_name': staff.first_name, 'last_name': staff.last_name,
            'specialization': staff.specialization,
        },
        'treks': trek_data,
        'total_assigned': len(treks),
    })


@staff_bp.route('/treks', methods=['POST'])
@staff_required
def create_trek():
    staff = _get_staff()
    if not staff:
        return err('Staff profile not found', 404)

    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())

    for field in ['trek_name', 'location', 'difficulty', 'total_slots', 'start_date', 'end_date']:
        if not data.get(field):
            return err(f'{field} is required')

    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date   = datetime.strptime(data['end_date'],   '%Y-%m-%d').date()
    except ValueError:
        return err('Invalid date format. Use YYYY-MM-DD')

    if end_date <= start_date:
        return err('End date must be after start date')

    try:
        total_slots = int(data['total_slots'])
    except (TypeError, ValueError):
        return err('Total slots must be a valid number')

    if total_slots <= 0:
        return err('Total slots must be greater than zero')

    trek = Trek(
        trek_name=data['trek_name'], location=data['location'],
        description=data.get('description', ''),
        difficulty=data['difficulty'],
        total_slots=total_slots, available_slots=total_slots,
        price=float(data.get('price') or 0.0),
        altitude_meters=data.get('altitude_meters') or None,
        start_date=start_date, end_date=end_date,
        meeting_point=data.get('meeting_point', ''),
        requirement=data.get('requirement', ''),
        status='Pending',
        assigned_staff_id=staff.id,
        created_by=user_id,
    )
    db.session.add(trek)
    db.session.commit()
    invalidate_trek_cache()
    log_audit(user_id, 'CREATE_TREK', 'Trek', trek.id, f'Staff proposed: {trek.trek_name}')
    return ok({'id': trek.id, 'trek_name': trek.trek_name, 'status': trek.status},
              'Trek submitted for admin approval', 201)


@staff_bp.route('/treks/<int:trek_id>', methods=['GET'])
@staff_required
def get_trek(trek_id):
    staff = _get_staff()
    trek  = Trek.query.get_or_404(trek_id)

    if trek.assigned_staff_id != staff.id:
        return err('You are not assigned to this trek', 403)

    booked    = Booking.query.filter_by(trek_id=trek_id, status='Booked').count()
    cancelled = Booking.query.filter_by(trek_id=trek_id, status='Cancelled').count()
    completed = Booking.query.filter_by(trek_id=trek_id, status='Completed').count()

    return ok({
        'id': trek.id, 'trek_name': trek.trek_name, 'location': trek.location,
        'description': trek.description, 'difficulty': trek.difficulty,
        'duration': trek.duration, 'total_slots': trek.total_slots,
        'available_slots': trek.available_slots, 'status': trek.status,
        'start_date': trek.start_date.isoformat() if trek.start_date else None,
        'end_date': trek.end_date.isoformat() if trek.end_date else None,
        'meeting_point': trek.meeting_point, 'requirement': trek.requirement,
        'price': trek.price,
        'booking_stats': {'booked': booked, 'cancelled': cancelled, 'completed': completed},
    })


@staff_bp.route('/treks/<int:trek_id>/slots', methods=['PUT'])
@staff_required
def update_slots(trek_id):
    staff = _get_staff()
    trek  = Trek.query.get_or_404(trek_id)

    if trek.assigned_staff_id != staff.id:
        return err('You are not assigned to this trek', 403)

    data = request.get_json() or {}
    slots = data.get('available_slots')
    if slots is None:
        return err('available_slots is required')

    slots = int(slots)
    if slots < 0:
        return err('Available slots cannot be negative')
    if slots > trek.total_slots:
        return err(f'Cannot exceed total slots ({trek.total_slots})')

    trek.available_slots = slots
    trek.updated_at = datetime.utcnow()
    db.session.commit()
    invalidate_trek_cache(trek_id)
    log_audit(int(get_jwt_identity()), 'UPDATE_SLOTS', 'Trek', trek_id,
              f'Available slots → {slots}')
    return ok({'available_slots': slots}, 'Slots updated successfully')


@staff_bp.route('/treks/<int:trek_id>/status', methods=['PUT'])
@staff_required
def update_trek_status(trek_id):
    staff = _get_staff()
    trek  = Trek.query.get_or_404(trek_id)

    if trek.assigned_staff_id != staff.id:
        return err('You are not assigned to this trek', 403)
    if trek.status == 'Pending':
        return err('Trek must be approved by admin first')

    data       = request.get_json() or {}
    new_status = data.get('status')

    if new_status not in ['Open', 'Closed', 'Completed']:
        return err('Staff can only set status to: Open, Closed, Completed')

    old_status  = trek.status
    trek.status = new_status
    trek.updated_at = datetime.utcnow()

    if new_status == 'Completed':
        Booking.query.filter_by(trek_id=trek_id, status='Booked').update({'status': 'Completed'})

    db.session.commit()
    invalidate_trek_cache(trek_id)
    log_audit(int(get_jwt_identity()), 'UPDATE_TREK_STATUS', 'Trek', trek_id,
              f'{old_status} → {new_status}')
    return ok({'status': new_status}, f'Status updated to {new_status}')


@staff_bp.route('/treks/<int:trek_id>/participants', methods=['GET'])
@staff_required
def get_participants(trek_id):
    staff = _get_staff()
    trek  = Trek.query.get_or_404(trek_id)

    if trek.assigned_staff_id != staff.id:
        return err('You are not assigned to this trek', 403)

    status_f = request.args.get('status', '')
    q = Booking.query.filter_by(trek_id=trek_id)
    if status_f:
        q = q.filter_by(status=status_f)

    participants = []
    for b in q.order_by(Booking.booking_date.asc()).all():
        u  = b.trekker
        pd = {
            'booking_id': b.id, 'booking_ref': b.booking_ref,
            'status': b.status,
            'booking_date': b.booking_date.isoformat() if b.booking_date else None,
            'user_id': u.id, 'email': u.email,
        }
        if u.trekker_profile:
            p = u.trekker_profile
            pd.update({
                'first_name': p.first_name, 'last_name': p.last_name,
                'phone': p.phone, 'experience_level': p.experience_level,
                'emergency_contact_name': p.emergency_contact_name,
                'emergency_contact_phone': p.emergency_contact_phone,
            })
        participants.append(pd)

    return ok({'participants': participants, 'total': len(participants)})
