from celery import shared_task
from datetime import datetime, timedelta


@shared_task(name='tasks.reminders.send_daily_reminders')
def send_daily_reminders():
    from extensions import mail
    from models import Booking, Trek
    from flask_mail import Message
    from flask import render_template

    today         = datetime.utcnow().date()
    reminder_date = today + timedelta(days=3)

    bookings = (
        Booking.query.join(Trek)
        .filter(
            Trek.start_date >= today,
            Trek.start_date <= reminder_date,
            Booking.status == 'Booked',
        )
        .all()
    )

    sent = 0
    for booking in bookings:
        try:
            user  = booking.trekker
            trek  = booking.trek
            days  = (trek.start_date - today).days

            msg = Message(
                subject=f"Reminder: Your trek '{trek.trek_name}' starts "
                        f"{'today' if days == 0 else f'in {days} day(s)'}!",
                recipients=[user.email],
                html=render_template(
                    'emails/reminder.html',
                    user=user, trek=trek, booking=booking, days_left=days,
                ),
            )
            mail.send(msg)
            sent += 1
        except Exception as e:
            print(f"[REMINDER] Failed for {booking.trekker.email}: {e}")

    return f"Sent {sent} reminder(s)"
