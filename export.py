from celery import shared_task


@shared_task(name='tasks.export.export_user_bookings')
def export_user_bookings(user_id):
    from extensions import mail
    from models import User, Booking, Notification, db
    from flask_mail import Message
    from flask import current_app
    from datetime import datetime
    import csv, io, os

    user = User.query.get(user_id)
    if not user:
        return "User not found"

    bookings = (
        Booking.query
        .filter_by(user_id=user_id)
        .order_by(Booking.booking_date.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'User ID', 'Booking Ref', 'Trek Name', 'Location', 'Difficulty',
        'Duration (Days)', 'Start Date', 'End Date',
        'Booking Date', 'Booking Status', 'Payment Status', 'Amount Paid',
    ])

    for b in bookings:
        t = b.trek
        writer.writerow([
            b.user_id, b.booking_ref,
            t.trek_name, t.location, t.difficulty, t.duration,
            t.start_date.strftime('%Y-%m-%d') if t.start_date else '',
            t.end_date.strftime('%Y-%m-%d')   if t.end_date   else '',
            b.booking_date.strftime('%Y-%m-%d %H:%M') if b.booking_date else '',
            b.status, b.payment_status or 'N/A', b.amount_paid or 0,
        ])

    csv_content = output.getvalue()

    exports_folder = current_app.config['EXPORTS_FOLDER']
    filename = f"bookings_user{user_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.csv"
    with open(os.path.join(exports_folder, filename), 'w', newline='') as f:
        f.write(csv_content)

    try:
        msg = Message(
            subject="Your Trekking History Export is Ready",
            recipients=[user.email],
            html=f"""
            <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:#2c7a4b;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                <h2>⛰️ Export Ready — TMA</h2>
              </div>
              <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px;">
                <p>Hi <strong>{user.username}</strong>,</p>
                <p>Your trekking history export is attached. It contains <strong>{len(bookings)}</strong> booking record(s).</p>
                <p>Happy Trekking!<br><strong>TMA Team</strong></p>
              </div>
            </body></html>
            """,
        )
        msg.attach(filename, 'text/csv', csv_content)
        mail.send(msg)
    except Exception as e:
        print(f"[EXPORT] Email failed for user {user_id}: {e}")

    notif = Notification(
        recipient_user_id=user_id,
        title='Export Ready',
        content=f'Your booking history ({len(bookings)} record(s)) has been exported and sent to {user.email}.',
        notification_type='System',
    )
    db.session.add(notif)
    db.session.commit()

    return f"Exported {len(bookings)} bookings for user {user_id}"
