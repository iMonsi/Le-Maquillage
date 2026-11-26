"""
SPRINT 1 PRODUCT BACKLOG COVERAGE:
- [ID 001] Client, Receptionist, Stylist, Admin : Login & Role-Based Access
- [ID 002] Client       : Book appointments & view my bookings (with conflict checks)
- [ID 010] Stylist      : View assigned appointments
- [ID 011] Receptionist : View stylist schedules and availability
- [ID 012] Receptionist : Set stylist break times and availability schedules
(Also includes [ID 003] View available salon services and prices under Client menu)

SPRINT 2 PRODUCT BACKLOG COVERAGE:
- [ID 003] Receptionist : View daily appointments
- [ID 004] Receptionist : View walk-in clients
- [ID 005] Receptionist : Manage walk-in queues & estimated waiting times
"""
from datetime import datetime, time, timedelta
import getpass
import hashlib
import hmac
import os


# ==============================================================================
# [SPRINT 1 - ID 001] PASSWORD HASHING (Standard library only)
# ==============================================================================
def hash_password(password, salt=None):
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return salt.hex() + "$" + digest.hex()


def check_password(password, stored):
    salt_hex, digest_hex = stored.split("$")
    new_hash = hash_password(password, bytes.fromhex(salt_hex))
    return hmac.compare_digest(new_hash, stored)


# ==============================================================================
# TEMPORARY DATA (Mirrors `users`, `services`, `appointments`, `queue_records`)
# ==============================================================================
# [SPRINT 1 - ID 001, ID 011, ID 012] Mirrors the `users` table in ERD
USERS = [
    {
        "user_id": 1,
        "username": "admin",
        "email": "admin",
        "full_name": "Salon Admin",
        "role": "admin",
        "is_active": True,
        "password_hash": hash_password("admin123"),
    },
    {
        "user_id": 2,
        "username": "reception",
        "email": "reception.test",
        "full_name": "Front Desk",
        "role": "receptionist",
        "is_active": True,
        "password_hash": hash_password("reception123"),
    },
    {
        "user_id": 3,
        "username": "stylist",
        "email": "stylist.test",
        "full_name": "Lead Stylist",
        "role": "stylist",
        "is_active": True,
        # [SPRINT 1 - ID 002, ID 011, ID 012] Stylist working hours & break times
        "work_start": time(9, 0),
        "work_end": time(18, 0),
        "break_start": time(12, 0),
        "break_end": time(13, 0),
        "password_hash": hash_password("stylist123"),
    },
    {
        "user_id": 4,
        "username": "client",
        "email": "client.test",
        "full_name": "Sample Client",
        "role": "client",
        "is_active": True,
        "password_hash": hash_password("client123"),
    },
    {
        "user_id": 5,
        "username": "inactive",
        "email": "inactive.test",
        "full_name": "Inactive User",
        "role": "client",
        "is_active": False,
        "password_hash": hash_password("inactive123"),
    },
]

# [SPRINT 1 - ID 002 & ID 003] Mirrors the `services` table in ERD
SERVICES = [
    {"service_id": 1, "service_name": "Haircut & Styling", "category": "Haircut", "price": 350.00, "duration_minutes": 45},
    {"service_id": 2, "service_name": "Full Hair Coloring", "category": "Coloring", "price": 1800.00, "duration_minutes": 120},
    {"service_id": 3, "service_name": "Keratin Hair Treatment", "category": "Treatment", "price": 1500.00, "duration_minutes": 90},
    {"service_id": 4, "service_name": "Basic Grooming", "category": "Grooming", "price": 250.00, "duration_minutes": 30},
]

# [SPRINT 1 - ID 002, ID 010, ID 011] & [SPRINT 2 - ID 003] Mirrors `appointments`
APPOINTMENTS = []

# [SPRINT 2 - ID 004 & ID 005] Starts empty; populated only when receptionist registers walk-ins
QUEUE_RECORDS = []

