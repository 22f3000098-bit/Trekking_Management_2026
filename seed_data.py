
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import User, StaffProfile, TrekkerProfile, Trek, Booking, Notification
from werkzeug.security import generate_password_hash
from datetime import date, datetime, timedelta
import random
import string


def booking_ref():
    chars = string.ascii_uppercase + string.digits
    return 'TMA-' + ''.join(random.choices(chars, k=8))


def staff_code(n):
    return f"STF{date.today().year}{n:04d}"


STAFF = [
    {
        "email": "ravi.sharma@tma.com", "username": "ravi_sharma",
        "password": "Staff@123",
        "profile": {
            "first_name": "Ravi", "last_name": "Sharma",
            "phone": "9876543210", "address": "Dehradun, Uttarakhand",
            "specialization": "High Altitude Trekking",
            "certifications": "IMF Basic Mountaineering Course, First Aid Certified",
            "years_experience": 8,
        }
    },
    {
        "email": "priya.nair@tma.com", "username": "priya_nair",
        "password": "Staff@123",
        "profile": {
            "first_name": "Priya", "last_name": "Nair",
            "phone": "9812345678", "address": "Manali, Himachal Pradesh",
            "specialization": "Snow & Ice Trekking",
            "certifications": "Avalanche Safety Course, Wilderness First Responder",
            "years_experience": 5,
        }
    },
    {
        "email": "arjun.verma@tma.com", "username": "arjun_verma",
        "password": "Staff@123",
        "profile": {
            "first_name": "Arjun", "last_name": "Verma",
            "phone": "9745678901", "address": "Rishikesh, Uttarakhand",
            "specialization": "River Crossings & Forest Trails",
            "certifications": "Wilderness First Aid, Water Safety",
            "years_experience": 6,
        }
    },
    {
        "email": "meena.pillai@tma.com", "username": "meena_pillai",
        "password": "Staff@123",
        "profile": {
            "first_name": "Meena", "last_name": "Pillai",
            "phone": "9623456789", "address": "Munnar, Kerala",
            "specialization": "Western Ghats & Monsoon Treks",
            "certifications": "Jungle Survival Training, First Aid",
            "years_experience": 4,
        }
    },
    {
        "email": "suresh.gupta@tma.com", "username": "suresh_gupta",
        "password": "Staff@123",
        "profile": {
            "first_name": "Suresh", "last_name": "Gupta",
            "phone": "9534567890", "address": "Leh, Ladakh",
            "specialization": "Ladakh & Himalayan Expeditions",
            "certifications": "Advanced Mountaineering, Altitude Sickness Management",
            "years_experience": 12,
        }
    },
]

