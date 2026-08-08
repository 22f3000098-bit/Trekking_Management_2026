from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import db, User, StaffProfile, Trek, Booking, AuditLog
from utils.cache import invalidate_trek_cache, cache_stats, get_cached_stats
from utils.helpers import generate_staff_code, serialize_trek, serialize_booking, log_audit
from datetime import datetime
from functools import wraps

admin_bp = Blueprint('admin', __name__)


def ok(data=None, message='Success', status=200):
    r = {'status': 'success', 'message': message}
    if data is not None:
        r['data'] = data
    return jsonify(r), status


def err(message='Error', status=400):
    return jsonify({'status': 'error', 'message': message}), status


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user = User.query.get(int(get_jwt_identity()))
        if not user or user.role != 'admin':
            return err('Admin access required', 403)
        return f(*args, **kwargs)
    return decorated


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    cached = get_cached_stats()
    if cached:
        return ok(cached)

    stats = {
        'total_treks':    Trek.query.count(),
        'total_users':    User.query.filter_by(role='trekker').count(),
        'total_staff':    User.query.filter_by(role='staff').count(),
        'total_bookings': Booking.query.count(),
        'open_treks':     Trek.query.filter_by(status='Open').count(),
        'pending_treks':  Trek.query.filter_by(status='Pending').count(),
        'completed_treks':Trek.query.filter_by(status='Completed').count(),
        'active_bookings':Booking.query.filter_by(status='Booked').count(),
    }
    cache_stats(stats, ttl=120)
    return ok(stats)


@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def analytics():
    from sqlalchemy import func

    popular = (
        Booking.query.join(Trek)
        .with_entities(Trek.trek_name, func.count(Booking.id).label('cnt'))
        .group_by(Trek.id)
        .order_by(func.count(Booking.id).desc())
        .limit(5)
        .all()
    )
    difficulty = (
        Trek.query
        .with_entities(Trek.difficulty, func.count(Trek.id))
        .group_by(Trek.difficulty)
        .all()
    )
    by_status = (
        Booking.query
        .with_entities(Booking.status, func.count(Booking.id))
        .group_by(Booking.status)
        .all()
    )

    return ok({
        'popular_treks':      [{'name': n, 'bookings': c} for n, c in popular],
        'difficulty':         [{'label': d or 'Unknown', 'count': c} for d, c in difficulty],
        'bookings_by_status': [{'label': s, 'count': c} for s, c in by_status],
    })


@admin_bp.route('/treks', methods=['GET'])
@admin_required
def list_treks():
    page        = request.args.get('page', 1, type=int)
    per_page    = request.args.get('per_page', 20, type=int)
    search      = request.args.get('search', '')
    status_f    = request.args.get('status', '')

    q = Trek.query
    if search:
        q = q.filter(Trek.trek_name.ilike(f'%{search}%') | Trek.location.ilike(f'%{search}%'))
    if status_f:
        q = q.filter_by(status=status_f)

    paged = q.order_by(Trek.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    treks = []
    for t in paged.items:
        td = serialize_trek(t)
        td['staff_name'] = (f"{t.assigned_staff.first_name} {t.assigned_staff.last_name}"
                            if t.assigned_staff else None)
        td['bookings_count'] = t.bookings.filter_by(status='Booked').count()
        treks.append(td)

    return ok({'treks': treks, 'total': paged.total, 'pages': paged.pages, 'page': page})


@admin_bp.route('/treks', methods=['POST'])
@admin_required
def create_trek():
    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())

    for field in ['trek_name', 'location', 'difficulty', 'duration', 'total_slots', 'start_date', 'end_date']:
        if not data.get(field):
            return err(f'{field} is required')

    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date   = datetime.strptime(data['end_date'],   '%Y-%m-%d').date()
    except ValueError:
        return err('Invalid date format. Use YYYY-MM-DD')

    if end_date <= start_date:
        return err('End date must be after start date')

    total_slots = int(data['total_slots'])
    trek = Trek(
        trek_name=data['trek_name'], location=data['location'],
        description=data.get('description', ''),
        difficulty=data['difficulty'], duration=int(data['duration']),
        total_slots=total_slots, available_slots=total_slots,
        price=float(data.get('price', 0.0)),
        altitude_meters=data.get('altitude_meters'),
        start_date=start_date, end_date=end_date,
        meeting_point=data.get('meeting_point', ''),
        requirement=data.get('requirement', ''),
        status='Pending', created_by=user_id,
    )
    db.session.add(trek)
    db.session.commit()
    invalidate_trek_cache()
    log_audit(user_id, 'CREATE_TREK', 'Trek', trek.id, f'Created: {trek.trek_name}')
    return ok(serialize_trek(trek), 'Trek created successfully', 201)