ROLE_MENU = {
    "client": [
        "Services & Prices",         # [SPRINT 1 - ID 003]
        "Book Appointment",          # [SPRINT 1 - ID 002]
        "My Appointments",           # [SPRINT 1 - ID 002]
        "Hairstyle Recommendation",  # (Sprint 3 - ID 007/008)
        "Before & After Gallery",    # (Sprint 3 - ID 022)
    ],
    "receptionist": [
        "Daily Appointments",        # [SPRINT 2 - ID 003]
        "Walk-in Queue",             # [SPRINT 2 - ID 004 & ID 005]
        "Stylist Schedules",         # [SPRINT 1 - ID 011 & ID 012]
        "Client Profiles",           # (Sprint 2 - ID 023)
        "Payments",                  # (Sprint 4 - ID 025)
        "Reports",                   # (Sprint 4 - ID 013/014)
    ],
    "stylist": [
        "My Appointments",           # [SPRINT 1 - ID 010]
        "Client Profiles",           # (Sprint 2 - ID 006)
        "Gallery Upload",            # (Sprint 3 - ID 009)
        "Product Usage",             # (Sprint 3 - ID 016)
    ],
    "admin": [
        "User Accounts",             # (Sprint 4 - ID 026)
        "Inventory",                 # (Sprint 4 - ID 019)
        "Services & Prices",         # (Admin catalog view)
        "Reports",                   # (Sprint 4)
    ],
}


# ==============================================================================
# [SPRINT 1 - ID 001] LOGIN & AUTHENTICATION LOGIC
# ==============================================================================
def find_user(identifier):
    identifier = identifier.strip().lower()
    for user in USERS:
        if identifier in (user["username"].lower(), user["email"].lower()):
            return user
    return None


def authenticate(identifier, password):
    if not identifier.strip() or not password:
        return None, "Enter your username or email and your password."

    user = find_user(identifier)
    if user is None or not check_password(password, user["password_hash"]):
        return None, "Incorrect username/email or password."
    if not user["is_active"]:
        return None, "This account is inactive. Please contact the salon."
    return user, None


def ask_password(prompt):
    try:
        return getpass.getpass(prompt)
    except (EOFError, KeyboardInterrupt):
        raise
    except Exception:
        return input(prompt)


def login():
    identifier = input("Username or email: ")
    password = ask_password("Password: ")

    user, error = authenticate(identifier, password)
    if user:
        return user

    print(f" ! {error}")
    return None


# ==============================================================================
# [SPRINT 1 - ID 002, ID 011, ID 012] SHARED SCHEDULING & CONFLICT VALIDATION
# ==============================================================================
def is_slot_available(stylist, start_dt, duration_minutes):
    if not stylist.get("is_active", False):
        return False, f"{stylist['full_name']} is currently marked unavailable."

    end_dt = start_dt + timedelta(minutes=duration_minutes)

    if end_dt.date() != start_dt.date():
        return False, "Service extends past salon operating day."

    # 1. Check stylist working hours
    if start_dt.time() < stylist["work_start"] or end_dt.time() > stylist["work_end"]:
        return False, (
            f"Outside {stylist['full_name']}'s working hours "
            f"({stylist['work_start'].strftime('%H:%M')} - {stylist['work_end'].strftime('%H:%M')})."
        )

    # 2. Check stylist break time overlap
    break_start = datetime.combine(start_dt.date(), stylist["break_start"])
    break_end = datetime.combine(start_dt.date(), stylist["break_end"])
    if start_dt < break_end and end_dt > break_start:
        return False, (
            f"Conflicts with {stylist['full_name']}'s break "
            f"({stylist['break_start'].strftime('%H:%M')} - {stylist['break_end'].strftime('%H:%M')})."
        )

    # 3. Check existing non-cancelled appointments for this stylist
    for appt in APPOINTMENTS:
        if appt["stylist_id"] == stylist["user_id"] and appt["status"] != "Cancelled":
            if start_dt < appt["appointment_end"] and end_dt > appt["appointment_start"]:
                return False, (
                    f"Conflicts with an existing booking "
                    f"({appt['appointment_start'].strftime('%H:%M')} - {appt['appointment_end'].strftime('%H:%M')})."
                )

    return True, None


def get_available_slots(stylist, target_date, duration_minutes=30, step_minutes=30):
    if not stylist.get("is_active", False):
        return []

    available = []
    cursor = datetime.combine(target_date, stylist["work_start"])
    shift_end = datetime.combine(target_date, stylist["work_end"])

    while cursor + timedelta(minutes=duration_minutes) <= shift_end:
        ok, _ = is_slot_available(stylist, cursor, duration_minutes)
        if ok:
            available.append(cursor.strftime("%H:%M"))
        cursor += timedelta(minutes=step_minutes)
    return available