TREKKERS = [
    {
        "email": "amit.singh@gmail.com", "username": "amit_singh",
        "password": "User@123",
        "profile": {
            "first_name": "Amit", "last_name": "Singh",
            "phone": "9001234567", "gender": "Male",
            "date_of_birth": date(1995, 3, 15),
            "address": "Mumbai, Maharashtra",
            "experience_level": "Intermediate",
            "emergency_contact_name": "Sunita Singh",
            "emergency_contact_phone": "9001234568",
        }
    },
    {
        "email": "kavya.reddy@gmail.com", "username": "kavya_reddy",
        "password": "User@123",
        "profile": {
            "first_name": "Kavya", "last_name": "Reddy",
            "phone": "9112345678", "gender": "Female",
            "date_of_birth": date(1998, 7, 22),
            "address": "Hyderabad, Telangana",
            "experience_level": "Beginner",
            "emergency_contact_name": "Rajesh Reddy",
            "emergency_contact_phone": "9112345679",
        }
    },
    {
        "email": "rohit.mehta@gmail.com", "username": "rohit_mehta",
        "password": "User@123",
        "profile": {
            "first_name": "Rohit", "last_name": "Mehta",
            "phone": "9223456789", "gender": "Male",
            "date_of_birth": date(1990, 11, 8),
            "address": "Pune, Maharashtra",
            "experience_level": "Expert",
            "emergency_contact_name": "Seema Mehta",
            "emergency_contact_phone": "9223456780",
        }
    },
    {
        "email": "ananya.joshi@gmail.com", "username": "ananya_joshi",
        "password": "User@123",
        "profile": {
            "first_name": "Ananya", "last_name": "Joshi",
            "phone": "9334567890", "gender": "Female",
            "date_of_birth": date(1997, 5, 30),
            "address": "Bangalore, Karnataka",
            "experience_level": "Intermediate",
            "emergency_contact_name": "Vinod Joshi",
            "emergency_contact_phone": "9334567891",
        }
    },
    {
        "email": "deepak.kumar@gmail.com", "username": "deepak_kumar",
        "password": "User@123",
        "profile": {
            "first_name": "Deepak", "last_name": "Kumar",
            "phone": "9445678901", "gender": "Male",
            "date_of_birth": date(1993, 9, 12),
            "address": "Delhi, NCR",
            "experience_level": "Beginner",
            "emergency_contact_name": "Geeta Kumar",
            "emergency_contact_phone": "9445678902",
        }
    },
    {
        "email": "sanya.patel@gmail.com", "username": "sanya_patel",
        "password": "User@123",
        "profile": {
            "first_name": "Sanya", "last_name": "Patel",
            "phone": "9556789012", "gender": "Female",
            "date_of_birth": date(1999, 1, 18),
            "address": "Ahmedabad, Gujarat",
            "experience_level": "Beginner",
            "emergency_contact_name": "Harish Patel",
            "emergency_contact_phone": "9556789013",
        }
    },
    {
        "email": "nikhil.rao@gmail.com", "username": "nikhil_rao",
        "password": "User@123",
        "profile": {
            "first_name": "Nikhil", "last_name": "Rao",
            "phone": "9667890123", "gender": "Male",
            "date_of_birth": date(1988, 4, 25),
            "address": "Chennai, Tamil Nadu",
            "experience_level": "Expert",
            "emergency_contact_name": "Lakshmi Rao",
            "emergency_contact_phone": "9667890124",
        }
    },
    {
        "email": "pooja.thakur@gmail.com", "username": "pooja_thakur",
        "password": "User@123",
        "profile": {
            "first_name": "Pooja", "last_name": "Thakur",
            "phone": "9778901234", "gender": "Female",
            "date_of_birth": date(2000, 8, 3),
            "address": "Jaipur, Rajasthan",
            "experience_level": "Intermediate",
            "emergency_contact_name": "Ramesh Thakur",
            "emergency_contact_phone": "9778901235",
        }
    },
]