@admin_bp.route('/treks/<int:trek_id>', methods=['GET'])
@admin_required
def get_trek(trek_id):
    trek = Trek.query.get_or_404(trek_id)
    td = serialize_trek(trek)
    if trek.assigned_staff:
        td['staff'] = {
            'id': trek.assigned_staff.id,
            'name': f"{trek.assigned_staff.first_name} {trek.assigned_staff.last_name}",
            'staff_code': trek.assigned_staff.staff_code,
        }
    return ok(td)


@admin_bp.route('/treks/<int:trek_id>', methods=['PUT'])
@admin_required
def update_trek(trek_id):
    trek    = Trek.query.get_or_404(trek_id)
    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())

    for field in ['trek_name', 'location', 'description', 'difficulty', 'duration',
                  'price', 'altitude_meters', 'meeting_point', 'requirement']:
        if field in data:
            setattr(trek, field, data[field])

    if 'start_date' in data:
        trek.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    if 'end_date' in data:
        trek.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()

    if 'total_slots' in data:
        booked      = Booking.query.filter_by(trek_id=trek_id, status='Booked').count()
        new_total   = int(data['total_slots'])
        if new_total < booked:
            return err(f'Cannot reduce slots below current bookings ({booked})')
        trek.total_slots    = new_total
        trek.available_slots = new_total - booked

    trek.updated_at = datetime.utcnow()
    db.session.commit()
    invalidate_trek_cache(trek_id)
    log_audit(user_id, 'UPDATE_TREK', 'Trek', trek_id, f'Updated: {trek.trek_name}')
    return ok(serialize_trek(trek), 'Trek updated successfully')


@admin_bp.route('/treks/<int:trek_id>', methods=['DELETE'])
@admin_required
def delete_trek(trek_id):
    trek    = Trek.query.get_or_404(trek_id)
    user_id = int(get_jwt_identity())

    if Booking.query.filter_by(trek_id=trek_id, status='Booked').count():
        return err('Cannot delete a trek with active bookings')

    name = trek.trek_name
    db.session.delete(trek)
    db.session.commit()
    invalidate_trek_cache(trek_id)
    log_audit(user_id, 'DELETE_TREK', 'Trek', trek_id, f'Deleted: {name}')
    return ok(message='Trek deleted successfully')


@admin_bp.route('/treks/<int:trek_id>/assign-staff', methods=['POST'])
@admin_required
def assign_staff_to_trek(trek_id):
    trek    = Trek.query.get_or_404(trek_id)
    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())

    staff_profile_id = data.get('staff_profile_id')
    if not staff_profile_id:
        return err('staff_profile_id is required')

    staff = StaffProfile.query.get(staff_profile_id)
    if not staff:
        return err('Staff not found', 404)
    if staff.status != 'Active':
        return err('Staff member is not active')

    trek.assigned_staff_id = staff_profile_id
    trek.updated_at = datetime.utcnow()
    db.session.commit()
    invalidate_trek_cache(trek_id)
    log_audit(user_id, 'ASSIGN_STAFF', 'Trek', trek_id,
              f'Assigned {staff.staff_code} to {trek.trek_name}')
    return ok(message=f'Staff assigned successfully')


@admin_bp.route('/treks/<int:trek_id>/status', methods=['PUT'])
@admin_required
def update_trek_status(trek_id):
    trek    = Trek.query.get_or_404(trek_id)
    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())

    new_status = data.get('status')
    valid = ['Pending', 'Approved', 'Open', 'Closed', 'Completed']
    if new_status not in valid:
        return err(f'Invalid status. Must be one of: {", ".join(valid)}')

    old_status = trek.status
    trek.status = new_status
    trek.updated_at = datetime.utcnow()
    db.session.commit()
    invalidate_trek_cache(trek_id)
    log_audit(user_id, 'UPDATE_STATUS', 'Trek', trek_id,
              f'{old_status} → {new_status}')
    return ok({'status': new_status}, f'Status updated to {new_status}')