# ==============================================================================
# [SPRINT 1 - ID 002 & ID 003] CLIENT FEATURES
# ==============================================================================
def view_services():
    print("\n--- SALON SERVICES & PRICES ---")
    if not SERVICES:
        print(" No services available at the moment.")
        return
    for s in SERVICES:
        print(
            f" {s['service_id']}. {s['service_name']} [{s['category']}] "
            f"- PHP {s['price']:.2f} ({s['duration_minutes']} mins)"
        )


def book_appointment(client):
    print("\n--- BOOK AN APPOINTMENT ---")
    if not SERVICES:
        print(" ! No salon services are currently available.")
        return

    for s in SERVICES:
        print(f" {s['service_id']}. {s['service_name']} ({s['duration_minutes']} mins) - PHP {s['price']:.2f}")
    svc_choice = input("Select Service ID: ").strip()
    service = next((s for s in SERVICES if str(s["service_id"]) == svc_choice), None)
    if not service:
        print(" ! Invalid service selection.")
        return

    stylists = [u for u in USERS if u["role"] == "stylist" and u["is_active"]]
    if not stylists:
        print(" ! No stylists are currently available.")
        return
    print("\nAvailable Stylists:")
    for st in stylists:
        print(
            f" {st['user_id']}. {st['full_name']} "
            f"(Hours: {st['work_start'].strftime('%H:%M')}-{st['work_end'].strftime('%H:%M')}, "
            f"Break: {st['break_start'].strftime('%H:%M')}-{st['break_end'].strftime('%H:%M')})"
        )
    st_choice = input("Select Stylist ID: ").strip()
    stylist = next((st for st in stylists if str(st["user_id"]) == st_choice), None)
    if not stylist:
        print(" ! Invalid stylist selection.")
        return

    date_str = input("Preferred Date (YYYY-MM-DD): ").strip()
    time_str = input("Preferred Start Time (HH:MM, 24-hour): ").strip()
    if not date_str or not time_str:
        print(" ! Incomplete information. Date and time are required.")
        return

    try:
        start_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        print(" ! Invalid date or time format. Use YYYY-MM-DD and HH:MM.")
        return

    available, reason = is_slot_available(stylist, start_dt, service["duration_minutes"])
    if not available:
        print(f" ! Unavailable Schedule: {reason}")
        alternatives = get_available_slots(stylist, start_dt.date(), service["duration_minutes"])
        if alternatives:
            print(f"   Available times on {date_str}: {', '.join(alternatives)}")
        else:
            print(f"   No available slots left for {stylist['full_name']} on {date_str}.")
        return

    end_dt = start_dt + timedelta(minutes=service["duration_minutes"])
    new_appt = {
        "appointment_id": len(APPOINTMENTS) + 1,
        "client_id": client["user_id"],
        "stylist_id": stylist["user_id"],
        "service_id": service["service_id"],
        "appointment_start": start_dt,
        "appointment_end": end_dt,
        "status": "Confirmed",
    }
    APPOINTMENTS.append(new_appt)

    print("\nAppointment Confirmed!")
    print(f" Booking ID : #{new_appt['appointment_id']}")
    print(f" Service    : {service['service_name']} (PHP {service['price']:.2f})")
    print(f" Stylist    : {stylist['full_name']}")
    print(f" Schedule   : {start_dt.strftime('%Y-%m-%d %H:%M')} - {end_dt.strftime('%H:%M')}")
    print(f" Status     : {new_appt['status']}")


def view_my_appointments(client):
    print("\n--- MY APPOINTMENTS ---")
    my_appts = [a for a in APPOINTMENTS if a["client_id"] == client["user_id"]]
    if not my_appts:
        print(" You have no booked appointments.")
        return

    for a in sorted(my_appts, key=lambda x: x["appointment_start"]):
        svc = next((s["service_name"] for s in SERVICES if s["service_id"] == a["service_id"]), "Unknown")
        sty = next((u["full_name"] for u in USERS if u["user_id"] == a["stylist_id"]), "Unknown")
        print(
            f" #{a['appointment_id']} | {a['appointment_start'].strftime('%Y-%m-%d %H:%M')}-"
            f"{a['appointment_end'].strftime('%H:%M')} | {svc} | Stylist: {sty} | [{a['status']}]"
        )


