from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, TrekkerProfile
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


def ok(data=None, message='Success', status=200):
    r = {'status': 'success', 'message': message}
    if data is not None:
        r['data'] = data
    return jsonify(r), status


def err(message='Error', status=400):
    return jsonify({'status': 'error', 'message': message}), status


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    for field in ['email', 'password', 'first_name', 'last_name']:
        if not data.get(field):
            return err(f'{field} is required')

    if User.query.filter_by(email=data['email']).first():
        return err('Email already registered', 409)

    username = data.get('username') or data['email'].split('@')[0]
    if User.query.filter_by(username=username).first():
        username = username + str(User.query.count())

    user = User(
        email=data['email'],
        username=username,
        password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        role='trekker',
        is_active=True,
        is_blacklisted=False,
    )
    db.session.add(user)
    db.session.flush()

    dob = None
    if data.get('date_of_birth'):
        try:
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            pass

    profile = TrekkerProfile(
        user_id=user.id,
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone', ''),
        date_of_birth=dob,
        gender=data.get('gender', ''),
        experience_level=data.get('experience_level', 'Beginner'),
    )
    db.session.add(profile)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return ok({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'role': user.role,
            'first_name': profile.first_name,
            'last_name': profile.last_name,
        }
    }, 'Registration successful', 201)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    if not data.get('email') or not data.get('password'):
        return err('Email and password are required')

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return err('Invalid email or password', 401)

    if user.is_blacklisted:
        return err('Your account has been blacklisted. Contact admin.', 403)
    if not user.is_active:
        return err('Your account is inactive. Contact admin.', 403)

    token = create_access_token(identity=str(user.id))
    user_data = {
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'role': user.role,
    }

    if user.role == 'trekker' and user.trekker_profile:
        p = user.trekker_profile
        user_data.update({
            'first_name': p.first_name,
            'last_name': p.last_name,
            'profile_picture': p.profile_picture,
        })
    elif user.role == 'staff' and user.staff_profile:
        p = user.staff_profile
        user_data.update({
            'first_name': p.first_name,
            'last_name': p.last_name,
            'staff_code': p.staff_code,
        })
    elif user.role == 'admin':
        user_data.update({'first_name': 'Admin', 'last_name': ''})

    return ok({'token': token, 'user': user_data}, 'Login successful')


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return err('User not found', 404)

    user_data = {
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'role': user.role,
        'is_active': user.is_active,
    }

    if user.role == 'trekker' and user.trekker_profile:
        p = user.trekker_profile
        user_data.update({
            'first_name': p.first_name, 'last_name': p.last_name,
            'phone': p.phone,
            'date_of_birth': p.date_of_birth.isoformat() if p.date_of_birth else None,
            'gender': p.gender, 'address': p.address,
            'experience_level': p.experience_level,
            'emergency_contact_name': p.emergency_contact_name,
            'emergency_contact_phone': p.emergency_contact_phone,
            'profile_picture': p.profile_picture,
        })
    elif user.role == 'staff' and user.staff_profile:
        p = user.staff_profile
        user_data.update({
            'first_name': p.first_name, 'last_name': p.last_name,
            'phone': p.phone, 'staff_code': p.staff_code,
            'specialization': p.specialization, 'years_experience': p.years_experience,
        })
    elif user.role == 'admin':
        user_data.update({'first_name': 'Admin', 'last_name': ''})

    return ok(user_data)


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return ok(message='Logged out successfully')
