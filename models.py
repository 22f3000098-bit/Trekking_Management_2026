from datetime import datetime
from flask_login import UserMixin
from sqlalchemy.orm import backref
from extensions import db


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id             = db.Column(db.Integer, primary_key=True)
    email          = db.Column(db.String(120), unique=True, nullable=False)
    username       = db.Column(db.String(50),  unique=True, nullable=True)
    password_hash  = db.Column(db.String(200), nullable=False)
    role           = db.Column(db.String(20),  nullable=False)
    is_active      = db.Column(db.Boolean, default=True,  nullable=False)
    is_blacklisted = db.Column(db.Boolean, default=False, nullable=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    trekker_profile = db.relationship('TrekkerProfile', backref='user', uselist=False)
    staff_profile   = db.relationship('StaffProfile',   backref='user', uselist=False)


class TrekkerProfile(db.Model):
    __tablename__ = 'trekker_profiles'

    id                      = db.Column(db.Integer, primary_key=True)
    user_id                 = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    first_name              = db.Column(db.String(50),  nullable=False)
    last_name               = db.Column(db.String(50),  nullable=False)
    phone                   = db.Column(db.String(20))
    date_of_birth           = db.Column(db.Date)
    gender                  = db.Column(db.String(10))
    address                 = db.Column(db.String(200))
    emergency_contact_name  = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    experience_level        = db.Column(db.String(20))
    profile_picture         = db.Column(db.String(200))
    created_at              = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at              = db.Column(db.DateTime, onupdate=datetime.utcnow)


class StaffProfile(db.Model):
    __tablename__ = 'staff_profiles'

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    staff_code       = db.Column(db.String(20), unique=True, nullable=False)
    first_name       = db.Column(db.String(50), nullable=False)
    last_name        = db.Column(db.String(50), nullable=False)
    phone            = db.Column(db.String(20))
    address          = db.Column(db.String(200))
    specialization   = db.Column(db.String(100))
    certifications   = db.Column(db.Text)
    years_experience = db.Column(db.Integer, default=0)
    status           = db.Column(db.String(20), default='Active')
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at       = db.Column(db.DateTime, onupdate=datetime.utcnow)

    assigned_treks = db.relationship('Trek', backref='assigned_staff', lazy='dynamic',
                                     foreign_keys='Trek.assigned_staff_id')


class Trek(db.Model):
    __tablename__ = 'treks'

    id                = db.Column(db.Integer, primary_key=True)
    trek_name         = db.Column(db.String(150), nullable=False)
    location          = db.Column(db.String(200), nullable=False)
    description       = db.Column(db.Text)
    difficulty        = db.Column(db.String(20),  nullable=False)
    duration          = db.Column(db.Integer,     nullable=False)
    total_slots       = db.Column(db.Integer,     nullable=False)
    available_slots   = db.Column(db.Integer,     nullable=False)
    price             = db.Column(db.Float,       default=0.0)
    altitude_meters   = db.Column(db.Integer)
    start_date        = db.Column(db.Date,        nullable=False)
    end_date          = db.Column(db.Date,        nullable=False)
    meeting_point     = db.Column(db.String(200))
    requirement       = db.Column(db.Text)
    status            = db.Column(db.String(20),  default='Pending', nullable=False)
    assigned_staff_id = db.Column(db.Integer, db.ForeignKey('staff_profiles.id'), nullable=True)
    created_by        = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at        = db.Column(db.DateTime, onupdate=datetime.utcnow)

    bookings = db.relationship('Booking', backref='trek', lazy='dynamic')
    creator  = db.relationship('User', foreign_keys=[created_by],
                               backref=backref('created_treks', lazy='dynamic'))


class Booking(db.Model):
    __tablename__ = 'bookings'

    id                  = db.Column(db.Integer, primary_key=True)
    booking_ref         = db.Column(db.String(20), unique=True, nullable=False)
    user_id             = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    trek_id             = db.Column(db.Integer, db.ForeignKey('treks.id'), nullable=False)
    booking_date        = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status              = db.Column(db.String(20), default='Booked', nullable=False)
    payment_status      = db.Column(db.String(20), default='Pending')
    amount_paid         = db.Column(db.Float, default=0.0)
    remarks             = db.Column(db.Text)
    cancelled_at        = db.Column(db.DateTime)
    cancellation_reason = db.Column(db.Text)
    created_at          = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at          = db.Column(db.DateTime, onupdate=datetime.utcnow)

    trekker = db.relationship('User', foreign_keys=[user_id],
                              backref=backref('bookings', lazy='dynamic'))


class Notification(db.Model):
    __tablename__ = 'notifications'

    id                = db.Column(db.Integer, primary_key=True)
    recipient_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    title             = db.Column(db.String(150), nullable=False)
    content           = db.Column(db.Text,        nullable=False)
    notification_type = db.Column(db.String(50))
    is_read           = db.Column(db.Boolean, default=False)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    recipient = db.relationship('User', backref=backref('notifications', lazy='dynamic'),
                                foreign_keys=[recipient_user_id])


class Message(db.Model):
    __tablename__ = 'messages'

    id              = db.Column(db.Integer, primary_key=True)
    sender_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message_content = db.Column(db.Text,    nullable=False)
    is_read         = db.Column(db.Boolean, default=False)
    timestamp       = db.Column(db.DateTime, default=datetime.utcnow)

    sender   = db.relationship('User', foreign_keys=[sender_id],
                               backref=backref('sent_messages',     lazy='dynamic'))
    receiver = db.relationship('User', foreign_keys=[receiver_id],
                               backref=backref('received_messages', lazy='dynamic'))


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id          = db.Column(db.Integer, primary_key=True)
    actor_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action      = db.Column(db.String(100), nullable=False)
    target_type = db.Column(db.String(50))
    target_id   = db.Column(db.Integer)
    details     = db.Column(db.Text)
    timestamp   = db.Column(db.DateTime, default=datetime.utcnow)

    actor = db.relationship('User', foreign_keys=[actor_id],
                            backref=backref('audit_logs', lazy='dynamic'))