# ==============================================================================
# [SPRINT 1 - ID 010] STYLIST FEATURES
# ==============================================================================
def view_assigned_appointments(stylist):
    print("\n--- MY ASSIGNED APPOINTMENTS ---")
    assigned = [a for a in APPOINTMENTS if a["stylist_id"] == stylist["user_id"]]
    if not assigned:
        print(" No appointments are currently assigned to you.")
        return

    for a in sorted(assigned, key=lambda x: x["appointment_start"]):
        cli = next((u["full_name"] for u in USERS if u["user_id"] == a["client_id"]), "Unknown Client")
        svc = next((s["service_name"] for s in SERVICES if s["service_id"] == a["service_id"]), "Unknown Service")
        print(
            f" #{a['appointment_id']} | Date: {a['appointment_start'].strftime('%Y-%m-%d')} | "
            f"Time: {a['appointment_start'].strftime('%H:%M')}-{a['appointment_end'].strftime('%H:%M')} | "
            f"Client: {cli} | Service: {svc} | [{a['status']}]"
        )


# ==============================================================================
# [SPRINT 1 - ID 011 & ID 012] RECEPTIONIST STYLIST SCHEDULE FEATURES
# ==============================================================================
def view_stylist_schedules():
    print("\n--- STYLIST SCHEDULES & AVAILABILITY ---")
    date_str = input("Enter date to inspect (YYYY-MM-DD, leave blank for today): ").strip()
    if not date_str:
        target_date = datetime.now().date()
    else:
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            print(" ! Invalid date format. Use YYYY-MM-DD.")
            return

    stylists = [u for u in USERS if u["role"] == "stylist"]
    if not stylists:
        print(" No stylists found in the system.")
        return

    print(f"\nSchedule Overview for {target_date.strftime('%Y-%m-%d')}:")
    for st in stylists:
        status_label = "AVAILABLE" if st["is_active"] else "UNAVAILABLE"
        print("-" * 56)
        print(f" Stylist ID {st['user_id']}: {st['full_name']} [{status_label}]")
        print(
            f" Working Hours : {st['work_start'].strftime('%H:%M')} - {st['work_end'].strftime('%H:%M')} | "
            f"Break: {st['break_start'].strftime('%H:%M')} - {st['break_end'].strftime('%H:%M')}"
        )

        occupied = [
            a for a in APPOINTMENTS
            if a["stylist_id"] == st["user_id"]
            and a["status"] != "Cancelled"
            and a["appointment_start"].date() == target_date
        ]
        if occupied:
            print(" Occupied Slots:")
            for a in sorted(occupied, key=lambda x: x["appointment_start"]):
                cli = next((u["full_name"] for u in USERS if u["user_id"] == a["client_id"]), "Unknown")
                svc = next((s["service_name"] for s in SERVICES if s["service_id"] == a["service_id"]), "Unknown")
                print(
                    f"   * {a['appointment_start'].strftime('%H:%M')}-{a['appointment_end'].strftime('%H:%M')} "
                    f"({svc} - {cli})"
                )
        else:
            print(" Occupied Slots: None")

        free_slots = get_available_slots(st, target_date, duration_minutes=30, step_minutes=30)
        print(f" Available Slots: {', '.join(free_slots) if free_slots else 'None'}")
    print("-" * 56)