TREKS = [
    {
        "trek_name": "Kedarkantha Winter Trek",
        "location": "Uttarkashi, Uttarakhand",
        "description": (
            "One of the finest winter treks in India, Kedarkantha offers stunning snow-capped "
            "views and a summit crossing at 12,500 ft. Perfect for beginners and intermediate trekkers."
        ),
        "difficulty": "Moderate",
        "duration": 6,
        "total_slots": 15,
        "price": 8500.0,
        "altitude_meters": 3810,
        "start_date": date.today() + timedelta(days=14),
        "end_date":   date(2026, 9, 24),
        "meeting_point": "Sankri Village Base Camp",
        "requirement": "Warm clothing, trekking shoes, sleeping bag (−10°C rated), sunscreen.",
        "status": "Open",
        "staff_idx": 0,
    },
    {
        "trek_name": "Hampta Pass Crossing",
        "location": "Manali, Himachal Pradesh",
        "description": (
            "Hampta Pass is a dramatic high-altitude crossover from lush Kullu Valley to the "
            "arid Spiti Valley. Stunning contrasts in landscape over 5 days."
        ),
        "difficulty": "Moderate",
        "duration": 5,
        "total_slots": 12,
        "price": 9200.0,
        "altitude_meters": 4270,
        "start_date": date.today() + timedelta(days=21),
        "end_date":   date(2026, 9, 25),
        "meeting_point": "Jobra Camp, Manali",
        "requirement": "Good physical fitness, layered clothing, trekking poles.",
        "status": "Open",
        "staff_idx": 1,
    },
    {
        "trek_name": "Valley of Flowers Trek",
        "location": "Chamoli, Uttarakhand",
        "description": (
            "A UNESCO World Heritage Site trek through a stunning valley blooming with alpine "
            "wildflowers. Gentle terrain makes it ideal for all ages."
        ),
        "difficulty": "Easy",
        "duration": 4,
        "total_slots": 20,
        "price": 6500.0,
        "altitude_meters": 3658,
        "start_date": date.today() + timedelta(days=30),
        "end_date":   date(2026, 9, 26),
        "meeting_point": "Govindghat, NH58",
        "requirement": "Rainwear, comfortable trekking shoes, light backpack.",
        "status": "Open",
        "staff_idx": 2,
    },
    {
        "trek_name": "Markha Valley Expedition",
        "location": "Leh, Ladakh",
        "description": (
            "A remote high-altitude trek through ancient villages, Buddhist monasteries, and "
            "dramatic landscapes of the Markha Valley in Ladakh."
        ),
        "difficulty": "Hard",
        "duration": 8,
        "total_slots": 10,
        "price": 14500.0,
        "altitude_meters": 5150,
        "start_date": date.today() + timedelta(days=45),
        "end_date":   date(2026, 9, 27),
        "meeting_point": "Leh Market, Ladakh",
        "requirement": "Acclimatization at Leh (2 days), altitude sickness medication, −20°C sleeping bag.",
        "status": "Approved",
        "staff_idx": 4,
    },
    {
        "trek_name": "Kudremukh Peak Trek",
        "location": "Chikkamagaluru, Karnataka",
        "description": (
            "Trek through the lush forests of the Kudremukh National Park to reach the "
            "horse-faced peak at 1894m. Rich biodiversity and stunning Western Ghats scenery."
        ),
        "difficulty": "Moderate",
        "duration": 3,
        "total_slots": 18,
        "price": 4500.0,
        "altitude_meters": 1894,
        "start_date": date.today() + timedelta(days=10),
        "end_date":   date(2026, 9, 28),
        "meeting_point": "Kudremukh Forest Department Office",
        "requirement": "Forest permit (arranged by staff), leech socks, rain gear.",
        "status": "Open",
        "staff_idx": 3,
    },
    {
        "trek_name": "Roopkund Skeleton Lake Trek",
        "location": "Chamoli, Uttarakhand",
        "description": (
            "One of India's most mysterious treks, culminating at the glacial Roopkund Lake "
            "at 5,029m, known for the ancient human skeletons found around its shore."
        ),
        "difficulty": "Hard",
        "duration": 7,
        "total_slots": 12,
        "price": 12000.0,
        "altitude_meters": 5029,
        "start_date": date.today() - timedelta(days=30),
        "end_date":   date(2026, 9, 29),
        "meeting_point": "Lohajung Village, Tharali",
        "requirement": "Excellent fitness, full winter gear, crampons.",
        "status": "Completed",
        "staff_idx": 0,
    },
    {
        "trek_name": "Chopta Tungnath Trek",
        "location": "Rudraprayag, Uttarakhand",
        "description": (
            "Visit Tungnath, the highest Shiva temple in the world at 3,680m, and continue "
            "to Chandrashila peak for a 360° panoramic Himalayan view."
        ),
        "difficulty": "Easy",
        "duration": 2,
        "total_slots": 25,
        "price": 3500.0,
        "altitude_meters": 4090,
        "start_date": date.today() + timedelta(days=7),
        "end_date":   date(2026, 9, 30),
        "meeting_point": "Chopta Bus Stand",
        "requirement": "Light backpack, windproof jacket, torch.",
        "status": "Open",
        "staff_idx": 2,
    },
    {
        "trek_name": "Brahmatal Winter Trek",
        "location": "Chamoli, Uttarakhand",
        "description": (
            "Brahmatal offers a pristine winter camping experience with frozen lake views "
            "and spectacular vistas of Mt. Trishul and Nanda Ghunti."
        ),
        "difficulty": "Moderate",
        "duration": 5,
        "total_slots": 14,
        "price": 7800.0,
        "altitude_meters": 3862,
        "start_date": date.today() - timedelta(days=60),
        "end_date":   date(2026, 9, 24),
        "meeting_point": "Lohajung, NH534",
        "requirement": "−15°C sleeping bag, gaiters, trekking poles.",
        "status": "Completed",
        "staff_idx": 1,
    },
]