@admin_bp.route('/staff', methods=['GET'])
@admin_required
def list_staff():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search   = request.args.get('search', '')

    q = StaffProfile.query.join(User)
    if search:
        q = q.filter(
            StaffProfile.first_name.ilike(f'%{search}%') |
            StaffProfile.last_name.ilike(f'%{search}%') |
            StaffProfile.staff_code.ilike(f'%{search}%') |
            User.email.ilike(f'%{search}%')
        )

    paged = q.order_by(StaffProfile.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    staff_list = [{
        'id': s.id, 'user_id': s.user_id, 'staff_code': s.staff_code,
        'first_name': s.first_name, 'last_name': s.last_name,
        'email': s.user.email, 'phone': s.phone,
        'specialization': s.specialization, 'years_experience': s.years_experience,
        'status': s.status, 'is_active': s.user.is_active,
        'assigned_treks_count': s.assigned_treks.count(),
        'created_at': s.created_at.isoformat() if s.created_at else None,
    } for s in paged.items]

    return ok({'staff': staff_list, 'total': paged.total, 'pages': paged.pages, 'page': page})


@admin_bp.route('/staff', methods=['POST'])
@admin_required
def create_staff():
    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())

    for field in ['email', 'password', 'first_name', 'last_name']:
        if not data.get(field):
            return err(f'{field} is required')

    if User.query.filter_by(email=data['email']).first():
        return err('Email already registered', 409)

    user = User(
        email=data['email'],
        username=data.get('username', data['email'].split('@')[0]),
        password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        role='staff', is_active=True, is_blacklisted=False,
    )
    db.session.add(user)
    db.session.flush()

    staff_code = generate_staff_code()
    staff = StaffProfile(
        user_id=user.id, staff_code=staff_code,
        first_name=data['first_name'], last_name=data['last_name'],
        phone=data.get('phone', ''), address=data.get('address', ''),
        specialization=data.get('specialization', ''),
        certifications=data.get('certifications', ''),
        years_experience=int(data.get('years_experience', 0)),
        status='Active',
    )
    db.session.add(staff)
    db.session.commit()
    log_audit(user_id, 'CREATE_STAFF', 'User', user.id,
              f'Created staff: {staff.first_name} {staff.last_name} ({staff_code})')

    return ok({
        'id': staff.id, 'user_id': user.id, 'staff_code': staff_code,
        'email': user.email, 'first_name': staff.first_name, 'last_name': staff.last_name,
    }, 'Staff created successfully', 201)


@admin_bp.route('/staff/<int:staff_id>', methods=['GET'])
@admin_required
def get_staff(staff_id):
    s = StaffProfile.query.get_or_404(staff_id)
    treks = [{'id': t.id, 'trek_name': t.trek_name, 'status': t.status,
               'start_date': t.start_date.isoformat() if t.start_date else None}
             for t in s.assigned_treks.all()]
    return ok({
        'id': s.id, 'user_id': s.user_id, 'staff_code': s.staff_code,
        'first_name': s.first_name, 'last_name': s.last_name,
        'email': s.user.email, 'phone': s.phone, 'address': s.address,
        'specialization': s.specialization, 'certifications': s.certifications,
        'years_experience': s.years_experience, 'status': s.status,
        'is_active': s.user.is_active, 'assigned_treks': treks,
        'created_at': s.created_at.isoformat() if s.created_at else None,
    })


@admin_bp.route('/staff/<int:staff_id>', methods=['PUT'])
@admin_required
def update_staff(staff_id):
    s       = StaffProfile.query.get_or_404(staff_id)
    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())

    for field in ['first_name', 'last_name', 'phone', 'address',
                  'specialization', 'certifications', 'years_experience']:
        if field in data:
            setattr(s, field, data[field])

    s.updated_at = datetime.utcnow()
    db.session.commit()
    log_audit(user_id, 'UPDATE_STAFF', 'User', s.user_id, f'Updated: {s.staff_code}')
    return ok(message='Staff updated successfully')