def set_stylist_schedule():
    print("\n--- SET STYLIST BREAK TIMES & AVAILABILITY ---")
    stylists = [u for u in USERS if u["role"] == "stylist"]
    if not stylists:
        print(" No stylists found in the system.")
        return

    for st in stylists:
        status_label = "Available" if st["is_active"] else "Unavailable"
        print(
            f" {st['user_id']}. {st['full_name']} | "
            f"Hours: {st['work_start'].strftime('%H:%M')}-{st['work_end'].strftime('%H:%M')} | "
            f"Break: {st['break_start'].strftime('%H:%M')}-{st['break_end'].strftime('%H:%M')} | "
            f"Status: {status_label}"
        )

    st_choice = input("\nSelect Stylist ID to update: ").strip()
    stylist = next((st for st in stylists if str(st["user_id"]) == st_choice), None)
    if not stylist:
        print(" ! Invalid stylist selection.")
        return

    print("\nWhat would you like to update?")
    print(" 1. Working Hours")
    print(" 2. Break Time")
    print(" 3. Availability Status (Active / Unavailable)")
    action = input("Choose option (1-3): ").strip()

    try:
        if action == "1":
            ws_str = input("New Work Start (HH:MM, 24-hour): ").strip()
            we_str = input("New Work End (HH:MM, 24-hour): ").strip()
            new_ws = datetime.strptime(ws_str, "%H:%M").time()
            new_we = datetime.strptime(we_str, "%H:%M").time()
            if new_ws >= new_we:
                print(" ! Work start must be earlier than work end.")
                return
            if not (new_ws <= stylist["break_start"] and stylist["break_end"] <= new_we):
                print(" ! Existing break time falls outside the new working hours. Update break time too.")
                return
            stylist["work_start"] = new_ws
            stylist["work_end"] = new_we
            print(f" Updated {stylist['full_name']}'s working hours to {ws_str} - {we_str}.")

        elif action == "2":
            bs_str = input("New Break Start (HH:MM, 24-hour): ").strip()
            be_str = input("New Break End (HH:MM, 24-hour): ").strip()
            new_bs = datetime.strptime(bs_str, "%H:%M").time()
            new_be = datetime.strptime(be_str, "%H:%M").time()
            if new_bs >= new_be:
                print(" ! Break start must be earlier than break end.")
                return
            if new_bs < stylist["work_start"] or new_be > stylist["work_end"]:
                print(" ! Break time must fall within the stylist's working hours.")
                return
            stylist["break_start"] = new_bs
            stylist["break_end"] = new_be
            print(f" Updated {stylist['full_name']}'s break time to {bs_str} - {be_str}.")

        elif action == "3":
            avail_input = input("Set stylist as available for bookings? (y/n): ").strip().lower()
            if avail_input not in ("y", "n"):
                print(" ! Enter 'y' or 'n'.")
                return
            stylist["is_active"] = (avail_input == "y")
            state = "AVAILABLE" if stylist["is_active"] else "UNAVAILABLE"
            print(f" {stylist['full_name']} is now marked as {state}.")

        else:
            print(" ! Invalid option.")
    except ValueError:
        print(" ! Invalid time format. Use HH:MM (e.g., 12:00).")


def manage_stylist_schedules_menu():
    while True:
        print("\n--- STYLIST SCHEDULES MENU ---")
        print(" 1. View Stylist Schedules & Availability")
        print(" 2. Set Stylist Break Times & Availability")
        print(" 0. Back to Dashboard")
        sub = input("Choose an option: ").strip()

        if sub == "0":
            return
        elif sub == "1":
            view_stylist_schedules()
        elif sub == "2":
            set_stylist_schedule()
        else:
            print(" ! Invalid choice.")


# ==============================================================================
# [SPRINT 2 - ID 003] RECEPTIONIST: VIEW DAILY APPOINTMENTS
# ==============================================================================
def view_daily_appointments():
    print("\n--- DAILY APPOINTMENTS ---")
    date_str = input("Enter date to view (YYYY-MM-DD, leave blank for today): ").strip()
    if not date_str:
        target_date = datetime.now().date()
    else:
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            print(" ! Invalid date format. Use YYYY-MM-DD.")
            return

    daily = [
        a for a in APPOINTMENTS
        if a["appointment_start"].date() == target_date
    ]
    if not daily:
        print(f" No appointments scheduled for {target_date.strftime('%Y-%m-%d')}.")
        return

    print(f"\nScheduled Appointments for {target_date.strftime('%Y-%m-%d')}:")
    for a in sorted(daily, key=lambda x: x["appointment_start"]):
        cli = next((u["full_name"] for u in USERS if u["user_id"] == a["client_id"]), "Unknown Client")
        svc = next((s["service_name"] for s in SERVICES if s["service_id"] == a["service_id"]), "Unknown Service")
        sty = next((u["full_name"] for u in USERS if u["user_id"] == a["stylist_id"]), "Unknown Stylist")
        print(
            f" #{a['appointment_id']} | Date: {a['appointment_start'].strftime('%Y-%m-%d')} | "
            f"Time: {a['appointment_start'].strftime('%H:%M')}-{a['appointment_end'].strftime('%H:%M')} | "
            f"Client: {cli} | Service: {svc} | Stylist: {sty} | [{a['status']}]"
        )


