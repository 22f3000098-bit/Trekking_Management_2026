import random
import string
from datetime import datetime


def generate_booking_ref():
    from models import Booking
    chars = string.ascii_uppercase + string.digits
    while True:
        ref = 'TMA-' + ''.join(random.choices(chars, k=8))
        if not Booking.query.filter_by(booking_ref=ref).first():
            return ref


def generate_staff_code():
    from models import StaffProfile
    year  = datetime.utcnow().year
    count = StaffProfile.query.count() + 1
    return f"STF{year}{count:04d}"


def serialize_trek(trek):
    return {
        'id':               trek.id,
        'trek_name':        trek.trek_name,
        'location':         trek.location,
        'description':      trek.description,
        'difficulty':       trek.difficulty,
        'duration':         trek.duration,
        'total_slots':      trek.total_slots,
        'available_slots':  trek.available_slots,
        'price':            trek.price,
        'altitude_meters':  trek.altitude_meters,
        'start_date':       trek.start_date.isoformat() if trek.start_date else None,
        'end_date':         trek.end_date.isoformat()   if trek.end_date   else None,
        'meeting_point':    trek.meeting_point,
        'requirement':      trek.requirement,
        'status':           trek.status,
        'assigned_staff_id':trek.assigned_staff_id,
        'created_at':       trek.created_at.isoformat() if trek.created_at else None,
        'updated_at':       trek.updated_at.isoformat() if trek.updated_at else None,
    }


def serialize_booking(booking):
    trek = booking.trek
    user = booking.trekker
    name = None
    if user and user.trekker_profile:
        p    = user.trekker_profile
        name = f"{p.first_name} {p.last_name}"
    elif user:
        name = user.username

    return {
        'id':                  booking.id,
        'booking_ref':         booking.booking_ref,
        'user_id':             booking.user_id,
        'trek_id':             booking.trek_id,
        'trek_name':           trek.trek_name        if trek else None,
        'location':            trek.location         if trek else None,
        'difficulty':          trek.difficulty       if trek else None,
        'duration':            trek.duration         if trek else None,
        'start_date':          trek.start_date.isoformat() if trek and trek.start_date else None,
        'end_date':            trek.end_date.isoformat()   if trek and trek.end_date   else None,
        'booking_date':        booking.booking_date.isoformat() if booking.booking_date else None,
        'status':              booking.status,
        'payment_status':      booking.payment_status,
        'amount_paid':         booking.amount_paid,
        'cancelled_at':        booking.cancelled_at.isoformat() if booking.cancelled_at else None,
        'cancellation_reason': booking.cancellation_reason,
        'user_email':          user.email if user else None,
        'user_name':           name,
    }


def log_audit(actor_id, action, target_type, target_id, details=''):
    from models import db, AuditLog
    try:
        log = AuditLog(
            actor_id=actor_id, action=action,
            target_type=target_type, target_id=target_id,
            details=details,
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"[AUDIT] Failed to log '{action}': {e}")
