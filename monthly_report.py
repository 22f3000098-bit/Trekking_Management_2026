from celery import shared_task


@shared_task(name='tasks.monthly_report.send_monthly_report')
def send_monthly_report():
    from extensions import mail
    from models import User, Trek, Booking
    from flask_mail import Message
    from flask import render_template
    from sqlalchemy import func
    from datetime import date
    from calendar import monthrange

    today = date.today()
    if today.month == 1:
        last_month, last_year = 12, today.year - 1
    else:
        last_month, last_year = today.month - 1, today.year

    _, last_day   = monthrange(last_year, last_month)
    period_start  = date(last_year, last_month, 1)
    period_end    = date(last_year, last_month, last_day)

    from datetime import datetime as dt
    start_dt = dt.combine(period_start, dt.min.time())
    end_dt   = dt.combine(period_end,   dt.max.time())

    treks_conducted = Trek.query.filter(
        Trek.status == 'Completed',
        Trek.end_date >= period_start,
        Trek.end_date <= period_end,
    ).count()

    users_participated = (
        Booking.query.join(Trek)
        .filter(
            Trek.end_date >= period_start,
            Trek.end_date <= period_end,
            Booking.status == 'Completed',
        )
        .with_entities(func.count(func.distinct(Booking.user_id)))
        .scalar()
    ) or 0

    total_bookings = Booking.query.filter(
        Booking.booking_date >= start_dt,
        Booking.booking_date <= end_dt,
    ).count()

    new_users = User.query.filter(
        User.role == 'trekker',
        User.created_at >= start_dt,
        User.created_at <= end_dt,
    ).count()

    popular_treks = (
        Booking.query
        .join(Trek)
        .filter(
            Booking.booking_date >= start_dt,
            Booking.booking_date <= end_dt,
        )
        .with_entities(Trek.trek_name, Trek.location, func.count(Booking.id).label('cnt'))
        .group_by(Trek.id)
        .order_by(func.count(Booking.id).desc())
        .limit(5)
        .all()
    )

    admin = User.query.filter_by(role='admin').first()
    if not admin:
        return "No admin found"

    report = {
        'month':               period_start.strftime('%B %Y'),
        'treks_conducted':     treks_conducted,
        'users_participated':  users_participated,
        'total_bookings':      total_bookings,
        'new_users':           new_users,
        'popular_treks':       [{'name': t[0], 'location': t[1], 'bookings': t[2]} for t in popular_treks],
    }

    try:
        msg = Message(
            subject=f"TMA Monthly Activity Report — {report['month']}",
            recipients=[admin.email],
            html=render_template('emails/monthly_report.html', **report),
        )
        mail.send(msg)
        return f"Monthly report sent to {admin.email}"
    except Exception as e:
        return f"Failed to send monthly report: {e}"