# ==============================================================================
# [SPRINT 2 - ID 004 & ID 005] RECEPTIONIST: REGISTER, VIEW & MANAGE WALK-INS
# ==============================================================================
def recalculate_queue_wait_times():
    wait_by_stylist = {}
    for q in QUEUE_RECORDS:
        if q["status"] in ("Completed", "Cancelled"):
            q["estimated_wait_minutes"] = 0
            continue
        svc = next((s for s in SERVICES if s["service_id"] == q["service_id"]), None)
        duration = svc["duration_minutes"] if svc else 30
        st_id = q["stylist_id"]
        wait_by_stylist.setdefault(st_id, 0)

        if q["status"] == "In Service":
            q["estimated_wait_minutes"] = 0
            wait_by_stylist[st_id] += duration
        elif q["status"] == "Waiting":
            q["estimated_wait_minutes"] = wait_by_stylist[st_id]
            wait_by_stylist[st_id] += duration


def register_walkin_client():
    print("\n--- REGISTER WALK-IN CLIENT ---")
    client_name = input("Client Name: ").strip()
    if not client_name:
        print(" ! Incomplete Information: Client name is required.")
        return

    duplicate = any(
        q["client_name"].lower() == client_name.lower() and q["status"] in ("Waiting", "In Service")
        for q in QUEUE_RECORDS
    )
    if duplicate:
        print(f" ! Duplicate Queue Entry: {client_name} already has an active entry in the queue.")
        return

    for s in SERVICES:
        print(f" {s['service_id']}. {s['service_name']} ({s['duration_minutes']} mins) - PHP {s['price']:.2f}")
    svc_choice = input("Select Service ID: ").strip()
    service = next((s for s in SERVICES if str(s["service_id"]) == svc_choice), None)
    if not service:
        print(" ! Invalid service selection.")
        return

    stylists = [u for u in USERS if u["role"] == "stylist" and u["is_active"]]
    if not stylists:
        print(" ! No stylists are currently available. Waiting times may be affected.")
        return

    print("\nAvailable Stylists:")
    for st in stylists:
        print(f" {st['user_id']}. {st['full_name']}")
    st_choice = input("Select Stylist ID: ").strip()
    stylist = next((st for st in stylists if str(st["user_id"]) == st_choice), None)
    if not stylist:
        print(" ! Invalid stylist selection.")
        return

    next_id = max((q["queue_id"] for q in QUEUE_RECORDS), default=0) + 1
    next_num = max((q["queue_number"] for q in QUEUE_RECORDS), default=0) + 1

    QUEUE_RECORDS.append({
        "queue_id": next_id,
        "client_name": client_name,
        "service_id": service["service_id"],
        "stylist_id": stylist["user_id"],
        "queue_number": next_num,
        "estimated_wait_minutes": 0,
        "status": "Waiting",
        "created_at": datetime.now().strftime("%H:%M"),
    })
    recalculate_queue_wait_times()
    print(f" Registered walk-in client {client_name} as Queue #{next_num}.")


def view_walkin_clients():
    print("\n--- WALK-IN CLIENTS ---")
    if not QUEUE_RECORDS:
        print(" No walk-in clients registered in the queue yet.")
        return

    recalculate_queue_wait_times()
    for q in QUEUE_RECORDS:
        svc = next((s["service_name"] for s in SERVICES if s["service_id"] == q["service_id"]), "Unknown Service")
        sty = next((u["full_name"] for u in USERS if u["user_id"] == q["stylist_id"]), "Unassigned")
        wait_str = "—" if q["status"] in ("Completed", "Cancelled") else f"{q['estimated_wait_minutes']} mins"
        print(
            f" Queue #{q['queue_number']} | Client: {q['client_name']} | "
            f"Service: {svc} | Stylist: {sty} | Arrived: {q['created_at']} | "
            f"Est. Wait: {wait_str} | [{q['status']}]"
        )