def run():
    app = create_app()
    with app.app_context():
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            print("[!] Admin not found. Run app.py first to seed the admin.")
            return

        print("\n── Creating Staff ─────────────────────────────────────────")
        staff_profiles = []
        for i, sd in enumerate(STAFF, start=1):
            existing = User.query.filter_by(email=sd['email']).first()
            if existing:
                print(f"  SKIP  {sd['email']}  (already exists)")
                staff_profiles.append(existing.staff_profile)
                continue

            user = User(
                email=sd['email'],
                username=sd['username'],
                password_hash=generate_password_hash(sd['password'], method='pbkdf2:sha256'),
                role='staff',
                is_active=True,
                is_blacklisted=False,
            )
            db.session.add(user)
            db.session.flush()

            code = staff_code(i)
            sp = StaffProfile(
                user_id=user.id,
                staff_code=code,
                status='Active',
                **sd['profile'],
            )
            db.session.add(sp)
            db.session.flush()
            staff_profiles.append(sp)
            print(f"  OK    {sd['email']}  [{code}]")

        db.session.commit()

        print("\n── Creating Trekkers ─────────────────────────────────────")
        trekker_users = []
        for td in TREKKERS:
            existing = User.query.filter_by(email=td['email']).first()
            if existing:
                print(f"  SKIP  {td['email']}  (already exists)")
                trekker_users.append(existing)
                continue

            user = User(
                email=td['email'],
                username=td['username'],
                password_hash=generate_password_hash(td['password'], method='pbkdf2:sha256'),
                role='trekker',
                is_active=True,
                is_blacklisted=False,
            )
            db.session.add(user)
            db.session.flush()

            profile_data = dict(td['profile'])
            tp = TrekkerProfile(user_id=user.id, **profile_data)
            db.session.add(tp)
            db.session.flush()
            trekker_users.append(user)
            print(f"  OK    {td['email']}")

        db.session.commit()

        print("\n── Creating Treks ─────────────────────────────────────────")
        trek_objects = []
        for td in TREKS:
            existing = Trek.query.filter_by(trek_name=td['trek_name']).first()
            if existing:
                print(f"  SKIP  {td['trek_name']}  (already exists)")
                trek_objects.append(existing)
                continue

            staff_sp = staff_profiles[td['staff_idx']] if staff_profiles else None
            total    = td['total_slots']

            trek = Trek(
                trek_name=td['trek_name'],
                location=td['location'],
                description=td['description'],
                difficulty=td['difficulty'],
                duration=td['duration'],
                total_slots=total,
                available_slots=total,
                price=td['price'],
                altitude_meters=td['altitude_meters'],
                start_date=td['start_date'],
                end_date=td['end_date'],
                meeting_point=td['meeting_point'],
                requirement=td['requirement'],
                status=td['status'],
                assigned_staff_id=staff_sp.id if staff_sp else None,
                created_by=admin.id,
            )
            db.session.add(trek)
            db.session.flush()
            trek_objects.append(trek)
            print(f"  OK    {td['trek_name']}  [{td['status']}]")

        db.session.commit()

        print("\n── Creating Bookings ──────────────────────────────────────")
        booking_pairs = [
            (0, 0, 'Booked'),
            (1, 0, 'Booked'),
            (2, 1, 'Booked'),
            (3, 2, 'Booked'),
            (4, 4, 'Booked'),
            (5, 6, 'Booked'),
            (6, 7, 'Booked'),
            (7, 6, 'Booked'),
            (0, 5, 'Completed'),
            (2, 5, 'Completed'),
            (6, 5, 'Completed'),
            (1, 7, 'Completed'),
            (3, 7, 'Completed'),
            (4, 1, 'Cancelled'),
        ]

        for trekker_idx, trek_idx, bstatus in booking_pairs:
            if trekker_idx >= len(trekker_users) or trek_idx >= len(trek_objects):
                continue
            user  = trekker_users[trekker_idx]
            trek  = trek_objects[trek_idx]

            if Booking.query.filter_by(user_id=user.id, trek_id=trek.id).first():
                continue

            ref = booking_ref()
            b = Booking(
                booking_ref=ref,
                user_id=user.id,
                trek_id=trek.id,
                booking_date=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                status=bstatus,
                payment_status='Paid' if bstatus in ('Completed', 'Booked') else 'Refunded',
                amount_paid=trek.price,
                cancelled_at=datetime.utcnow() - timedelta(days=3) if bstatus == 'Cancelled' else None,
                cancellation_reason="Change of plans" if bstatus == 'Cancelled' else None,
            )

            if bstatus == 'Booked' and trek.available_slots > 0:
                trek.available_slots -= 1

            db.session.add(b)

            notif = Notification(
                recipient_user_id=user.id,
                title='Booking Confirmed' if bstatus != 'Cancelled' else 'Booking Cancelled',
                content=f'Your booking for "{trek.trek_name}" — Ref: {ref}',
                notification_type='Booking',
                is_read=bstatus in ('Completed', 'Cancelled'),
            )
            db.session.add(notif)

            action = f"[{bstatus}]"
            print(f"  OK    {user.username:20s} → {trek.trek_name[:35]:35s} {action}")

        db.session.commit()

        print("\n──────────────────────────────────────────────────────────")
        print(f"  Staff created/existing  : {User.query.filter_by(role='staff').count()}")
        print(f"  Trekkers created/exist  : {User.query.filter_by(role='trekker').count()}")
        print(f"  Treks total             : {Trek.query.count()}")
        print(f"  Bookings total          : {Booking.query.count()}")
        print("\n  Default passwords:")
        print("    Staff   → Staff@123")
        print("    Trekker → User@123")
        print("──────────────────────────────────────────────────────────\n")
        print("✅ Seed complete!")


if __name__ == '__main__':
    run()