@admin_bp.route('/staff/<int:staff_id>/toggle-status', methods=['PUT'])
@admin_required
def toggle_staff_status(staff_id):
    s       = StaffProfile.query.get_or_404(staff_id)
    data    = request.get_json() or {}
    user_id = int(get_jwt_identity())
    action  = data.get('action')

    if action == 'deactivate':
        s.status = 'Inactive'; s.user.is_active = False
    elif action == 'activate':
        s.status = 'Active'; s.user.is_active = True; s.user.is_blacklisted = False
    elif action == 'blacklist':
        s.status = 'Blacklisted'; s.user.is_active = False; s.user.is_blacklisted = True
    else:
        return err('Invalid action. Use: activate, deactivate, blacklist')

    s.updated_at = datetime.utcnow()
    db.session.commit()
    log_audit(user_id, f'STAFF_{action.upper()}', 'User', s.user_id,
              f'Staff {action}: {s.staff_code}')
    return ok(message=f'Staff {action}d successfully')


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search   = request.args.get('search', '')

    q = User.query.filter_by(role='trekker')
    if search:
        q = q.filter(User.email.ilike(f'%{search}%') | User.username.ilike(f'%{search}%'))

    paged = q.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    users = []
    for u in paged.items:
        ud = {
            'id': u.id, 'email': u.email, 'username': u.username,
            'is_active': u.is_active, 'is_blacklisted': u.is_blacklisted,
            'bookings_count': u.bookings.count(),
            'created_at': u.created_at.isoformat() if u.created_at else None,
        }
        if u.trekker_profile:
            p = u.trekker_profile
            ud.update({'first_name': p.first_name, 'last_name': p.last_name, 'phone': p.phone})
        users.append(ud)

    return ok({'users': users, 'total': paged.total, 'pages': paged.pages, 'page': page})


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@admin_required
def toggle_user_status(user_id):
    user     = User.query.get_or_404(user_id)
    data     = request.get_json() or {}
    admin_id = int(get_jwt_identity())

    if user.role == 'admin':
        return err('Cannot modify admin account')

    action = data.get('action')
    if action == 'deactivate':
        user.is_active = False
    elif action == 'activate':
        user.is_active = True; user.is_blacklisted = False
    elif action == 'blacklist':
        user.is_active = False; user.is_blacklisted = True
    else:
        return err('Invalid action')

    db.session.commit()
    log_audit(admin_id, f'USER_{action.upper()}', 'User', user_id, f'{action}: {user.email}')
    return ok(message=f'User {action}d successfully')


@admin_bp.route('/bookings', methods=['GET'])
@admin_required
def list_bookings():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    trek_id  = request.args.get('trek_id', type=int)
    status_f = request.args.get('status', '')

    q = Booking.query
    if trek_id:   q = q.filter_by(trek_id=trek_id)
    if status_f:  q = q.filter_by(status=status_f)

    paged = q.order_by(Booking.booking_date.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return ok({'bookings': [serialize_booking(b) for b in paged.items],
               'total': paged.total, 'pages': paged.pages, 'page': page})


@admin_bp.route('/search', methods=['GET'])
@admin_required
def search():
    q    = request.args.get('q', '').strip()
    kind = request.args.get('type', 'all')

    if not q:
        return err('Search query is required')

    results = {}
    if kind in ('users', 'all'):
        users = User.query.filter(
            User.role == 'trekker',
            (User.email.ilike(f'%{q}%') | User.username.ilike(f'%{q}%'))
        ).limit(10).all()
        results['users'] = [{'id': u.id, 'email': u.email, 'username': u.username} for u in users]

    if kind in ('staff', 'all'):
        staff = StaffProfile.query.filter(
            StaffProfile.first_name.ilike(f'%{q}%') |
            StaffProfile.last_name.ilike(f'%{q}%') |
            StaffProfile.staff_code.ilike(f'%{q}%')
        ).limit(10).all()
        results['staff'] = [{'id': s.id, 'staff_code': s.staff_code,
                              'name': f"{s.first_name} {s.last_name}", 'status': s.status}
                             for s in staff]

    if kind in ('treks', 'all'):
        treks = Trek.query.filter(
            Trek.trek_name.ilike(f'%{q}%') | Trek.location.ilike(f'%{q}%')
        ).limit(10).all()
        results['treks'] = [{'id': t.id, 'trek_name': t.trek_name,
                              'location': t.location, 'status': t.status}
                             for t in treks]

    return ok(results)


@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required
def list_audit_logs():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    paged = AuditLog.query.order_by(AuditLog.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False)
    logs = [{
        'id': l.id, 'action': l.action, 'target_type': l.target_type,
        'target_id': l.target_id, 'details': l.details,
        'timestamp': l.timestamp.isoformat() if l.timestamp else None,
        'actor': l.actor.username if l.actor else None,
    } for l in paged.items]

    return ok({'logs': logs, 'total': paged.total, 'pages': paged.pages, 'page': page})


@admin_bp.route('/staff/active', methods=['GET'])
@admin_required
def active_staff_list():
    staff = StaffProfile.query.filter_by(status='Active').all()
    return ok([{
        'id': s.id, 'staff_code': s.staff_code,
        'name': f"{s.first_name} {s.last_name}",
        'specialization': s.specialization,
    } for s in staff])