def update_walkin_queue():
    view_walkin_clients()
    if not QUEUE_RECORDS:
        return

    q_choice = input("\nEnter Queue # to update: ").strip()
    idx = next((i for i, q in enumerate(QUEUE_RECORDS) if str(q["queue_number"]) == q_choice), None)
    if idx is None:
        print(" ! Queue entry not found.")
        return

    print(" 1. Move Up in Queue")
    print(" 2. Move Down in Queue")
    print(" 3. Mark as In Service")
    print(" 4. Mark as Completed")
    print(" 5. Remove / Cancel")
    action = input("Choose action (1-5): ").strip()

    if action == "1" and idx > 0:
        QUEUE_RECORDS[idx - 1], QUEUE_RECORDS[idx] = QUEUE_RECORDS[idx], QUEUE_RECORDS[idx - 1]
    elif action == "2" and idx < len(QUEUE_RECORDS) - 1:
        QUEUE_RECORDS[idx + 1], QUEUE_RECORDS[idx] = QUEUE_RECORDS[idx], QUEUE_RECORDS[idx + 1]
    elif action == "3":
        QUEUE_RECORDS[idx]["status"] = "In Service"
    elif action == "4":
        QUEUE_RECORDS[idx]["status"] = "Completed"
    elif action == "5":
        QUEUE_RECORDS[idx]["status"] = "Cancelled"
    else:
        print(" ! Invalid action or position.")
        return

    recalculate_queue_wait_times()
    print(" Walk-in queue updated.")


def manage_walkin_queue_menu():
    while True:
        print("\n--- WALK-IN QUEUE MENU ---")
        print(" 1. View Walk-In Clients")
        print(" 2. Register Walk-In Client")
        print(" 3. Update Queue Position / Status")
        print(" 0. Back to Dashboard")
        sub = input("Choose an option: ").strip()

        if sub == "0":
            return
        elif sub == "1":
            view_walkin_clients()
        elif sub == "2":
            register_walkin_client()
        elif sub == "3":
            update_walkin_queue()
        else:
            print(" ! Invalid choice.")


# ==============================================================================
# [SPRINT 1 - ID 001] ROLE-BASED DASHBOARDS & MAIN LOOP
# ==============================================================================
def show_dashboard(user):
    print("\n" + "=" * 48)
    print(f" Welcome, {user['full_name']}  [{user['role'].upper()}]")
    print("=" * 48)
    role = user["role"]
    menu = ROLE_MENU[role]

    while True:
        print()
        for number, item in enumerate(menu, start=1):
            print(f" {number}. {item}")
        print(" 0. Log out")
        choice = input("\nChoose an option: ").strip()

        if choice == "0":
            print("You have been logged out.")
            return

        if not (choice.isdigit() and 1 <= int(choice) <= len(menu)):
            print("Invalid choice. Enter a number from the list.")
            continue

        selected = menu[int(choice) - 1]

        # --- Client Routes ---
        if role == "client":
            if selected == "Services & Prices":          # [SPRINT 1 - ID 003]
                view_services()
            elif selected == "Book Appointment":         # [SPRINT 1 - ID 002]
                book_appointment(user)
            elif selected == "My Appointments":          # [SPRINT 1 - ID 002]
                view_my_appointments(user)
            else:
                print(f"\n[{selected}] - coming in a later sprint.")

        # --- Receptionist Routes ---
        elif role == "receptionist":
            if selected == "Daily Appointments":         # [SPRINT 2 - ID 003]
                view_daily_appointments()
            elif selected == "Walk-in Queue":            # [SPRINT 2 - ID 004 & ID 005]
                manage_walkin_queue_menu()
            elif selected == "Stylist Schedules":        # [SPRINT 1 - ID 011 & ID 012]
                manage_stylist_schedules_menu()
            else:
                print(f"\n[{selected}] - coming in a later sprint.")

        # --- Stylist Routes ---
        elif role == "stylist":
            if selected == "My Appointments":            # [SPRINT 1 - ID 010]
                view_assigned_appointments(user)
            else:
                print(f"\n[{selected}] - coming in a later sprint.")

        # --- Admin Routes ---
        elif role == "admin":
            if selected == "Services & Prices":
                view_services()
            else:
                print(f"\n[{selected}] - coming in a later sprint.")


def main():
    print("=" * 48)
    print("  LE MAQUILLAGE SALON ")
    print("=" * 48)
    while True:
        user = login()
        if user:
            show_dashboard(user)
        again = input("\nLog in again? (y/n): ").strip().lower()
        if again != "y":
            print("Goodbye!")
            break
        print()


if __name__ == "__main__":
    main()