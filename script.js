/**
 * Le Maquillage Salon - Frontend Logic (script.js)
 * Temporary storage uses localStorage until PHP/MySQL backend is connected.
 *
 * SPRINT 1 COVERAGE:
 * - [ID 001] Login & Role-Based Access + Client Registration
 * - [ID 002] Client: Book Appointments & View My Bookings
 * - [ID 003] Client: View Available Salon Services and Prices
 * - [ID 010] Stylist: View Assigned Appointments
 * - [ID 011] Receptionist: View Stylist Schedules and Availability
 * - [ID 012] Receptionist: Set Stylist Break Times and Availability Schedules
 *
 * SPRINT 2 COVERAGE:
 * - [ID 003] Receptionist: View Daily Appointments
 * - [ID 004] Receptionist: View Walk-In Clients
 * - [ID 005] Receptionist: Manage Walk-In Queues & Estimated Waiting Times
 *
 * SPRINT 3 COVERAGE:
 * - [ID 015] Receptionist: Monitor Salon Product Inventory Levels
 * - [ID 016] Stylist: Record Product Usage During Services (several products per service)
 * - [ID 007] Client: Hairstyle Recommendations from face shape + preferences or popularity
 * - [ID 009] Stylist: Upload and Manage Before-and-After Hairstyle Photos
 * - [ID 022] Client: View Before-and-After Hairstyle Photos
 *
 * SPRINT 4 COVERAGE:
 * - [ID 013] Receptionist: Monitor Daily Sales and Service Reports
 * - [ID 014] Receptionist: Generate Reports for Client Trends and Peak Hours
 * - [ID 024 / 025] Client & Receptionist: Payment Processing
 * - [ID 026] Admin: View, Add, and Modify Other Users' Accounts
 * - Client "My Profile": clients set up and update their own contact details and password
 */

const STORAGE_KEYS = {
  USERS: "lms_users_v3",
  SERVICES: "lms_services_v3",
  APPOINTMENTS: "lms_appointments_v3",
  QUEUE: "lms_queue_v3",
  INVENTORY: "lms_inventory_v3",
  INVENTORY_LOG: "lms_inventory_log_v3",
  HAIRSTYLES: "lms_hairstyles_v4",
  HAIRSTYLE_RECS: "lms_hairstyle_recs_v3",
  GALLERY: "lms_gallery_v3",
  CURRENT_USER: "lms_current_user_v3",
  PAYMENTS: "lms_payments_v1",
};

// ==============================================================================
// TEMPORARY DATA (Mirrors `users`, `services`, `appointments`, `queue_records`)
// ==============================================================================
const DEFAULT_USERS = [
  {
    user_id: 1,
    username: "admin",
    email: "admin",
    full_name: "Salon Admin",
    role: "admin",
    phone: "0917-000-0001",
    is_active: true,
    password: "admin123",
  },
  {
    user_id: 2,
    username: "reception",
    email: "reception.test",
    full_name: "Front Desk",
    role: "receptionist",
    phone: "0917-000-0002",
    is_active: true,
    password: "reception123",
  },
  {
    user_id: 3,
    username: "stylist",
    email: "stylist.test",
    full_name: "Lead Stylist",
    role: "stylist",
    phone: "0917-000-0003",
    is_active: true,
    // [SPRINT 1 - ID 002, ID 011, ID 012] Stylist working hours & break window
    work_start: "09:00",
    work_end: "18:00",
    break_start: "12:00",
    break_end: "13:00",
    password: "stylist123",
  },
  {
    user_id: 4,
    username: "client",
    email: "client.test",
    full_name: "Sample Client",
    role: "client",
    phone: "0917-000-0004",
    is_active: true,
    password: "client123",
  },
  {
    user_id: 5,
    username: "inactive",
    email: "inactive.test",
    full_name: "Inactive User",
    role: "client",
    phone: "0917-000-0005",
    is_active: false,
    password: "inactive123",
  },
];

// [SPRINT 1 - ID 002 & ID 003] Mirrors `services` table in ERD
const DEFAULT_SERVICES = [
  { service_id: 1, service_name: "Haircut & Styling", category: "Haircut", price: 350.0, duration_minutes: 45 },
  { service_id: 2, service_name: "Full Hair Coloring", category: "Coloring", price: 1800.0, duration_minutes: 120 },
  { service_id: 3, service_name: "Keratin Hair Treatment", category: "Treatment", price: 1500.0, duration_minutes: 90 },
  { service_id: 4, service_name: "Basic Grooming", category: "Grooming", price: 250.0, duration_minutes: 30 },
];

// [SPRINT 1 - ID 002, ID 010, ID 011] & [SPRINT 2 - ID 003] Mirrors `appointments` table in ERD
const DEFAULT_APPOINTMENTS = [];

// [SPRINT 2 - ID 004 & ID 005] Starts empty; populated only when receptionist registers walk-ins
const DEFAULT_QUEUE = [];

const DEFAULT_PAYMENTS = [];

// [SPRINT 3 - ID 015 & ID 016] Mirrors `inventory_products` table in ERD (sample stock levels)
const DEFAULT_INVENTORY = [
  { product_id: 1, product_name: "Moisture Shampoo", category: "Shampoo", quantity_in_stock: 20, reorder_level: 5, unit_cost: 180.0 },
  { product_id: 2, product_name: "Repair Conditioner", category: "Conditioner", quantity_in_stock: 18, reorder_level: 5, unit_cost: 200.0 },
  { product_id: 3, product_name: "Hair Color - Natural Black", category: "Hair Color", quantity_in_stock: 12, reorder_level: 4, unit_cost: 150.0 },
  { product_id: 4, product_name: "Hair Color - Chestnut Brown", category: "Hair Color", quantity_in_stock: 4, reorder_level: 4, unit_cost: 150.0 },
  { product_id: 5, product_name: "Developer 6%", category: "Hair Color", quantity_in_stock: 10, reorder_level: 3, unit_cost: 120.0 },
  { product_id: 6, product_name: "Keratin Treatment Solution", category: "Treatment", quantity_in_stock: 6, reorder_level: 2, unit_cost: 650.0 },
  { product_id: 7, product_name: "Styling Gel", category: "Styling", quantity_in_stock: 15, reorder_level: 5, unit_cost: 85.0 },
  { product_id: 8, product_name: "Hair Spray", category: "Styling", quantity_in_stock: 2, reorder_level: 4, unit_cost: 140.0 },
  { product_id: 9, product_name: "Scalp Treatment Ampoule", category: "Treatment", quantity_in_stock: 0, reorder_level: 3, unit_cost: 95.0 },
];

// [SPRINT 3 - ID 016] Mirrors `inventory_transactions` table in ERD (starts empty)
const DEFAULT_INVENTORY_LOG = [];

// [SPRINT 3 - ID 007] Mirrors `hairstyles` table in ERD (rule-based sample list).
const ALL_FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"];
const DEFAULT_HAIRSTYLES = [
  // ---- Female ----
  { hairstyle_id: 1, hairstyle_name: "Long Layers", categories: ["Female"], face_shapes: ["Oval", "Round", "Square", "Heart"], hair_length: "Long", service_ids: [1],
    description: "Face-framing layers add movement and soften a wider jaw or fuller cheeks.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 2, hairstyle_name: "Textured Lob", categories: ["Female"], face_shapes: ["Oval", "Round", "Square", "Diamond"], hair_length: "Medium", service_ids: [1],
    description: "A shoulder-grazing cut with loose texture that lengthens the face and relaxes strong angles.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 3, hairstyle_name: "Chin-Length Bob", categories: ["Female"], face_shapes: ["Oval", "Heart", "Oblong", "Diamond"], hair_length: "Short", service_ids: [1],
    description: "Adds fullness at the jawline to balance a narrow chin or a longer face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 4, hairstyle_name: "Side-Swept Bangs with Layers", categories: ["Female"], face_shapes: ["Oval", "Round", "Square", "Heart", "Diamond"], hair_length: "Medium", service_ids: [1],
    description: "Diagonal bangs break up the forehead and add soft lines around the face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 5, hairstyle_name: "Curtain Bangs", categories: ["Female"], face_shapes: ["Oval", "Heart", "Oblong", "Diamond"], hair_length: "Medium", service_ids: [1],
    description: "Center-parted bangs that frame the cheekbones and grow out easily.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 6, hairstyle_name: "Soft Waves", categories: ["Female"], face_shapes: ["Oval", "Square", "Oblong"], hair_length: "Medium", service_ids: [1],
    description: "Loose waves soften angular features and add width to a longer face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 7, hairstyle_name: "Pixie Cut", categories: ["Female"], face_shapes: ["Oval", "Heart", "Diamond"], hair_length: "Short", service_ids: [1],
    description: "A cropped cut that highlights cheekbones and eyes.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 8, hairstyle_name: "Asymmetrical Bob", categories: ["Female"], face_shapes: ["Round", "Oval", "Square"], hair_length: "Short", service_ids: [1],
    description: "A longer side and a shorter side create angles that slim a rounder face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 9, hairstyle_name: "Shag Cut", categories: ["Female"], face_shapes: ["Oval", "Diamond", "Heart"], hair_length: "Medium", service_ids: [1],
    description: "Choppy layers add volume and balance cheekbones with the forehead and jaw.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 10, hairstyle_name: "Blunt Bob with Bangs", categories: ["Female"], face_shapes: ["Oblong", "Oval", "Heart"], hair_length: "Short", service_ids: [1],
    description: "A straight, even cut with bangs shortens the look of a longer face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 14, hairstyle_name: "Long Straight with Center Part", categories: ["Female"], face_shapes: ["Oval", "Heart", "Diamond"], hair_length: "Long", service_ids: [1, 3],
    description: "Sleek length with a center part, finished with a keratin treatment for a smooth, glossy look.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 15, hairstyle_name: "Voluminous Long Waves", categories: ["Female"], face_shapes: ["Oblong", "Heart", "Oval"], hair_length: "Long", service_ids: [1],
    description: "Full waves add width at the sides to balance a longer face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 24, hairstyle_name: "Honey Balayage", categories: ["Female"], face_shapes: ALL_FACE_SHAPES, hair_length: "Any", service_ids: [1, 2],
    description: "Soft, sun-kissed highlights hand-painted through your cut. Brightens and frames any face shape.", image_url: null, filter_asset_url: null },

  // ---- Male ----
  { hairstyle_id: 11, hairstyle_name: "Classic Side Part", categories: ["Male"], face_shapes: ["Oval", "Square", "Diamond"], hair_length: "Short", service_ids: [1, 4],
    description: "A clean, timeless short cut with a defined part, finished with a grooming touch-up.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 12, hairstyle_name: "Textured Crop", categories: ["Male"], face_shapes: ["Oval", "Round", "Heart", "Square"], hair_length: "Short", service_ids: [1],
    description: "A short, tousled cut with height on top that adds length to a rounder face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 13, hairstyle_name: "Taper Fade with Volume on Top", categories: ["Male"], face_shapes: ["Round", "Oval", "Square"], hair_length: "Short", service_ids: [1, 4],
    description: "Tight sides with length on top add height and make the face look longer.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 16, hairstyle_name: "Crew Cut", categories: ["Male"], face_shapes: ["Oval", "Square", "Diamond", "Heart"], hair_length: "Short", service_ids: [1, 4],
    description: "Short, neat, and easy to wear. Keeps the focus on strong features.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 17, hairstyle_name: "Undercut with Slick Back", categories: ["Male"], face_shapes: ["Oval", "Square", "Heart"], hair_length: "Short", service_ids: [1],
    description: "Short sides with a longer top combed back for a sharp, polished look.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 18, hairstyle_name: "Pompadour", categories: ["Male"], face_shapes: ["Round", "Square", "Diamond"], hair_length: "Medium", service_ids: [1],
    description: "Lifted volume at the front adds height and slims a rounder or wider face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 19, hairstyle_name: "Short Textured Quiff", categories: ["Male"], face_shapes: ["Round", "Heart", "Square", "Oval"], hair_length: "Short", service_ids: [1],
    description: "A short, swept-up front that adds height with an easy everyday finish.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 20, hairstyle_name: "Side Fringe", categories: ["Male"], face_shapes: ["Oblong", "Heart", "Diamond"], hair_length: "Medium", service_ids: [1],
    description: "A swept fringe shortens the look of a longer forehead and softens the face.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 21, hairstyle_name: "Medium Flow", categories: ["Male"], face_shapes: ["Oblong", "Heart", "Diamond", "Oval", "Square"], hair_length: "Medium", service_ids: [1],
    description: "Layered mid-length hair with natural movement and added width at the sides.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 22, hairstyle_name: "Buzz Cut", categories: ["Male"], face_shapes: ["Oval", "Square", "Diamond"], hair_length: "Short", service_ids: [1, 4],
    description: "A close, even crop with a grooming finish. Simple and low-effort.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 23, hairstyle_name: "Textured Fringe Crop", categories: ["Male"], face_shapes: ["Oblong", "Heart", "Oval"], hair_length: "Short", service_ids: [1],
    description: "A short crop with a forward fringe that balances a longer face.", image_url: null, filter_asset_url: null },

  // ---- Unisex (Male and Female) ----
  { hairstyle_id: 25, hairstyle_name: "Rich Chestnut Color", categories: ["Male", "Female"], face_shapes: ALL_FACE_SHAPES, hair_length: "Any", service_ids: [2],
    description: "A warm, deep brown all-over color that adds richness and shine.", image_url: null, filter_asset_url: null },
  { hairstyle_id: 26, hairstyle_name: "Sleek Keratin Smooth", categories: ["Male", "Female"], face_shapes: ALL_FACE_SHAPES, hair_length: "Any", service_ids: [3],
    description: "A keratin treatment that smooths frizz and leaves hair soft, straight, and glossy.", image_url: null, filter_asset_url: null },
];

// [SPRINT 3 - ID 007] Mirrors `hairstyle_recommendations` table in ERD (starts empty)
const DEFAULT_HAIRSTYLE_RECS = [];

// [SPRINT 3 - ID 009 & ID 022] Mirrors `gallery_photos` table in ERD (starts empty)
const DEFAULT_GALLERY = [];

// ==============================================================================
// STORAGE & DATE/TIME HELPERS
// ==============================================================================
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUEUE)) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(DEFAULT_QUEUE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(DEFAULT_PAYMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY_LOG)) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOG, JSON.stringify(DEFAULT_INVENTORY_LOG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HAIRSTYLES)) {
    localStorage.setItem(STORAGE_KEYS.HAIRSTYLES, JSON.stringify(DEFAULT_HAIRSTYLES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HAIRSTYLE_RECS)) {
    localStorage.setItem(STORAGE_KEYS.HAIRSTYLE_RECS, JSON.stringify(DEFAULT_HAIRSTYLE_RECS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
  }
}

function readNameFields(prefix) {
  const firstName = document.getElementById(prefix + "-firstname").value.trim();
  const lastName = document.getElementById(prefix + "-lastname").value.trim();

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: firstName && lastName ? firstName + " " + lastName : ""
  };
}

function fillNameFields(prefix, user) {
  const parts = (user.full_name || "").trim().split(/\s+/);
  const lastName = parts.length > 1 ? parts.pop() : "";
  const firstName = parts.join(" ");

  document.getElementById(prefix + "-firstname").value =
    user.first_name ?? firstName;

  document.getElementById(prefix + "-lastname").value =
    user.last_name ?? lastName;
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (err) {
    return false;
  }
}

function getServices() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES)) || [];
}

function getAppointments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
}

function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
}

function getQueueRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUEUE)) || [];
}

function saveQueueRecords(queue) {
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
}

function getPayments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
}

function savePayments(payments) {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
}

function getAppointmentAmount(a) {
  if (!a) return 0;
  if (a.hairstyle_id) {
    const h = getHairstyles().find((x) => x.hairstyle_id === a.hairstyle_id);
    if (h) return getHairstyleServices(h).totalPrice;
  }
  const s = getServices().find((x) => x.service_id === a.service_id);
  return s ? Number(s.price) : 0;
}

function getPaymentForAppointment(id) {
  return getPayments().find((p) => p.appointment_id === id && p.status === "Paid") || null;
}

function recordPayment(a, method, recordedBy) {
  if (!a || a.status !== "Completed") return null;
  const existing = getPaymentForAppointment(a.appointment_id);
  if (existing) return existing;
  const ps = getPayments();
  const p = {
    payment_id: ps.length ? Math.max(...ps.map((x) => x.payment_id)) + 1 : 1,
    appointment_id: a.appointment_id,
    client_id: a.client_id,
    amount: getAppointmentAmount(a),
    payment_method: method,
    payment_date: getTodayDateString(),
    status: "Paid",
    recorded_by: recordedBy || null,
  };
  ps.push(p);
  savePayments(ps);
  return p;
}

function getInventory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY)) || [];
}

function saveInventory(products) {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(products));
}

function getInventoryLog() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY_LOG)) || [];
}

function saveInventoryLog(log) {
  localStorage.setItem(STORAGE_KEYS.INVENTORY_LOG, JSON.stringify(log));
}

function getHairstyles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.HAIRSTYLES)) || [];
}

function getHairstyleRecs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.HAIRSTYLE_RECS)) || [];
}

function saveHairstyleRecs(recs) {
  localStorage.setItem(STORAGE_KEYS.HAIRSTYLE_RECS, JSON.stringify(recs));
}

function getGalleryPhotos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY)) || [];
}

function saveGalleryPhotos(photos) {
  try {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(photos));
    return true;
  } catch (err) {
    return false;
  }
}

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER));
}

function setCurrentUser(user) {
  sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function timeToMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function showBanner(targetElement, message, isError = false) {
  if (!targetElement) return;
  targetElement.textContent = message;
  targetElement.style.borderLeftColor = isError ? "#9e2a2b" : "#1f6e43";
  targetElement.style.backgroundColor = isError ? "#fbe8e8" : "#e4f3ea";
  targetElement.style.color = isError ? "#9e2a2b" : "#1f6e43";
}

function getAppointmentBadgeHtml(status) {
  const s = (status || "").toLowerCase();
  const cls = s === "cancelled" ? "badge-cancelled" : s === "completed" ? "badge-completed" : "badge-confirmed";
  return `<span class="badge ${cls}">${status}</span>`;
}

function getQueueBadgeHtml(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "in service") {
    return `<span class="badge badge-in-service">${status}</span>`;
  }
  if (normalized === "waiting") {
    return `<span class="badge badge-waiting">${status}</span>`;
  }
  if (normalized === "completed") {
    return `<span class="badge badge-completed">${status}</span>`;
  }
  return `<span class="badge badge-cancelled">${status}</span>`;
}

// Resolves the hairstyle picked from Services & Prices for any appointment or walk-in record
function resolveAppointmentHairstyle(apptOrQueue) {
  if (!apptOrQueue) return null;
  const hairstyles = getHairstyles();
  if (apptOrQueue.hairstyle_id) {
    const byId = hairstyles.find((h) => h.hairstyle_id === apptOrQueue.hairstyle_id);
    if (byId) return byId;
  }
  if (apptOrQueue.client_id) {
    const rec = getHairstyleRecs().find((r) => r.client_id === apptOrQueue.client_id && r.was_selected);
    if (rec) {
      const byRec = hairstyles.find((h) => h.hairstyle_id === rec.hairstyle_id);
      if (byRec) return byRec;
    }
  }
  if (apptOrQueue.service_id) {
    const bySvc = hairstyles.find((h) => (h.service_ids || []).indexOf(apptOrQueue.service_id) !== -1);
    if (bySvc) return bySvc;
  }
  return null;
}

// Resolves total duration (in minutes) for an appointment or walk-in record
function getAppointmentDurationMinutes(apptOrQueue) {
  const hs = resolveAppointmentHairstyle(apptOrQueue);
  if (hs) return getHairstyleServices(hs).totalMinutes;
  const svc = getServices().find((s) => s.service_id === (apptOrQueue ? apptOrQueue.service_id : null));
  return svc ? svc.duration_minutes : 30;
}

// Resolves total price for an appointment or walk-in record
function getAppointmentPrice(apptOrQueue) {
  return getAppointmentAmount(apptOrQueue);
}

// Resolves human-readable hairstyle name for tables (e.g., Asymmetrical Bob, Buzz Cut)
function getAppointmentDisplayText(apptOrQueue) {
  const hs = resolveAppointmentHairstyle(apptOrQueue);
  if (hs) return hs.hairstyle_name;
  const svc = getServices().find((s) => s.service_id === (apptOrQueue ? apptOrQueue.service_id : null));
  return svc ? svc.service_name : "Unknown Hairstyle";
}

// ==============================================================================
// [SPRINT 1 - ID 001] ROLE GUARD & LOGOUT HANDLER
// ==============================================================================
function enforceRoleAccess(expectedRole) {
  const sessionUser = getCurrentUser();
  if (!sessionUser || sessionUser.role !== expectedRole) {
    alert("Please log in with an authorized account for this page.");
    window.location.href = "index.html";
    return null;
  }

  const user = getUsers().find((u) => u.user_id === sessionUser.user_id);
  if (!user || !user.is_active || user.role !== expectedRole) {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    alert("This account is inactive or no longer available. Please contact the salon.");
    window.location.href = "index.html";
    return null;
  }

  const nameSpan = document.querySelector(".nav-user span:first-child");
  if (nameSpan && !nameSpan.classList.contains("role-tag")) {
    nameSpan.textContent = user.full_name;
  }

  const logoutBtn = document.querySelector('.nav-user a[href="index.html"]');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    });
  }

  return user;
}

// ==============================================================================
// [SPRINT 1 - ID 001] LOGIN & REGISTRATION (index.html)
// ==============================================================================
function setupAuthPage() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  if (!loginForm && !registerForm) return;

  const loginFeedback = document.createElement("div");
  loginFeedback.className = "notice";
  loginFeedback.style.display = "none";
  loginForm.prepend(loginFeedback);

  const regFeedback = document.createElement("div");
  regFeedback.className = "notice";
  regFeedback.style.display = "none";
  registerForm.prepend(regFeedback);

  function switchAuthTab(targetTab) {
    const isLogin = targetTab === "login";
    loginForm.classList.toggle("is-hidden", !isLogin);
    registerForm.classList.toggle("is-hidden", isLogin);

    document.querySelectorAll(".auth-tab").forEach((tab) => {
      const active = tab.dataset.authTab === targetTab;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    loginFeedback.style.display = "none";
    regFeedback.style.display = "none";
  }

  document.querySelectorAll("[data-auth-tab]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      switchAuthTab(trigger.dataset.authTab);
    });
  });

  document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.togglePassword);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "Show";
    });
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const identifier = document.getElementById("login-identifier").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    if (!identifier || !password) {
      loginFeedback.style.display = "block";
      showBanner(loginFeedback, "Enter your username or email and your password.", true);
      return;
    }

    const users = getUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );

    if (!user || user.password !== password) {
      loginFeedback.style.display = "block";
      showBanner(loginFeedback, "Incorrect username/email or password.", true);
      return;
    }

    if (!user.is_active) {
      loginFeedback.style.display = "block";
      showBanner(loginFeedback, "This account is inactive. Please contact the salon.", true);
      return;
    }

    setCurrentUser(user);

    if (user.role === "client") {
      window.location.href = "client.html";
    } else if (user.role === "stylist") {
      window.location.href = "stylist.html";
    } else if (user.role === "receptionist") {
      window.location.href = "receptionist.html";
    } else if (user.role === "admin") {
      window.location.href = "admin.html";
    }
  });

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const names = readNameFields("reg");
    const fullName = names.full_name;
    const username = document.getElementById("reg-username").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    if (!fullName || !username || !phone || !email || !password) {
      regFeedback.style.display = "block";
      showBanner(regFeedback, "Please complete all registration fields.", true);
      return;
    }

    const users = getUsers();
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      regFeedback.style.display = "block";
      showBanner(regFeedback, "Account already exists with that username or email.", true);
      return;
    }

    const newUser = {
      user_id: users.length > 0 ? Math.max(...users.map((u) => u.user_id)) + 1 : 1,
      username,
      email,
      first_name: names.first_name,
      last_name: names.last_name,
      full_name: fullName,
      role: "client",
      phone,
      is_active: true,
      password,
    };

    users.push(newUser);
    saveUsers(users);
    registerForm.reset();

    regFeedback.style.display = "block";
    showBanner(
      regFeedback,
      `Registration successful for ${fullName}! You can now log in using your credentials.`,
      false
    );
  });
}

// ==============================================================================
// [SPRINT 1 - ID 002, ID 011, ID 012] SHARED SCHEDULING & CONFLICT VALIDATION
// ==============================================================================
function isSlotAvailable(stylist, dateStr, startTimeStr, durationMinutes, excludeAppointmentId = null) {
  if (!stylist || !stylist.is_active) {
    return { ok: false, reason: "Selected stylist is currently unavailable." };
  }

  const startMins = timeToMinutes(startTimeStr);
  const endMins = startMins + durationMinutes;
  const workStartMins = timeToMinutes(stylist.work_start);
  const workEndMins = timeToMinutes(stylist.work_end);
  const breakStartMins = timeToMinutes(stylist.break_start);
  const breakEndMins = timeToMinutes(stylist.break_end);

  if (startMins < workStartMins || endMins > workEndMins) {
    return {
      ok: false,
      reason: `Outside ${stylist.full_name}'s working hours (${stylist.work_start} - ${stylist.work_end}).`,
    };
  }

  if (startMins < breakEndMins && endMins > breakStartMins) {
    return {
      ok: false,
      reason: `Conflicts with ${stylist.full_name}'s break (${stylist.break_start} - ${stylist.break_end}).`,
    };
  }

  const appointments = getAppointments();
  for (const appt of appointments) {
    if (excludeAppointmentId !== null && appt.appointment_id === excludeAppointmentId) continue;
    if (
      appt.stylist_id === stylist.user_id &&
      appt.date === dateStr &&
      appt.status !== "Cancelled"
    ) {
      const existingStart = timeToMinutes(appt.start_time);
      const existingEnd = timeToMinutes(appt.end_time);
      if (startMins < existingEnd && endMins > existingStart) {
        return {
          ok: false,
          reason: `Conflicts with an existing booking (${appt.start_time} - ${appt.end_time}).`,
        };
      }
    }
  }

  return { ok: true, reason: null };
}

function getAvailableSlots(stylist, dateStr, durationMinutes = 30, stepMinutes = 30, excludeAppointmentId = null) {
  if (!stylist || !stylist.is_active) return [];

  const slots = [];
  let cursor = timeToMinutes(stylist.work_start);
  const shiftEnd = timeToMinutes(stylist.work_end);

  while (cursor + durationMinutes <= shiftEnd) {
    const candidateTime = minutesToTime(cursor);
    const check = isSlotAvailable(stylist, dateStr, candidateTime, durationMinutes, excludeAppointmentId);
    if (check.ok) {
      slots.push(candidateTime);
    }
    cursor += stepMinutes;
  }
  return slots;
}

// ==============================================================================
// [SPRINT 2 - ID 005] WALK-IN QUEUE & ESTIMATED WAITING TIME CALCULATION
// ==============================================================================
function recalculateQueueWaitTimes() {
  const queue = getQueueRecords();
  const appointments = getAppointments();
  const waitMinutesByStylist = {};

  queue.forEach((item) => {
    if (item.status === "Completed" || item.status === "Cancelled") {
      item.estimated_wait_minutes = 0;
      return;
    }

    let duration = 30;
    if (item.appointment_id) {
      const linked = appointments.find((a) => a.appointment_id === item.appointment_id);
      if (linked) duration = getAppointmentDurationMinutes(linked);
    } else {
      duration = getAppointmentDurationMinutes(item);
    }

    const stylistKey = String(item.stylist_id);
    if (!waitMinutesByStylist[stylistKey]) {
      waitMinutesByStylist[stylistKey] = 0;
    }

    if (item.status === "In Service") {
      item.estimated_wait_minutes = 0;
      waitMinutesByStylist[stylistKey] += duration;
    } else if (item.status === "Waiting") {
      item.estimated_wait_minutes = waitMinutesByStylist[stylistKey];
      waitMinutesByStylist[stylistKey] += duration;
    }
  });

  saveQueueRecords(queue);
  return queue;
}

// [SPRINT 2 - ID 004 & ID 005] Appointments scheduled for TODAY automatically join the queue
function syncTodayAppointmentsToQueue() {
  const today = getTodayDateString();
  const users = getUsers();
  const todaysAppts = getAppointments()
    .filter((a) => a.date === today && users.some((u) => u.user_id === a.client_id && u.role === "client"))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const queue = getQueueRecords();
  let changed = false;

  todaysAppts.forEach((a) => {
    const existing = queue.find((q) => q.appointment_id === a.appointment_id);

    if (existing) {
      if (a.status === "Cancelled" && (existing.status === "Waiting" || existing.status === "In Service")) {
        existing.status = "Cancelled";
        changed = true;
      }
      return;
    }

    if (a.status === "Cancelled" || a.status === "Completed") return;

    const client = users.find((u) => u.user_id === a.client_id);
    queue.push({
      queue_id: queue.length > 0 ? Math.max(...queue.map((q) => q.queue_id)) + 1 : 1,
      client_name: client ? client.full_name : "Unknown Client",
      service_id: a.service_id,
      hairstyle_id: a.hairstyle_id || null,
      stylist_id: a.stylist_id,
      queue_number: queue.length > 0 ? Math.max(...queue.map((q) => q.queue_number)) + 1 : 1,
      estimated_wait_minutes: 0,
      status: "Waiting",
      date: today,
      created_at: a.start_time,
      appointment_id: a.appointment_id,
    });
    changed = true;
  });

  if (changed) saveQueueRecords(queue);
}

// ==============================================================================
// [SPRINT 1 - ID 002 & ID 003] CLIENT DASHBOARD (client.html)
// ==============================================================================
function setupClientPage() {
  const bookingForm = document.getElementById("booking-form");
  if (!bookingForm) return;

  const client = enforceRoleAccess("client");
  if (!client) return;

  function getInitials(name) {
    const parts = String(name || "SC").trim().split(/\s+/);
    return (
      parts
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join("") || "SC"
    );
  }

  const initialsEl = document.getElementById("cli-user-initials");
  if (initialsEl) initialsEl.textContent = getInitials(client.full_name);

  const logoutBtn = document.getElementById("cli-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    });
  }

  // One-word sidebar tab switching
  const sidebarEl = document.getElementById("cli-sidebar");
  const menuBtn = document.getElementById("cli-menu-btn");
  const sidebarCloseBtn = document.getElementById("cli-sidebar-close");
  const navButtons = document.querySelectorAll(".cli-nav-item[data-cli-tab]");
  const panels = document.querySelectorAll(".cli-panel[data-cli-panel]");

  function switchClientTab(tabName) {
    navButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.cliTab === tabName);
    });
    panels.forEach((panel) => {
      const match = panel.dataset.cliPanel === tabName;
      panel.hidden = !match;
      panel.classList.toggle("is-active", match);
    });
    if (sidebarEl) sidebarEl.classList.remove("is-open");
    if (tabName === "dashboard") renderClientDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switchClientTab(btn.dataset.cliTab);
    });
  });

  if (menuBtn && sidebarEl) {
    menuBtn.addEventListener("click", () => sidebarEl.classList.add("is-open"));
  }
  if (sidebarCloseBtn && sidebarEl) {
    sidebarCloseBtn.addEventListener("click", () => sidebarEl.classList.remove("is-open"));
  }

  document.addEventListener("click", (e) => {
    const jumpTrigger = e.target.closest ? e.target.closest("[data-cli-jump]") : null;
    if (!jumpTrigger) return;
    switchClientTab(jumpTrigger.dataset.cliJump);
  });

  // Topbar search jumps to Services & Prices
  const globalSearch = document.getElementById("cli-global-search");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      switchClientTab("services");
    });
  }

  setupHairstyleRecommendations(client);
  setupClientGallery(client);
  setupMyProfile(client);

  const bookingModal = document.getElementById("booking-modal");
  const openBookingTabBtn = document.getElementById("open-booking-tab");
  const closeBookingModalBtn = document.getElementById("close-booking-modal");
  const cancelBookingModalBtn = document.getElementById("cancel-booking-modal");

  const hairstyleSelect = document.getElementById("book-hairstyle");
  const styleSummaryBox = document.getElementById("book-style-summary");
  const stylistSelect = document.getElementById("book-stylist");
  const dateInput = document.getElementById("book-date");
  const timeSelect = document.getElementById("book-time");
  const slotFeedback = document.getElementById("slot-feedback");
  const myApptsBody = document.getElementById("client-appointments-body");
  const paymentModal = document.getElementById("payment-modal");
  const paymentForm = document.getElementById("client-payment-form");
  const paymentSummary = document.getElementById("client-payment-summary");
  const paymentMethod = document.getElementById("client-payment-method");
  const closePaymentBtn = document.getElementById("close-payment-modal");
  const cancelPaymentBtn = document.getElementById("cancel-client-payment");
  let paymentAppointmentId = null;

  const queueBody = document.getElementById("client-queue-body");

  const apptFeedback = document.getElementById("appt-feedback");
  const reschedCard = document.getElementById("reschedule-card");
  const reschedForm = document.getElementById("reschedule-form");
  const reschedInfo = document.getElementById("resched-info");
  const reschedDate = document.getElementById("resched-date");
  const reschedTime = document.getElementById("resched-time");
  const reschedFeedback = document.getElementById("resched-feedback");
  const reschedClose = document.getElementById("resched-close");
  let reschedulingId = null;

  if (dateInput) {
    dateInput.value = getTodayDateString();
    dateInput.min = getTodayDateString();
  }

  function populateBookingHairstyles() {
    if (!hairstyleSelect) return;
    const prevValue = hairstyleSelect.value;
    const sortedStyles = getHairstyles()
      .slice()
      .sort((a, b) => a.hairstyle_name.localeCompare(b.hairstyle_name));

    hairstyleSelect.innerHTML = '<option value="">-- Choose a hairstyle --</option>';
    sortedStyles.forEach((h) => {
      const info = getHairstyleServices(h);
      const opt = document.createElement("option");
      opt.value = h.hairstyle_id;
      opt.textContent = `${h.hairstyle_name} (${info.totalMinutes} mins - ${formatPeso(info.totalPrice)})`;
      hairstyleSelect.appendChild(opt);
    });

    if (prevValue) {
      hairstyleSelect.value = prevValue;
    } else {
      const selectedRec = getHairstyleRecs().find(
        (r) => r.client_id === client.user_id && r.was_selected
      );
      if (selectedRec) {
        hairstyleSelect.value = String(selectedRec.hairstyle_id);
      }
    }
  }

  function updateBookingStyleSummary() {
    if (!styleSummaryBox || !hairstyleSelect) return;
    const hairstyleId = Number(hairstyleSelect.value);
    if (!hairstyleId) {
      styleSummaryBox.style.display = "none";
      styleSummaryBox.innerHTML = "";
      return;
    }
    const hs = getHairstyles().find((h) => h.hairstyle_id === hairstyleId);
    if (!hs) {
      styleSummaryBox.style.display = "none";
      return;
    }
    const info = getHairstyleServices(hs);
    styleSummaryBox.style.display = "block";
    styleSummaryBox.innerHTML =
      `<strong>${escapeHtml(hs.hairstyle_name)}</strong>` +
      ` &nbsp;|&nbsp; <strong>Estimated Time:</strong> about ${info.totalMinutes} mins` +
      ` &nbsp;|&nbsp; <strong>Estimated Price:</strong> ${formatPeso(info.totalPrice)}`;
  }

  const stylists = getUsers().filter((u) => u.role === "stylist" && u.is_active);
  if (stylistSelect) {
    stylistSelect.innerHTML = '<option value="">-- Choose a stylist --</option>';
    stylists.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st.user_id;
      opt.textContent = `${st.full_name} (${st.work_start} - ${st.work_end} | Break: ${st.break_start} - ${st.break_end})`;
      stylistSelect.appendChild(opt);
    });
  }

  function refreshAvailableTimeDropdown() {
    if (!hairstyleSelect || !stylistSelect || !dateInput || !timeSelect || !slotFeedback) return;

    const hairstyleId = Number(hairstyleSelect.value);
    const stylistId = Number(stylistSelect.value);
    const dateStr = dateInput.value;

    timeSelect.innerHTML = '<option value="">-- Select time --</option>';

    if (!hairstyleId || !stylistId || !dateStr) {
      slotFeedback.style.borderLeftColor = "#8c4a58";
      slotFeedback.style.backgroundColor = "#f7f3f1";
      slotFeedback.style.color = "#4a4341";
      slotFeedback.textContent = "Select a hairstyle, stylist, and date to load open time slots.";
      return;
    }

    const hairstyle = getHairstyles().find((h) => h.hairstyle_id === hairstyleId);
    const stylist = getUsers().find((u) => u.user_id === stylistId);
    if (!hairstyle || !stylist) return;

    const info = getHairstyleServices(hairstyle);
    const openSlots = getAvailableSlots(stylist, dateStr, info.totalMinutes);

    if (openSlots.length === 0) {
      showBanner(
        slotFeedback,
        `Unavailable Schedule: No open slots for ${stylist.full_name} on ${dateStr} for ${hairstyle.hairstyle_name}. Please choose another date or stylist.`,
        true
      );
      return;
    }

    openSlots.forEach((slot) => {
      const endSlot = minutesToTime(timeToMinutes(slot) + info.totalMinutes);
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = `${slot} - ${endSlot}`;
      timeSelect.appendChild(opt);
    });

    showBanner(
      slotFeedback,
      `${openSlots.length} available slot(s) found for ${stylist.full_name} on ${dateStr}.`,
      false
    );
  }

  function openBookingModal(preselectHairstyleId = null) {
    if (!bookingModal) return;
    populateBookingHairstyles();
    if (preselectHairstyleId) {
      hairstyleSelect.value = String(preselectHairstyleId);
    } else {
      const selectedRec = getHairstyleRecs().find(
        (r) => r.client_id === client.user_id && r.was_selected
      );
      if (selectedRec) {
        hairstyleSelect.value = String(selectedRec.hairstyle_id);
      }
    }
    updateBookingStyleSummary();
    refreshAvailableTimeDropdown();
    bookingModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeBookingModal() {
    if (!bookingModal) return;
    bookingModal.hidden = true;
    document.body.style.overflow = "";
  }

  if (openBookingTabBtn) {
    openBookingTabBtn.addEventListener("click", () => openBookingModal());
  }
  if (closeBookingModalBtn) {
    closeBookingModalBtn.addEventListener("click", closeBookingModal);
  }
  if (cancelBookingModalBtn) {
    cancelBookingModalBtn.addEventListener("click", closeBookingModal);
  }
  if (bookingModal) {
    bookingModal.addEventListener("click", (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });
  }
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest ? e.target.closest("[data-open-booking]") : null;
    if (trigger) {
      e.preventDefault();
      const styleId = trigger.dataset.styleId ? Number(trigger.dataset.styleId) : null;
      openBookingModal(styleId);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bookingModal && !bookingModal.hidden) {
      closeBookingModal();
    }
  });

  window.addEventListener("lms:hairstyle-selected", (e) => {
    if (!hairstyleSelect) return;
    const pickedId = e.detail ? e.detail.hairstyleId : null;
    hairstyleSelect.value = pickedId ? String(pickedId) : "";
    updateBookingStyleSummary();
    refreshAvailableTimeDropdown();
    renderClientDashboard();
  });

  window.addEventListener("lms:open-booking", (e) => {
    const pickedId = e.detail ? e.detail.hairstyleId : null;
    openBookingModal(pickedId);
  });

  if (hairstyleSelect) {
    hairstyleSelect.addEventListener("change", () => {
      updateBookingStyleSummary();
      refreshAvailableTimeDropdown();
    });
  }
  if (stylistSelect) stylistSelect.addEventListener("change", refreshAvailableTimeDropdown);
  if (dateInput) dateInput.addEventListener("change", refreshAvailableTimeDropdown);

  // ============================================================================
  // CLIENT LOUNGE DASHBOARD RENDERER
  // ============================================================================
  function renderClientDashboard() {
    const me = getUsers().find((u) => u.user_id === client.user_id) || client;
    const allUsers = getUsers();
    const today = getTodayDateString();
    const queue = recalculateQueueWaitTimes();
    const myAppts = getAppointments()
      .filter((a) => a.client_id === me.user_id)
      .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));

    if (initialsEl) initialsEl.textContent = getInitials(me.full_name);

    const welcomeTitle = document.getElementById("cli-welcome-title");
    if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${me.full_name}`;

    // 1. Style Identity Pills
    const pillsEl = document.getElementById("cli-identity-pills");
    if (pillsEl) {
      const selectedRec = getHairstyleRecs().find((r) => r.client_id === me.user_id && r.was_selected);
      const selectedStyle = selectedRec
        ? getHairstyles().find((h) => h.hairstyle_id === selectedRec.hairstyle_id)
        : null;

      const pills = [];
      pills.push(
        `<span class="badge ${me.face_shape ? "badge-confirmed" : "badge-neutral"}">Face Shape: ${
          me.face_shape ? escapeHtml(me.face_shape) : "Not recorded yet"
        }</span>`
      );
      pills.push(
        `<span class="badge ${selectedStyle ? "badge-popular" : "badge-neutral"}">Selected Style: ${
          selectedStyle ? escapeHtml(selectedStyle.hairstyle_name) : "None selected"
        }</span>`
      );
      pillsEl.innerHTML = pills.join("");
    }

    // 2. Reservation & Live Queue Pass
    const passEl = document.getElementById("cli-dash-pass");
    if (passEl) {
      const activeQueue = queue.find(
        (q) =>
          (q.status === "Waiting" || q.status === "In Service") &&
          ((q.appointment_id && myAppts.some((a) => a.appointment_id === q.appointment_id)) ||
            (!q.appointment_id && q.client_name.trim().toLowerCase() === me.full_name.trim().toLowerCase()))
      );

      const nextUpcoming = myAppts.find((a) => a.status === "Confirmed" && a.date >= today);

      if (activeQueue) {
        const sty = allUsers.find((u) => u.user_id === activeQueue.stylist_id);
        passEl.innerHTML = `
          <div class="cli-ticket-box">
            <div class="cli-ticket-top">
              <div>
                <span class="cli-ticket-kicker">Today's Live Queue Ticket • #${activeQueue.queue_number}</span>
                <h3>${escapeHtml(getAppointmentDisplayText(activeQueue))}</h3>
              </div>
              ${getQueueBadgeHtml(activeQueue.status)}
            </div>
            <div class="cli-ticket-meta">
              <div><span>Stylist</span><strong>${sty ? escapeHtml(sty.full_name) : "Assigned Stylist"}</strong></div>
              <div><span>Est. Wait</span><strong>${
                activeQueue.status === "In Service" ? "In Chair Now" : `${activeQueue.estimated_wait_minutes} mins`
              }</strong></div>
              <div><span>Est. Fee</span><strong>${formatPeso(getAppointmentPrice(activeQueue))}</strong></div>
            </div>
          </div>`;
      } else if (nextUpcoming) {
        const sty = allUsers.find((u) => u.user_id === nextUpcoming.stylist_id);
        passEl.innerHTML = `
          <div class="cli-ticket-box">
            <div class="cli-ticket-top">
              <div>
                <span class="cli-ticket-kicker">Upcoming Reservation • Booking #${nextUpcoming.appointment_id}</span>
                <h3>${escapeHtml(getAppointmentDisplayText(nextUpcoming))}</h3>
              </div>
              ${getAppointmentBadgeHtml(nextUpcoming.status)}
            </div>
            <div class="cli-ticket-meta">
              <div><span>Date &amp; Time</span><strong>${nextUpcoming.date === today ? "Today" : escapeHtml(nextUpcoming.date)} • ${escapeHtml(nextUpcoming.start_time)}</strong></div>
              <div><span>Stylist</span><strong>${sty ? escapeHtml(sty.full_name) : "Stylist"}</strong></div>
              <div><span>Estimated Total</span><strong>${formatPeso(getAppointmentPrice(nextUpcoming))}</strong></div>
            </div>
          </div>`;
      } else {
        passEl.innerHTML = `
          <div class="cli-empty-pass">
            <div>
              <strong style="color:var(--ink-primary);display:block;margin-bottom:0.2rem;">No active reservation or queue pass</strong>
              <span>Pick a hairstyle from our catalog and choose your preferred stylist to reserve your next visit.</span>
            </div>
            <button type="button" class="btn btn-primary" style="width:auto;" data-open-booking>Book Now</button>
          </div>`;
      }
    }

    // 3. Curated Hairstyles Preview
    const stylesEl = document.getElementById("cli-dash-styles");
    if (stylesEl) {
      const popMap = getHairstylePopularityMap();
      const shape = me.face_shape || "";
      const ranked = getHairstyles()
        .map((h) => ({
          h,
          suited: hairstyleSuitsFace(h, shape),
          pop: popMap[String(h.hairstyle_id)] || 0,
        }))
        .sort((a, b) => {
          if (shape && a.suited !== b.suited) return a.suited ? -1 : 1;
          if (b.pop !== a.pop) return b.pop - a.pop;
          return a.h.hairstyle_name.localeCompare(b.h.hairstyle_name);
        })
        .slice(0, 3);

      stylesEl.innerHTML = ranked
        .map(({ h, suited, pop }) => {
          const info = getHairstyleServices(h);
          const tag =
            shape && suited
              ? '<span class="badge badge-confirmed">Suits your face</span>'
              : pop > 0
              ? `<span class="badge badge-popular">&#9733; Popular (${pop})</span>`
              : `<span class="badge badge-neutral">${escapeHtml(h.hair_length)}</span>`;

          return `
            <article class="cli-mini-style-card">
              <div>
                <div style="margin-bottom:0.4rem;">${tag}</div>
                <h4>${escapeHtml(h.hairstyle_name)}</h4>
                <p style="margin-top:0.25rem;">${escapeHtml(h.description)}</p>
              </div>
              <div class="cli-mini-style-foot">
                <strong>${formatPeso(info.totalPrice)}</strong>
                <button type="button" class="btn btn-outline btn-sm" data-open-booking data-style-id="${h.hairstyle_id}">Book</button>
              </div>
            </article>`;
        })
        .join("");
    }

    // 4. My Before & After Lookbook Preview
    const galleryEl = document.getElementById("cli-dash-gallery");
    if (galleryEl) {
      const myPhotos = getGalleryPhotos()
        .filter((p) => p.client_id === me.user_id)
        .sort((a, b) => b.photo_id - a.photo_id)
        .slice(0, 2);

      if (myPhotos.length === 0) {
        galleryEl.innerHTML =
          '<p style="font-size:0.84rem;color:var(--ink-secondary);">No before-and-after photos yet. Photos uploaded by your stylist after a session will appear here.</p>';
      } else {
        galleryEl.innerHTML = `<div class="cli-lookbook-pair">${myPhotos
          .map(
            (p) => `
            <div class="cli-lb-thumb">
              <img src="${escapeHtml(p.photo_url)}" alt="${escapeHtml(p.photo_type)} photo" data-cli-img="${escapeHtml(p.photo_url)}" data-cli-cap="${escapeHtml(p.caption || "")}">
              <div class="cli-lb-thumb-meta">
                <span class="badge badge-neutral">${escapeHtml(p.photo_type)}</span>
                <div style="margin-top:0.2rem;">${p.caption ? escapeHtml(p.caption) : escapeHtml(p.uploaded_at.split(" ")[0])}</div>
              </div>
            </div>`
          )
          .join("")}</div>`;

        galleryEl.querySelectorAll("img[data-cli-img]").forEach((img) => {
          img.addEventListener("click", () => openImageViewer(img.dataset.cliImg, img.dataset.cliCap));
        });
      }
    }

    // 5. Visits & Billing Summary
    const billingEl = document.getElementById("cli-dash-billing");
    if (billingEl) {
      const completedAppts = myAppts.filter((a) => a.status === "Completed");
      const unpaidAppts = completedAppts.filter((a) => !getPaymentForAppointment(a.appointment_id));

      if (unpaidAppts.length > 0) {
        billingEl.innerHTML = `<div class="cli-billing-list">${unpaidAppts
          .map(
            (a) => `
            <div class="cli-billing-row">
              <div>
                <strong>${escapeHtml(getAppointmentDisplayText(a))}</strong>
                <small>Completed ${escapeHtml(a.date)} • ${formatPeso(getAppointmentAmount(a))}</small>
              </div>
              <button type="button" class="btn btn-primary btn-sm" style="width:auto;" data-dash-pay="${a.appointment_id}">Pay Now</button>
            </div>`
          )
          .join("")}</div>`;

        billingEl.querySelectorAll("button[data-dash-pay]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = Number(btn.dataset.dashPay);
            const appt = getAppointments().find((a) => a.appointment_id === id);
            if (!appt || appt.status !== "Completed") return;
            paymentAppointmentId = id;
            paymentSummary.innerHTML = `<strong>Booking #${id}</strong><br>${escapeHtml(getAppointmentDisplayText(appt))} &nbsp;|&nbsp; ${formatPeso(getAppointmentAmount(appt))}`;
            paymentMethod.value = "";
            paymentModal.hidden = false;
          });
        });
      } else {
        billingEl.innerHTML = `
          <div class="cli-billing-list">
            <div class="cli-billing-row">
              <div>
                <strong>Completed Salon Visits</strong>
                <small>All completed services are settled</small>
              </div>
              <span class="badge badge-completed">${completedAppts.length} visit${completedAppts.length === 1 ? "" : "s"}</span>
            </div>
            <div class="cli-billing-row">
              <div>
                <strong>Contact Details</strong>
                <small>${escapeHtml(me.phone || "No phone set")} • ${escapeHtml(me.email || "")}</small>
              </div>
              <button type="button" class="btn btn-outline btn-sm" data-cli-jump="profile">Edit</button>
            </div>
          </div>`;
      }
    }
  }

  function getQueueRecordForAppointment(appointmentId) {
    return getQueueRecords().find((q) => q.appointment_id === appointmentId) || null;
  }

  function canModifyAppointment(appt) {
    if (appt.status !== "Confirmed") return false;
    const q = getQueueRecordForAppointment(appt.appointment_id);
    return !(q && (q.status === "In Service" || q.status === "Completed"));
  }

  function showApptFeedback(message, isError) {
    apptFeedback.style.display = "block";
    showBanner(apptFeedback, message, isError);
  }

  function renderClientAppointments() {
    if (!myApptsBody) return;

    const allAppointments = getAppointments();
    const allUsers = getUsers();

    const myAppts = allAppointments
      .filter((a) => a.client_id === client.user_id)
      .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));

    myApptsBody.innerHTML = "";

    if (myAppts.length === 0) {
      myApptsBody.innerHTML =
        '<tr><td colspan="7">You have no booked appointments yet.</td></tr>';
      return;
    }

    myAppts.forEach((a) => {
      const hs = resolveAppointmentHairstyle(a);
      const sty = allUsers.find((u) => u.user_id === a.stylist_id);

      let hairstyleHtml;
      if (hs) {
        const info = getHairstyleServices(hs);
        hairstyleHtml = `<strong>${escapeHtml(hs.hairstyle_name)}</strong><br><small>${formatPeso(info.totalPrice)}</small>`;
      } else {
        hairstyleHtml = `<strong>${escapeHtml(getAppointmentDisplayText(a))}</strong>`;
      }

      const actions = canModifyAppointment(a)
        ? `<div class="action-group">
             <button type="button" class="btn btn-outline btn-sm" data-act="reschedule" data-id="${a.appointment_id}">Reschedule</button>
             <button type="button" class="btn btn-danger btn-sm" data-act="cancel" data-id="${a.appointment_id}">Cancel</button>
           </div>`
        : "—";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${a.appointment_id}</td>
        <td>${hairstyleHtml}</td>
        <td>${sty ? escapeHtml(sty.full_name) : "Unknown Stylist"}</td>
        <td>${a.date}<br>${a.start_time} - ${a.end_time}</td>
        <td>${getAppointmentBadgeHtml(a.status)}</td>
        <td>${actions}</td>
        <td>${a.status === "Completed" ? (getPaymentForAppointment(a.appointment_id) ? '<span class="badge badge-completed">Paid</span>' : `<button type="button" class="btn btn-primary btn-sm" data-act="pay" data-id="${a.appointment_id}">Pay</button>`) : "—"}</td>
      `;
      myApptsBody.appendChild(tr);
    });
  }

  function renderQueueStatus() {
    if (!queueBody) return;

    syncTodayAppointmentsToQueue();
    const queue = recalculateQueueWaitTimes();
    const allUsers = getUsers();
    const today = getTodayDateString();
    const nowMins = timeToMinutes(getCurrentTimeString());
    const isActive = (q) => q.status === "Waiting" || q.status === "In Service";
    const rows = [];

    function describe(apptOrRec, whenText) {
      const sty = allUsers.find((u) => u.user_id === apptOrRec.stylist_id);
      const labelText = getAppointmentDisplayText(apptOrRec);
      return `${escapeHtml(labelText)} with ${sty ? escapeHtml(sty.full_name) : "Stylist"}<br><small>${whenText}</small>`;
    }

    function queueRow(label, rec, scheduledStartMins) {
      const position = queue.indexOf(rec);
      const ahead = queue.filter(
        (q, i) => i < position && q.stylist_id === rec.stylist_id && isActive(q)
      ).length;

      if (rec.status === "In Service") {
        return `<tr><td>${label}</td><td>#${rec.queue_number}</td><td>${getQueueBadgeHtml(rec.status)}</td>
                <td>—</td><td>Being served now</td><td>Now</td></tr>`;
      }

      let turnMins = nowMins + rec.estimated_wait_minutes;
      if (scheduledStartMins !== null) turnMins = Math.max(turnMins, scheduledStartMins);
      const turnText = minutesToTime(Math.min(turnMins, 23 * 60 + 59));

      return `<tr><td>${label}</td><td>#${rec.queue_number}</td><td>${getQueueBadgeHtml(rec.status)}</td>
              <td>${ahead}</td><td>${rec.estimated_wait_minutes} mins</td><td>about ${turnText}</td></tr>`;
    }

    getAppointments()
      .filter((a) => a.client_id === client.user_id && a.status === "Confirmed" && a.date >= today)
      .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`))
      .forEach((a) => {
        const whenText = `${a.date === today ? "Today" : a.date}, ${a.start_time} - ${a.end_time}`;
        const label = describe(a, whenText);
        const rec = a.date === today ? queue.find((q) => q.appointment_id === a.appointment_id) : null;

        if (rec && isActive(rec)) {
          rows.push(queueRow(label, rec, timeToMinutes(a.start_time)));
        } else {
          rows.push(
            `<tr><td>${label}</td><td>—</td><td><span class="badge badge-confirmed">Scheduled</span></td>
             <td>—</td>
             <td>—</td>
             <td>
                ${a.date} ${a.start_time}

                ${a.date > today? `
                  <button type = "button"
                          class="queue-help"
                          popovertarget = "queue-tip-${a.appointment_id}"
                          style="anchor-name: --queue-${a.appointment_id}"
                          aria-label="About your queue number">?</button>
                    
                  <div class = "queue-tooltip"
                      id = "queue-tip-${a.appointment_id}"
                      style="position-anchor: --queue-${a.appointment_id}"
                      popover>
    
                    Queue number is given on the day of your appointment.
                  </div>
                ` : ""}
              </td>
              </tr>
            


             
             
              </td>
              </tr>`
          );
        }
      });

    queue
      .filter(
        (q) =>
          !q.appointment_id &&
          isActive(q) &&
          q.client_name.trim().toLowerCase() === client.full_name.trim().toLowerCase()
      )
      .forEach((rec) => {
        const sty = allUsers.find((u) => u.user_id === rec.stylist_id);
        const walkinLabel = `${escapeHtml(getAppointmentDisplayText(rec))} with ${sty ? escapeHtml(sty.full_name) : "Stylist"}<br><small>Walk-in, arrived ${rec.created_at || "—"}</small>`;
        rows.push(queueRow(walkinLabel, rec, null));
      });

    queueBody.innerHTML =
      rows.length > 0
        ? rows.join("")
        : '<tr><td colspan="6">You have no upcoming appointments or queue entries.</td></tr>';
    
    queueBody.querySelectorAll(".queue-help").forEach((button) => {
      const tooltip = button.nextElementSibling;
      
      button.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") {
          tooltip.showPopover();
        }
      });

      button.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "mouse") {
          tooltip.hidePopover();
        }
      });
    });
  }

  function cancelAppointment(appointmentId) {
    const appointments = getAppointments();
    const idx = appointments.findIndex(
      (a) => a.appointment_id === appointmentId && a.client_id === client.user_id
    );
    if (idx === -1) return;

    if (!canModifyAppointment(appointments[idx])) {
      showApptFeedback("This appointment can no longer be cancelled.", true);
      return;
    }

    if (!window.confirm(`Cancel booking #${appointmentId} on ${appointments[idx].date} at ${appointments[idx].start_time}?`)) {
      return;
    }

    appointments[idx].status = "Cancelled";
    saveAppointments(appointments);

    const queue = getQueueRecords();
    const qi = queue.findIndex((q) => q.appointment_id === appointmentId);
    if (qi !== -1 && (queue[qi].status === "Waiting" || queue[qi].status === "In Service")) {
      queue[qi].status = "Cancelled";
      saveQueueRecords(queue);
    }

    if (reschedulingId === appointmentId) closeReschedule();
    renderClientAppointments();
    renderQueueStatus();
    refreshAvailableTimeDropdown();
    renderClientDashboard();
    showApptFeedback(`Booking #${appointmentId} has been cancelled. The time slot is now open again.`, false);
  }

  function closeReschedule() {
    reschedulingId = null;
    if (reschedCard) reschedCard.style.display = "none";
    if (reschedFeedback) reschedFeedback.style.display = "none";
  }

  function refreshRescheduleSlots() {
    const appt = getAppointments().find((a) => a.appointment_id === reschedulingId);
    if (!appt) return;

    const duration = getAppointmentDurationMinutes(appt);
    const stylist = getUsers().find((u) => u.user_id === appt.stylist_id);
    const dateStr = reschedDate.value;

    reschedTime.innerHTML = '<option value="">-- Select time --</option>';
    reschedFeedback.style.display = "block";

    if (!dateStr) {
      showBanner(reschedFeedback, "Choose a new date to load open time slots.", true);
      return;
    }

    const slots = getAvailableSlots(stylist, dateStr, duration, 30, appt.appointment_id);
    if (slots.length === 0) {
      showBanner(
        reschedFeedback,
        `Unavailable Schedule: No open slots for ${stylist.full_name} on ${dateStr}. Please choose another date.`,
        true
      );
      return;
    }

    slots.forEach((slot) => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = `${slot} - ${minutesToTime(timeToMinutes(slot) + duration)}`;
      reschedTime.appendChild(opt);
    });
    showBanner(reschedFeedback, `${slots.length} available slot(s) on ${dateStr}.`, false);
  }

  function openReschedule(appointmentId) {
    const appt = getAppointments().find(
      (a) => a.appointment_id === appointmentId && a.client_id === client.user_id
    );
    if (!appt) return;
    if (!canModifyAppointment(appt)) {
      showApptFeedback("This appointment can no longer be rescheduled.", true);
      return;
    }

    const stylist = getUsers().find((u) => u.user_id === appt.stylist_id);

    reschedulingId = appointmentId;
    reschedInfo.textContent =
      `Booking #${appt.appointment_id}: ${getAppointmentDisplayText(appt)} with ` +
      `${stylist ? stylist.full_name : "Stylist"}, currently ${appt.date} at ${appt.start_time}.`;
    reschedDate.min = getTodayDateString();
    reschedDate.value = appt.date;
    reschedCard.style.display = "block";
    refreshRescheduleSlots();
    if (reschedCard.scrollIntoView) reschedCard.scrollIntoView({ behavior: "smooth" });
  }

  if (reschedForm) {
    reschedDate.addEventListener("change", refreshRescheduleSlots);
    reschedClose.addEventListener("click", closeReschedule);

    reschedForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const appointments = getAppointments();
      const idx = appointments.findIndex((a) => a.appointment_id === reschedulingId);
      if (idx === -1) return;
      const appt = appointments[idx];

      const newDate = reschedDate.value;
      const newStart = reschedTime.value;
      reschedFeedback.style.display = "block";

      if (!newDate || !newStart) {
        showBanner(reschedFeedback, "Incomplete Information: Choose a new date and time.", true);
        return;
      }
      if (newDate < getTodayDateString()) {
        showBanner(reschedFeedback, "You cannot reschedule to a past date.", true);
        return;
      }
      if (newDate === appt.date && newStart === appt.start_time) {
        showBanner(reschedFeedback, "That is your current schedule. Choose a different date or time.", true);
        return;
      }
      if (!canModifyAppointment(appt)) {
        showBanner(reschedFeedback, "This appointment can no longer be rescheduled.", true);
        return;
      }

      const duration = getAppointmentDurationMinutes(appt);
      const stylist = getUsers().find((u) => u.user_id === appt.stylist_id);
      const check = isSlotAvailable(stylist, newDate, newStart, duration, appt.appointment_id);
      if (!check.ok) {
        showBanner(reschedFeedback, `Unavailable Schedule: ${check.reason}`, true);
        refreshRescheduleSlots();
        return;
      }

      const newEnd = minutesToTime(timeToMinutes(newStart) + duration);
      appt.date = newDate;
      appt.start_time = newStart;
      appt.end_time = newEnd;
      saveAppointments(appointments);

      const queue = getQueueRecords();
      const qi = queue.findIndex((q) => q.appointment_id === appt.appointment_id);
      if (qi !== -1 && queue[qi].status === "Waiting") {
        if (newDate !== getTodayDateString()) {
          queue.splice(qi, 1);
        } else {
          queue[qi].created_at = newStart;
        }
        saveQueueRecords(queue);
      }

      const doneId = appt.appointment_id;
      closeReschedule();
      renderClientAppointments();
      renderQueueStatus();
      refreshAvailableTimeDropdown();
      renderClientDashboard();
      showApptFeedback(`Booking #${doneId} has been rescheduled to ${newDate} (${newStart} - ${newEnd}).`, false);
    });
  }

  if (myApptsBody) {
    myApptsBody.addEventListener("click", (e) => {
      const payBtn = e.target.closest ? e.target.closest("button[data-act='pay']") : null;
      if (payBtn) {
        const id = Number(payBtn.dataset.id);
        const appt = getAppointments().find((a) => a.appointment_id === id);
        if (!appt || appt.status !== "Completed") return;
        paymentAppointmentId = id;
        paymentSummary.innerHTML = `<strong>Booking #${id}</strong><br>${escapeHtml(getAppointmentDisplayText(appt))} &nbsp;|&nbsp; ${formatPeso(getAppointmentAmount(appt))}`;
        paymentMethod.value = "";
        paymentModal.hidden = false;
        return;
      }

      const btn = e.target.closest ? e.target.closest("button[data-act]") : null;
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (btn.dataset.act === "cancel") cancelAppointment(id);
      if (btn.dataset.act === "reschedule") openReschedule(id);
    });
  }

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!hairstyleSelect) return;

    const hairstyleId = Number(hairstyleSelect.value);
    const stylistId = Number(stylistSelect.value);
    const dateStr = dateInput.value;
    const startTime = timeSelect.value;

    if (!hairstyleId || !stylistId || !dateStr || !startTime) {
      showBanner(slotFeedback, "Incomplete Information: Please fill out all booking fields.", true);
      return;
    }

    const hairstyle = getHairstyles().find((h) => h.hairstyle_id === hairstyleId);
    const stylist = getUsers().find((u) => u.user_id === stylistId);
    if (!hairstyle || !stylist) return;

    const info = getHairstyleServices(hairstyle);
    const primaryServiceId = info.lines.length > 0 ? info.lines[0].service_id : 1;

    const check = isSlotAvailable(stylist, dateStr, startTime, info.totalMinutes);
    if (!check.ok) {
      const alternatives = getAvailableSlots(stylist, dateStr, info.totalMinutes);
      const altText =
        alternatives.length > 0
          ? ` Available times: ${alternatives.join(", ")}.`
          : " No other slots left on this date.";
      showBanner(slotFeedback, `Unavailable Schedule: ${check.reason}${altText}`, true);
      return;
    }

    const appointments = getAppointments();
    const endTime = minutesToTime(timeToMinutes(startTime) + info.totalMinutes);
    const newAppt = {
      appointment_id:
        appointments.length > 0 ? Math.max(...appointments.map((a) => a.appointment_id)) + 1 : 1,
      client_id: client.user_id,
      stylist_id: stylist.user_id,
      service_id: primaryServiceId,
      hairstyle_id: hairstyle.hairstyle_id,
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      status: "Confirmed",
    };

    appointments.push(newAppt);
    saveAppointments(appointments);

    registerChosenHairstyle(client.user_id, hairstyle.hairstyle_id, stylist.user_id);

    renderClientAppointments();
    renderQueueStatus();
    refreshAvailableTimeDropdown();
    closeBookingModal();
    switchClientTab("bookings");
    renderClientDashboard();
    showApptFeedback(
      `Appointment Confirmed! Booking #${newAppt.appointment_id} for ${hairstyle.hairstyle_name} on ${dateStr} (${startTime} - ${endTime}) with ${stylist.full_name}.`,
      false
    );
  });

  function closePaymentModal() {
    if (paymentModal) paymentModal.hidden = true;
    paymentAppointmentId = null;
  }
  closePaymentBtn?.addEventListener("click", closePaymentModal);
  cancelPaymentBtn?.addEventListener("click", closePaymentModal);
  paymentForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const appt = getAppointments().find((a) => a.appointment_id === paymentAppointmentId);
    if (!appt || !paymentMethod.value) return;
    recordPayment(appt, paymentMethod.value, client.user_id);
    closePaymentModal();
    renderClientAppointments();
    renderClientDashboard();
    if (apptFeedback) {
      apptFeedback.style.display = "block";
      showBanner(apptFeedback, "Payment recorded successfully.", false);
    }
  });

  populateBookingHairstyles();
  updateBookingStyleSummary();
  renderClientAppointments();
  renderQueueStatus();
  refreshAvailableTimeDropdown();
  renderClientDashboard();

  setInterval(() => {
    renderQueueStatus();
    renderClientAppointments();
    renderClientDashboard();
  }, 30000);

  window.addEventListener("storage", (e) => {
    if (
      e.key === STORAGE_KEYS.APPOINTMENTS ||
      e.key === STORAGE_KEYS.QUEUE ||
      e.key === STORAGE_KEYS.HAIRSTYLE_RECS ||
      e.key === STORAGE_KEYS.PAYMENTS ||
      e.key === STORAGE_KEYS.GALLERY ||
      e.key === STORAGE_KEYS.USERS
    ) {
      renderClientAppointments();
      renderQueueStatus();
      refreshAvailableTimeDropdown();
      renderClientDashboard();
    }
  });
}

// ==============================================================================
// [SPRINT 1 - ID 010] STYLIST DASHBOARD (stylist.html)
// ==============================================================================
function setupStylistPage() {
  const stylistApptsBody = document.getElementById("stylist-appointments-body");
  if (!stylistApptsBody) return;

  const stylist = enforceRoleAccess("stylist");
  if (!stylist) return;

  function getInitials(name) {
    const parts = String(name || "LS").trim().split(/\s+/);
    return (
      parts
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join("") || "LS"
    );
  }

  const initialsEl = document.getElementById("sty-user-initials");
  if (initialsEl) initialsEl.textContent = getInitials(stylist.full_name);

  const logoutBtn = document.getElementById("sty-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    });
  }

  // One-word sidebar tab switching
  const sidebarEl = document.getElementById("sty-sidebar");
  const menuBtn = document.getElementById("sty-menu-btn");
  const sidebarCloseBtn = document.getElementById("sty-sidebar-close");
  const navButtons = document.querySelectorAll(".sty-nav-item[data-sty-tab]");
  const panels = document.querySelectorAll(".sty-panel[data-sty-panel]");

  function switchStylistTab(tabName) {
    navButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.styTab === tabName);
    });
    panels.forEach((panel) => {
      const match = panel.dataset.styPanel === tabName;
      panel.hidden = !match;
      panel.classList.toggle("is-active", match);
    });
    if (sidebarEl) sidebarEl.classList.remove("is-open");
    if (tabName === "dashboard") renderStylistDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switchStylistTab(btn.dataset.styTab);
    });
  });

  if (menuBtn && sidebarEl) {
    menuBtn.addEventListener("click", () => sidebarEl.classList.add("is-open"));
  }
  if (sidebarCloseBtn && sidebarEl) {
    sidebarCloseBtn.addEventListener("click", () => sidebarEl.classList.remove("is-open"));
  }

  // Quick-jump triggers inside the Stylist Dashboard
  document.addEventListener("click", (e) => {
    const jumpTrigger = e.target.closest ? e.target.closest("[data-sty-jump]") : null;
    if (!jumpTrigger) return;
    const targetTab = jumpTrigger.dataset.styJump;
    switchStylistTab(targetTab);

    if (jumpTrigger.dataset.clientQuery) {
      const clientSearch = document.getElementById("client-search");
      if (clientSearch) {
        clientSearch.value = jumpTrigger.dataset.clientQuery;
        clientSearch.dispatchEvent(new Event("input"));
      }
      const viewBtn = document.querySelector('#client-results-body button[data-act="view"]');
      if (viewBtn) viewBtn.click();
    }
  });

  // Topbar search jumps to Client Profiles
  const globalSearch = document.getElementById("sty-global-search");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const term = globalSearch.value.trim();
      if (!term) return;
      switchStylistTab("clients");
      const clientSearch = document.getElementById("client-search");
      if (clientSearch) {
        clientSearch.value = term;
        clientSearch.dispatchEvent(new Event("input"));
      }
    });
  }

  setupClientProfiles(stylist, "stylist");
  setupProductUsage(stylist);
  setupGalleryManager(stylist);

  const statusText = stylist.is_active ? "Available" : "Unavailable / Off-Duty";
  const shiftNotice = document.getElementById("stylist-shift-notice") || document.querySelector(".notice");
  if (shiftNotice) {
    shiftNotice.innerHTML = `
      <strong>Your Current Shift:</strong> ${stylist.work_start} – ${stylist.work_end} &nbsp;|&nbsp;
      <strong>Scheduled Break:</strong> ${stylist.break_start} – ${stylist.break_end} &nbsp;|&nbsp;
      <strong>Status:</strong> ${statusText}
    `;
  }

  const topbarShift = document.getElementById("sty-topbar-shift");
  if (topbarShift) {
    topbarShift.textContent = `Shift: ${stylist.work_start} – ${stylist.work_end} (${statusText})`;
  }

  const bannerHeading = document.getElementById("sty-banner-heading");
  if (bannerHeading) {
    bannerHeading.textContent = `Welcome back, ${stylist.full_name}`;
  }

  function renderStylistDashboard() {
    const today = getTodayDateString();
    const nowTime = getCurrentTimeString();
    const users = getUsers();
    const allAppointments = getAppointments();
    const myAppointments = allAppointments
      .filter((a) => a.stylist_id === stylist.user_id)
      .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));

    const todaysAppts = myAppointments.filter((a) => a.date === today && a.status !== "Cancelled");
    const completedToday = todaysAppts.filter((a) => a.status === "Completed").length;
    const upcomingAppts = myAppointments.filter(
      (a) =>
        a.status === "Confirmed" &&
        (a.date > today || (a.date === today && (a.end_time || a.start_time) >= nowTime))
    );

    const myClientIds = Array.from(new Set(myAppointments.map((a) => a.client_id)));
    const myPhotos = getGalleryPhotos()
      .filter((p) => p.uploaded_by === stylist.user_id)
      .sort((a, b) => b.photo_id - a.photo_id);

    // 1. Update 4-Card KPI Ribbon
    const kpiToday = document.getElementById("sty-kpi-today");
    const kpiTodaySub = document.getElementById("sty-kpi-today-sub");
    const kpiNext = document.getElementById("sty-kpi-next");
    const kpiNextSub = document.getElementById("sty-kpi-next-sub");
    const kpiClients = document.getElementById("sty-kpi-clients");
    const kpiPhotos = document.getElementById("sty-kpi-photos");

    if (kpiToday) kpiToday.textContent = String(todaysAppts.length);
    if (kpiTodaySub) {
      kpiTodaySub.textContent =
        todaysAppts.length > 0
          ? `${completedToday} completed • ${todaysAppts.length - completedToday} remaining`
          : "No sessions scheduled for today";
    }

    const nextAppt = upcomingAppts[0] || null;
    if (kpiNext && kpiNextSub) {
      if (nextAppt) {
        const nextCli = users.find((u) => u.user_id === nextAppt.client_id);
        kpiNext.textContent = nextCli ? nextCli.full_name : "Scheduled Client";
        kpiNextSub.textContent = `${nextAppt.date === today ? "Today" : nextAppt.date} at ${nextAppt.start_time} • ${getAppointmentDisplayText(nextAppt)}`;
      } else {
        kpiNext.textContent = "Open Chair";
        kpiNextSub.textContent = `Break window: ${stylist.break_start} – ${stylist.break_end}`;
      }
    }

    if (kpiClients) kpiClients.textContent = String(myClientIds.length);
    if (kpiPhotos) kpiPhotos.textContent = String(myPhotos.length);

    // 2. Render Vertical Chair Timeline
    const timelineEl = document.getElementById("sty-timeline-list");
    if (timelineEl) {
      const timelineItems = todaysAppts.length > 0 ? todaysAppts : upcomingAppts.slice(0, 4);
      if (timelineItems.length === 0) {
        timelineEl.innerHTML =
          '<p style="font-size:0.86rem;color:var(--ink-secondary);">No sessions lined up in your chair yet. New client bookings assigned to you will appear here automatically.</p>';
      } else {
        timelineEl.innerHTML = timelineItems
          .map((a) => {
            const cli = users.find((u) => u.user_id === a.client_id);
            const cliName = cli ? cli.full_name : "Client";
            const shapeBadge =
              cli && cli.face_shape
                ? `<span class="badge badge-neutral">${escapeHtml(cli.face_shape)} face</span>`
                : "";
            const dateTag = a.date !== today ? `<small>${escapeHtml(a.date)}</small>` : `<small>to ${escapeHtml(a.end_time)}</small>`;

            return `
              <div class="sty-tl-item">
                <div class="sty-tl-time">${escapeHtml(a.start_time)}${dateTag}</div>
                <div class="sty-tl-rail">
                  <span class="sty-tl-node"></span>
                  <span class="sty-tl-line"></span>
                </div>
                <div class="sty-tl-card">
                  <div class="sty-tl-card-top">
                    <strong>${escapeHtml(cliName)}</strong>
                    <div class="action-group">
                      ${shapeBadge}
                      ${getAppointmentBadgeHtml(a.status)}
                    </div>
                  </div>
                  <div class="sty-tl-meta">
                    <span>${escapeHtml(getAppointmentDisplayText(a))}</span>
                    <button type="button" class="btn btn-outline btn-sm" data-sty-jump="clients" data-client-query="${escapeHtml(cliName)}">Consultation</button>
                  </div>
                </div>
              </div>`;
          })
          .join("");
      }
    }

    // 3. Render Recent Lookbook Strip
    const lookbookEl = document.getElementById("sty-dash-lookbook");
    if (lookbookEl) {
      if (myPhotos.length === 0) {
        lookbookEl.innerHTML =
          '<p style="grid-column:1 / -1;font-size:0.85rem;color:var(--ink-secondary);">No before-and-after photos uploaded yet. Use "Upload Before & After" above to showcase your work.</p>';
      } else {
        lookbookEl.innerHTML = myPhotos
          .slice(0, 3)
          .map((p) => {
            const cli = users.find((u) => u.user_id === p.client_id);
            return `
              <article class="sty-lb-item">
                <img src="${escapeHtml(p.photo_url)}" alt="${escapeHtml(p.photo_type)} photo" data-lb-src="${escapeHtml(p.photo_url)}" data-lb-cap="${escapeHtml(p.caption || "")}">
                <div class="sty-lb-caption">
                  <span class="badge badge-neutral">${escapeHtml(p.photo_type)}</span>
                  <strong>${cli ? escapeHtml(cli.full_name) : "Client"}</strong>
                  <span>${p.caption ? escapeHtml(p.caption) : escapeHtml(p.uploaded_at.split(" ")[0])}</span>
                </div>
              </article>`;
          })
          .join("");

        lookbookEl.querySelectorAll("img[data-lb-src]").forEach((img) => {
          img.addEventListener("click", () => {
            openImageViewer(img.dataset.lbSrc, img.dataset.lbCap);
          });
        });
      }
    }

    // 4. Render Client Consultation Spotlight
    const spotlightEl = document.getElementById("sty-spotlight-body");
    if (spotlightEl) {
      const focusAppt = nextAppt || myAppointments[myAppointments.length - 1] || null;
      const focusClient = focusAppt ? users.find((u) => u.user_id === focusAppt.client_id) : null;

      if (!focusClient) {
        spotlightEl.innerHTML =
          '<p style="font-size:0.85rem;color:var(--ink-secondary);">Once a client books with you, their face shape, hairstyle preferences, and formula notes will appear here for chair prep.</p>';
      } else {
        const chosenRec = getHairstyleRecs().find((r) => r.client_id === focusClient.user_id && r.was_selected);
        const chosenStyle = chosenRec ? getHairstyles().find((h) => h.hairstyle_id === chosenRec.hairstyle_id) : null;
        const lastNoteAppt = myAppointments
          .filter((a) => a.client_id === focusClient.user_id && a.service_notes)
          .pop();

        spotlightEl.innerHTML = `
          <div class="sty-spot-header">
            <div class="sty-spot-avatar">${escapeHtml(getInitials(focusClient.full_name))}</div>
            <div>
              <strong>${escapeHtml(focusClient.full_name)}</strong>
              <span>${escapeHtml(focusClient.phone || focusClient.email || "Registered Client")}</span>
            </div>
          </div>
          <div class="sty-spot-details">
            <div class="sty-spot-row">
              <span>Face Shape</span>
              <strong>${focusClient.face_shape ? escapeHtml(focusClient.face_shape) : "Not recorded yet"}</strong>
            </div>
            <div class="sty-spot-row">
              <span>Registered / Requested Style</span>
              <strong>${chosenStyle ? escapeHtml(chosenStyle.hairstyle_name) : focusAppt ? escapeHtml(getAppointmentDisplayText(focusAppt)) : "None selected"}</strong>
            </div>
            <div class="sty-spot-row">
              <span>Preferences &amp; Formula Notes</span>
              <div>${
                lastNoteAppt
                  ? escapeHtml(lastNoteAppt.service_notes)
                  : focusClient.hairstyle_preferences
                  ? escapeHtml(focusClient.hairstyle_preferences)
                  : "No consultation notes recorded yet."
              }</div>
            </div>
          </div>
          <button type="button" class="btn btn-primary" data-sty-jump="clients" data-client-query="${escapeHtml(focusClient.full_name)}">Open Consultation Card</button>
        `;
      }
    }

    // 5. Render Chair Supply Watch
    const supplyEl = document.getElementById("sty-supply-watch");
    if (supplyEl) {
      const lowItems = getInventory()
        .filter((p) => getInventoryStatus(p).needs)
        .slice(0, 4);

      if (lowItems.length === 0) {
        supplyEl.innerHTML =
          '<p style="font-size:0.84rem;color:var(--ink-secondary);">All salon backbar products are well stocked above reorder levels.</p>';
      } else {
        supplyEl.innerHTML = `<div class="sty-supply-list">${lowItems
          .map((p) => {
            const st = getInventoryStatus(p);
            return `
              <div class="sty-supply-row">
                <div>
                  <strong>${escapeHtml(p.product_name)}</strong>
                  <small>${escapeHtml(p.category)} • ${p.quantity_in_stock} remaining</small>
                </div>
                <span class="badge ${st.cls}">${st.label}</span>
              </div>`;
          })
          .join("")}</div>`;
      }
    }
  }

  function renderAssignedAppointments() {
    const allAppointments = getAppointments();
    const allUsers = getUsers();

    const assigned = allAppointments
      .filter((a) => a.stylist_id === stylist.user_id)
      .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));

    stylistApptsBody.innerHTML = "";

    if (assigned.length === 0) {
      stylistApptsBody.innerHTML =
        '<tr><td colspan="6">No appointments are currently assigned to you.</td></tr>';
      return;
    }

    assigned.forEach((a) => {
      const cli = allUsers.find((u) => u.user_id === a.client_id);
      const serviceLabel = getAppointmentDisplayText(a);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${a.appointment_id}</td>
        <td>${a.date}</td>
        <td>${a.start_time} - ${a.end_time}</td>
        <td>${cli ? escapeHtml(cli.full_name) : "Unknown Client"}</td>
        <td>${escapeHtml(serviceLabel)}</td>
        <td>${getAppointmentBadgeHtml(a.status)}</td>
      `;
      stylistApptsBody.appendChild(tr);
    });
  }

  renderAssignedAppointments();
  renderStylistDashboard();

  window.addEventListener("storage", (e) => {
    if (
      e.key === STORAGE_KEYS.APPOINTMENTS ||
      e.key === STORAGE_KEYS.HAIRSTYLE_RECS ||
      e.key === STORAGE_KEYS.USERS ||
      e.key === STORAGE_KEYS.INVENTORY ||
      e.key === STORAGE_KEYS.INVENTORY_LOG ||
      e.key === STORAGE_KEYS.GALLERY
    ) {
      renderAssignedAppointments();
      renderStylistDashboard();
    }
  });
}

// ==============================================================================
// [SPRINT 2 - ID 003, ID 004, ID 005] & [SPRINT 1 - ID 011, ID 012] & [SPRINT 4 - ID 013, ID 014]
// RECEPTIONIST DASHBOARD (receptionist.html)
// ==============================================================================
function setupReceptionistPage() {
  const schedulesBody = document.getElementById("stylist-schedules-body");
  const scheduleForm = document.getElementById("stylist-schedule-form");
  if (!schedulesBody || !scheduleForm) return;

  const receptionist = enforceRoleAccess("receptionist");
  if (!receptionist) return;

  function getInitials(name) {
    const parts = String(name || "FD").trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "FD";
  }

  const initialsEl = document.getElementById("rec-user-initials");
  if (initialsEl) initialsEl.textContent = getInitials(receptionist.full_name);

  // One-word sidebar tab switching
  const sidebarEl = document.getElementById("rec-sidebar");
  const menuBtn = document.getElementById("rec-menu-btn");
  const sidebarCloseBtn = document.getElementById("rec-sidebar-close");
  const navButtons = document.querySelectorAll(".rec-nav-item[data-rec-tab]");
  const panels = document.querySelectorAll(".rec-panel[data-rec-panel]");

  function switchReceptionistTab(tabName) {
    navButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.recTab === tabName);
    });
    panels.forEach((panel) => {
      const match = panel.dataset.recPanel === tabName;
      panel.hidden = !match;
      panel.classList.toggle("is-active", match);
    });
    if (sidebarEl) sidebarEl.classList.remove("is-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switchReceptionistTab(btn.dataset.recTab);
    });
  });

  if (menuBtn && sidebarEl) {
    menuBtn.addEventListener("click", () => sidebarEl.classList.add("is-open"));
  }
  if (sidebarCloseBtn && sidebarEl) {
    sidebarCloseBtn.addEventListener("click", () => sidebarEl.classList.remove("is-open"));
  }

  document.addEventListener("click", (e) => {
    const jumpTrigger = e.target.closest ? e.target.closest("[data-rec-jump]") : null;
    if (!jumpTrigger) return;
    const targetTab = jumpTrigger.dataset.recJump;
    switchReceptionistTab(targetTab);

    if (jumpTrigger.dataset.payItem) {
      const paySelect = document.getElementById("payment-service-select");
      if (paySelect) paySelect.value = jumpTrigger.dataset.payItem;
    }
    if (jumpTrigger.dataset.clientQuery) {
      const searchBox = document.getElementById("client-search");
      if (searchBox) {
        searchBox.value = jumpTrigger.dataset.clientQuery;
        searchBox.dispatchEvent(new Event("input"));
      }
    }
    if (targetTab === "queue") {
      const walkinName = document.getElementById("walkin-firstname");
      if (walkinName) walkinName.focus();
    }
  });

  // Top search bar quick routing
  const globalSearch = document.getElementById("rec-global-search");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const term = globalSearch.value.trim();
      if (!term) return;
      switchReceptionistTab("clients");
      const clientSearch = document.getElementById("client-search");
      if (clientSearch) {
        clientSearch.value = term;
        clientSearch.dispatchEvent(new Event("input"));
      }
    });
  }

  // Notification popover
  const notifBtn = document.getElementById("rec-notif-btn");
  const notifPopover = document.getElementById("rec-notif-popover");
  if (notifBtn && notifPopover) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = notifPopover.hidden;
      notifPopover.hidden = !willOpen;
      notifBtn.setAttribute("aria-expanded", String(willOpen));
    });
    document.addEventListener("click", (e) => {
      if (!notifPopover.hidden && !notifPopover.contains(e.target) && e.target !== notifBtn) {
        notifPopover.hidden = true;
        notifBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  setupClientProfiles(receptionist, "receptionist");
  setupInventoryMonitor();

  const refreshSalesReport = setupSalesReport();
  const refreshTrendsReport = setupTrendsReport();

  // [SPRINT 4 - ID 025] Payment processing
  const paymentForm = document.getElementById("receptionist-payment-form");
  const paymentSelect = document.getElementById("payment-service-select");
  const paymentMethodSelect = document.getElementById("payment-method-select");
  const paymentRecordsBody = document.getElementById("payment-records-body");

  function getCompletedPaymentItems() {
    const users = getUsers();
    const appointments = getAppointments()
      .filter((a) => a.status === "Completed")
      .map((a) => ({
        type: "appointment",
        id: a.appointment_id,
        appointment: a,
        client: users.find((u) => u.user_id === a.client_id),
        label: `Booking #${a.appointment_id} - ${getAppointmentDisplayText(a)}`,
        amount: getAppointmentAmount(a),
      }));
    const queue = getQueueRecords()
      .filter((q) => q.status === "Completed" && !q.appointment_id)
      .map((q) => ({
        type: "queue",
        id: q.queue_id,
        queue: q,
        client: users.find((u) => u.full_name.trim().toLowerCase() === q.client_name.trim().toLowerCase()),
        label: `Walk-in #${q.queue_number} - ${q.client_name} (${getAppointmentDisplayText(q)})`,
        amount: getAppointmentAmount(q),
      }));
    return appointments.concat(queue);
  }

  function refreshPaymentSection() {
    if (!paymentSelect || !paymentRecordsBody) return;
    const items = getCompletedPaymentItems();
    const payments = getPayments();
    paymentSelect.innerHTML = '<option value="">-- Choose a completed service --</option>';
    items.forEach((item) => {
      const paid = payments.some(
        (p) => (item.type === "appointment" ? p.appointment_id === item.id : p.queue_id === item.id) && p.status === "Paid"
      );
      if (!paid) {
        const opt = document.createElement("option");
        opt.value = `${item.type}:${item.id}`;
        opt.textContent = `${item.label} (${formatPeso(item.amount)})`;
        paymentSelect.appendChild(opt);
      }
    });
    paymentRecordsBody.innerHTML = "";
    if (!payments.length) {
      paymentRecordsBody.innerHTML = '<tr><td colspan="7">No payment records yet.</td></tr>';
      return;
    }
    payments
      .slice()
      .sort((a, b) => b.payment_id - a.payment_id)
      .forEach((p) => {
        const item = items.find((x) => (x.type === "appointment" ? p.appointment_id === x.id : p.queue_id === x.id));
        const clientName = item && item.client ? item.client.full_name : item && item.queue ? item.queue.client_name : "Client";
        const serviceName = item
          ? item.type === "appointment"
            ? getAppointmentDisplayText(item.appointment)
            : getAppointmentDisplayText(item.queue)
          : "Service";
        paymentRecordsBody.insertAdjacentHTML(
          "beforeend",
          `<tr><td>#${p.appointment_id || p.queue_id}</td><td>${escapeHtml(clientName)}</td><td>${escapeHtml(serviceName)}</td><td>${formatPeso(p.amount)}</td><td>${escapeHtml(p.payment_method)}</td><td>${p.payment_date}</td><td>${getAppointmentBadgeHtml("Paid")}</td></tr>`
        );
      });
  }

  if (paymentForm) {
    paymentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const [type, idText] = (paymentSelect.value || ":").split(":");
      const id = Number(idText);
      const item = getCompletedPaymentItems().find((x) => x.type === type && x.id === id);
      if (!item || !paymentMethodSelect.value) return;
      const payments = getPayments();
      const payment = {
        payment_id: payments.length ? Math.max(...payments.map((p) => p.payment_id)) + 1 : 1,
        appointment_id: type === "appointment" ? id : null,
        queue_id: type === "queue" ? id : null,
        client_id: item.client ? item.client.user_id : null,
        amount: item.amount,
        payment_method: paymentMethodSelect.value,
        payment_date: getTodayDateString(),
        status: "Paid",
        recorded_by: receptionist.user_id,
      };
      payments.push(payment);
      savePayments(payments);
      paymentForm.reset();
      refreshPaymentSection();
      if (refreshSalesReport) refreshSalesReport();
      renderDashboardOverview();
    });
  }
  refreshPaymentSection();

  // [SPRINT 2 - ID 003] Daily Appointments elements
  const dailyDateInput = document.getElementById("daily-appt-date");
  const dailyApptsBody = document.getElementById("daily-appointments-body");

  // [SPRINT 2 - ID 004 & ID 005] Walk-In Clients & Services/Prices Modal elements
  const walkinForm = document.getElementById("walkin-form");
  const walkinFeedback = document.getElementById("walkin-feedback");
  const walkinServiceSelect = document.getElementById("walkin-service");
  const walkinStyleSummary = document.getElementById("walkin-style-summary");
  const walkinStylistSelect = document.getElementById("walkin-stylist");
  const walkinClientsBody = document.getElementById("walkin-clients-body");

  // [SPRINT 1 - ID 011 & ID 012] Stylist Schedules elements
  const inspectDateInput = document.getElementById("inspect-date");
  const stylistSelect = document.getElementById("sched-stylist");
  const statusSelect = document.getElementById("sched-status");
  const workStartInput = document.getElementById("work-start");
  const workEndInput = document.getElementById("work-end");
  const breakStartInput = document.getElementById("break-start");
  const breakEndInput = document.getElementById("break-end");

  const scheduleFeedback = document.createElement("div");
  scheduleFeedback.className = "notice";
  scheduleFeedback.style.display = "none";
  scheduleForm.prepend(scheduleFeedback);

  if (dailyDateInput) {
    dailyDateInput.value = getTodayDateString();
  }
  inspectDateInput.value = getTodayDateString();

  // ============================================================================
  // DASHBOARD BENTO RENDERER (Feed, Customers, Bookings, Calendar, Revenue, Stylists)
  // ============================================================================
  let selectedCalDate = getTodayDateString();
  const calParts = selectedCalDate.split("-").map(Number);
  let calViewYear = calParts[0];
  let calViewMonth = calParts[1] - 1;

  const calPrevBtn = document.getElementById("dash-cal-prev");
  const calNextBtn = document.getElementById("dash-cal-next");
  const calDaysEl = document.getElementById("dash-cal-days");

  if (calPrevBtn) {
    calPrevBtn.addEventListener("click", () => {
      calViewMonth -= 1;
      if (calViewMonth < 0) {
        calViewMonth = 11;
        calViewYear -= 1;
      }
      renderDashboardCalendar();
    });
  }
  if (calNextBtn) {
    calNextBtn.addEventListener("click", () => {
      calViewMonth += 1;
      if (calViewMonth > 11) {
        calViewMonth = 0;
        calViewYear += 1;
      }
      renderDashboardCalendar();
    });
  }
  if (calDaysEl) {
    calDaysEl.addEventListener("click", (e) => {
      const btn = e.target.closest ? e.target.closest("button[data-cal-date]") : null;
      if (!btn) return;
      selectedCalDate = btn.dataset.calDate;
      if (dailyDateInput) {
        dailyDateInput.value = selectedCalDate;
        renderDailyAppointments();
      }
      renderDashboardCalendar();
    });
  }

  function renderDashboardCalendar() {
    const monthLabel = document.getElementById("dash-cal-month");
    const agendaEl = document.getElementById("dash-cal-agenda");
    if (!calDaysEl || !monthLabel || !agendaEl) return;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    monthLabel.textContent = `${monthNames[calViewMonth]} ${calViewYear}`;

    const appointments = getAppointments().filter((a) => a.status !== "Cancelled");
    const users = getUsers();
    const firstWeekday = new Date(calViewYear, calViewMonth, 1).getDay();
    const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();

    let cellsHtml = "";
    for (let i = 0; i < firstWeekday; i++) {
      cellsHtml += "<span></span>";
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const mm = String(calViewMonth + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const dateKey = `${calViewYear}-${mm}-${dd}`;
      const isSelected = dateKey === selectedCalDate;
      const hasAppts = appointments.some((a) => a.date === dateKey);
      cellsHtml += `<button type="button" class="rec-cal-day${isSelected ? " is-selected" : ""}${hasAppts ? " has-appts" : ""}" data-cal-date="${dateKey}">${String(day).padStart(2, "0")}</button>`;
    }
    calDaysEl.innerHTML = cellsHtml;

    const dayAppts = appointments
      .filter((a) => a.date === selectedCalDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    const rows = [];
    if (dayAppts.length > 0) {
      const first = dayAppts[0];
      const cli1 = users.find((u) => u.user_id === first.client_id);
      rows.push(
        `<div class="rec-agenda-row"><strong>${escapeHtml(first.start_time)}</strong><span>${escapeHtml(cli1 ? cli1.full_name : "Client")} | ${escapeHtml(getAppointmentDisplayText(first))}</span></div>`
      );
    }

    rows.push(
      `<div class="rec-agenda-row rec-agenda-open" data-rec-jump="queue"><strong>Walk-in</strong><span>Walk-in Available +</span></div>`
    );

    if (dayAppts.length > 1) {
      const second = dayAppts[1];
      const cli2 = users.find((u) => u.user_id === second.client_id);
      rows.push(
        `<div class="rec-agenda-row"><strong>${escapeHtml(second.start_time)}</strong><span>${escapeHtml(cli2 ? cli2.full_name : "Client")} | ${escapeHtml(getAppointmentDisplayText(second))}</span></div>`
      );
    } else if (dayAppts.length === 0) {
      rows.push(
        `<div class="rec-agenda-row"><strong>${escapeHtml(selectedCalDate)}</strong><span>No scheduled bookings yet</span></div>`
      );
    }

    agendaEl.innerHTML = rows.join("");
  }

  function renderDashboardOverview() {
    const users = getUsers();
    const appointments = getAppointments();
    const queue = getQueueRecords();
    const payments = getPayments();
    const inventory = getInventory();
    const today = getTodayDateString();

    // 1. FEED CARD (Unpaid completed service ready for cash out, or active queue guest)
    const feedSlot = document.getElementById("dash-feed-slot");
    if (feedSlot) {
      const completedItems = getCompletedPaymentItems();
      const unpaidItem = completedItems.find(
        (item) =>
          !payments.some(
            (p) => (item.type === "appointment" ? p.appointment_id === item.id : p.queue_id === item.id) && p.status === "Paid"
          )
      );

      if (unpaidItem) {
        const clientName = unpaidItem.client
          ? unpaidItem.client.full_name
          : unpaidItem.queue
          ? unpaidItem.queue.client_name
          : "Walk-in Client";
        const serviceName =
          unpaidItem.type === "appointment"
            ? getAppointmentDisplayText(unpaidItem.appointment)
            : getAppointmentDisplayText(unpaidItem.queue);

        feedSlot.innerHTML = `
          <div class="rec-feed-highlight">
            <div class="rec-feed-top">
              <div>
                <div class="rec-feed-kicker">Ready for cash out</div>
                <div class="rec-person-row">
                  <div class="rec-mini-avatar">${escapeHtml(getInitials(clientName))}</div>
                  <div>
                    <strong>${escapeHtml(clientName)}</strong>
                    <span>${escapeHtml(serviceName)}</span>
                  </div>
                </div>
              </div>
              <button type="button" class="rec-pill-btn rec-pill-dark" data-rec-jump="payments" data-pay-item="${unpaidItem.type}:${unpaidItem.id}">Cash out</button>
            </div>
            <div class="rec-feed-footer">
              <span>Service Total</span>
              <strong class="rec-feed-amount">${formatPeso(unpaidItem.amount)}</strong>
            </div>
          </div>`;
      } else {
        const activeGuest = queue.find((q) => q.status === "In Service" || q.status === "Waiting");
        if (activeGuest) {
          feedSlot.innerHTML = `
            <div class="rec-feed-highlight">
              <div class="rec-feed-top">
                <div>
                  <div class="rec-feed-kicker">${escapeHtml(activeGuest.status)} • Queue #${activeGuest.queue_number}</div>
                  <div class="rec-person-row">
                    <div class="rec-mini-avatar">${escapeHtml(getInitials(activeGuest.client_name))}</div>
                    <div>
                      <strong>${escapeHtml(activeGuest.client_name)}</strong>
                      <span>${escapeHtml(getAppointmentDisplayText(activeGuest))}</span>
                    </div>
                  </div>
                </div>
                <button type="button" class="rec-pill-btn rec-pill-dark" data-rec-jump="queue">Manage</button>
              </div>
              <div class="rec-feed-footer">
                <span>Estimated Service</span>
                <strong class="rec-feed-amount">${formatPeso(getAppointmentAmount(activeGuest))}</strong>
              </div>
            </div>`;
        } else {
          feedSlot.innerHTML = `
            <div class="rec-feed-highlight">
              <div class="rec-feed-top">
                <div>
                  <div class="rec-feed-kicker">Front Desk Ready</div>
                  <div class="rec-person-row">
                    <div class="rec-mini-avatar">LM</div>
                    <div>
                      <strong>No pending cash outs</strong>
                      <span>All completed visits are settled</span>
                    </div>
                  </div>
                </div>
                <button type="button" class="rec-pill-btn rec-pill-dark" data-rec-jump="queue">New Walk-in</button>
              </div>
              <div class="rec-feed-footer">
                <span>Today's Recorded Sales</span>
                <strong class="rec-feed-amount">${formatPeso(
                  payments.filter((p) => p.payment_date === today).reduce((s, p) => s + Number(p.amount || 0), 0)
                )}</strong>
              </div>
            </div>`;
        }
      }
    }

    // 2. CUSTOMERS CARD (2 mini client cards)
    const customersSlot = document.getElementById("dash-customers-slot");
    if (customersSlot) {
      const cardsData = [];
      queue
        .filter((q) => q.status === "In Service" || q.status === "Waiting")
        .slice(0, 2)
        .forEach((q) => {
          cardsData.push({
            name: q.client_name,
            service: getAppointmentDisplayText(q),
            status: q.status.toLowerCase(),
          });
        });

      if (cardsData.length < 2) {
        users
          .filter((u) => u.role === "client" && u.is_active)
          .forEach((c) => {
            if (cardsData.length >= 2) return;
            if (cardsData.some((x) => x.name.toLowerCase() === c.full_name.toLowerCase())) return;
            const latestAppt = appointments
              .filter((a) => a.client_id === c.user_id && a.status !== "Cancelled")
              .sort((a, b) => `${b.date} ${b.start_time}`.localeCompare(`${a.date} ${a.start_time}`))[0];
            cardsData.push({
              name: c.full_name,
              service: latestAppt ? getAppointmentDisplayText(latestAppt) : "Registered client",
              status: latestAppt ? latestAppt.status.toLowerCase() : "active profile",
            });
          });
      }

      customersSlot.innerHTML =
        cardsData.length > 0
          ? cardsData
              .map(
                (item) => `
              <div class="rec-cust-card">
                <span class="rec-cust-status">&bull; ${escapeHtml(item.status)}</span>
                <div class="rec-person-row">
                  <div class="rec-mini-avatar">${escapeHtml(getInitials(item.name))}</div>
                  <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>${escapeHtml(item.service)}</span>
                  </div>
                </div>
                <button type="button" class="rec-pill-btn rec-pill-dark rec-pill-full" data-rec-jump="clients" data-client-query="${escapeHtml(item.name)}">
                  <span>View client card</span>
                  <span>&#8599;</span>
                </button>
              </div>`
              )
              .join("")
          : '<p style="font-size:0.84rem;color:var(--ink-secondary);">No active customers right now.</p>';
    }

    // 3. TODAY'S BOOKINGS CARD
    const bookingsSlot = document.getElementById("dash-bookings-slot");
    if (bookingsSlot) {
      const todaysBookings = appointments
        .filter((a) => a.date === today && a.status !== "Cancelled")
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .slice(0, 3);

      bookingsSlot.innerHTML =
        todaysBookings.length > 0
          ? todaysBookings
              .map((a) => {
                const cli = users.find((u) => u.user_id === a.client_id);
                const sty = users.find((u) => u.user_id === a.stylist_id);
                return `
                <div class="rec-booking-item">
                  <div class="rec-booking-top">
                    <span class="rec-booking-time">&#128339; ${escapeHtml(a.start_time)} - ${escapeHtml(a.end_time)}</span>
                    <span class="rec-booking-client">${escapeHtml(cli ? cli.full_name : "Client")}</span>
                  </div>
                  <div class="rec-booking-bottom">
                    <span>Stylist: ${escapeHtml(sty ? sty.full_name : "Unassigned")}</span>
                    <span>${escapeHtml(getAppointmentDisplayText(a))}</span>
                  </div>
                </div>`;
              })
              .join("")
          : '<div class="rec-booking-item"><div class="rec-booking-bottom"><span>No scheduled appointments for today yet.</span><span>Click "Add new" for walk-ins</span></div></div>';
    }

    // 4. CALENDAR CARD
    renderDashboardCalendar();

    // 5. REVENUE CARD
    const revenueSlot = document.getElementById("dash-revenue-slot");
    if (revenueSlot) {
      const completedAppts = appointments.filter((a) => a.status === "Completed");
      const apptRevenue = completedAppts.reduce((sum, a) => sum + getAppointmentPrice(a), 0);

      const completedWalkins = queue.filter((q) => !q.appointment_id && q.status === "Completed");
      const walkinRevenue = completedWalkins.reduce((sum, q) => sum + getAppointmentPrice(q), 0);

      revenueSlot.innerHTML = `
        <div class="rec-rev-card">
          <div class="rec-rev-badge">&#9986;</div>
          <span class="rec-rev-label">Appointments</span>
          <strong class="rec-rev-value">${formatPeso(apptRevenue)}</strong>
          <button type="button" class="rec-pill-btn rec-pill-dark rec-pill-full" data-rec-jump="sales">
            <span>${completedAppts.length} transaction${completedAppts.length === 1 ? "" : "s"}</span>
            <span>&#8599;</span>
          </button>
        </div>
        <div class="rec-rev-card">
          <div class="rec-rev-badge">&#128179;</div>
          <span class="rec-rev-label">Walk-Ins &amp; Paid</span>
          <strong class="rec-rev-value">${formatPeso(walkinRevenue)}</strong>
          <button type="button" class="rec-pill-btn rec-pill-dark rec-pill-full" data-rec-jump="payments">
            <span>${payments.length} paid</span>
            <span>&#8599;</span>
          </button>
        </div>`;
    }

    // 6. STYLISTS COLUMN
    const stylistsSlot = document.getElementById("dash-stylists-slot");
    if (stylistsSlot) {
      const stylists = users.filter((u) => u.role === "stylist");
      const nowMins = timeToMinutes(getCurrentTimeString());

      stylistsSlot.innerHTML = stylists
        .map((st) => {
          const activeQueue = queue.find(
            (q) => q.stylist_id === st.user_id && q.status === "In Service"
          );
          const breakStart = timeToMinutes(st.break_start || "12:00");
          const breakEnd = timeToMinutes(st.break_end || "13:00");
          const isOnBreak = st.is_active && nowMins >= breakStart && nowMins < breakEnd;

          if (activeQueue) {
            return `
              <div class="rec-stylist-card">
                <div class="rec-stylist-alert">&bull; Serving ${escapeHtml(activeQueue.client_name)}</div>
                <div class="rec-stylist-body">
                  <div class="rec-person-row">
                    <div class="rec-stylist-avatar">${escapeHtml(getInitials(st.full_name))}</div>
                    <div>
                      <strong>${escapeHtml(st.full_name)}</strong>
                      <span>Stylist (${escapeHtml(st.work_start)} - ${escapeHtml(st.work_end)})</span>
                    </div>
                  </div>
                  <div class="rec-stylist-steps">
                    <div class="rec-step"><span class="rec-step-dot"></span><span>Consultation &amp; prep</span></div>
                    <div class="rec-step is-current"><span class="rec-step-dot"></span><span>${escapeHtml(getAppointmentDisplayText(activeQueue))}</span></div>
                    <div class="rec-step"><span class="rec-step-dot"></span><span>Finishing &amp; checkout</span></div>
                  </div>
                </div>
              </div>`;
          }

          if (!st.is_active || isOnBreak) {
            return `
              <div class="rec-stylist-card">
                <div class="rec-stylist-body">
                  <div class="rec-person-row">
                    <div class="rec-stylist-avatar">${escapeHtml(getInitials(st.full_name))}</div>
                    <div>
                      <strong>${escapeHtml(st.full_name)}</strong>
                      <span>Stylist</span>
                    </div>
                  </div>
                  <div class="rec-stylist-status-bar rec-status-break">
                    <span>&#128339; ${!st.is_active ? "Off-Duty" : "Currently on a break"}</span>
                    <span>${escapeHtml(st.break_start)} - ${escapeHtml(st.break_end)}</span>
                  </div>
                </div>
              </div>`;
          }

          return `
            <div class="rec-stylist-card">
              <div class="rec-stylist-body">
                <div class="rec-person-row">
                  <div class="rec-stylist-avatar">${escapeHtml(getInitials(st.full_name))}</div>
                  <div>
                    <strong>${escapeHtml(st.full_name)}</strong>
                    <span>Stylist (${escapeHtml(st.work_start)} - ${escapeHtml(st.work_end)})</span>
                  </div>
                </div>
                <div class="rec-stylist-status-bar rec-status-open">
                  <span>&#128197; Accepting walk-ins</span>
                </div>
              </div>
            </div>`;
        })
        .join("");
    }

    // 7. NOTIFICATION ALERTS
    const notifCountEl = document.getElementById("rec-notif-count");
    const notifListEl = document.getElementById("rec-notif-list");
    if (notifCountEl && notifListEl) {
      const alerts = [];
      inventory
        .filter((p) => getInventoryStatus(p).needs)
        .forEach((p) => {
          alerts.push({
            tab: "inventory",
            text: `${p.product_name}: ${getInventoryStatus(p).label} (${p.quantity_in_stock} left)`,
          });
        });
      queue
        .filter((q) => q.status === "Waiting")
        .forEach((q) => {
          alerts.push({
            tab: "queue",
            text: `Queue #${q.queue_number}: ${q.client_name} waiting (${q.estimated_wait_minutes} mins)`,
          });
        });

      notifCountEl.hidden = alerts.length === 0;
      notifCountEl.textContent = String(alerts.length);
      notifListEl.innerHTML =
        alerts.length > 0
          ? alerts
              .map(
                (a) =>
                  `<button type="button" class="rec-notif-item" data-rec-jump="${a.tab}">${escapeHtml(a.text)}</button>`
              )
              .join("")
          : '<div class="rec-notif-item">No urgent front desk alerts.</div>';
    }
  }

  function renderDailyAppointments() {
    if (!dailyApptsBody || !dailyDateInput) return;

    const targetDate = dailyDateInput.value || getTodayDateString();
    const appointments = getAppointments();
    const users = getUsers();

    const dailyList = appointments
      .filter((a) => a.date === targetDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    dailyApptsBody.innerHTML = "";

    if (dailyList.length === 0) {
      dailyApptsBody.innerHTML = `<tr><td colspan="7">No appointments scheduled for ${targetDate}.</td></tr>`;
      return;
    }

    dailyList.forEach((a) => {
      const client = users.find((u) => u.user_id === a.client_id);
      const stylist = users.find((u) => u.user_id === a.stylist_id);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${a.appointment_id}</td>
        <td>${a.date}</td>
        <td>${a.start_time} - ${a.end_time}</td>
        <td>${client ? escapeHtml(client.full_name) : "Unknown Client"}</td>
        <td>${escapeHtml(getAppointmentDisplayText(a))}</td>
        <td>${stylist ? escapeHtml(stylist.full_name) : "Unknown Stylist"}</td>
        <td>${getAppointmentBadgeHtml(a.status)}</td>
      `;
      dailyApptsBody.appendChild(tr);
    });
  }

  const walkinPickerBtn = document.getElementById("open-walkin-services-btn");
  const walkinPickerLabel = document.getElementById("walkin-picker-label");

  function updateWalkinStyleSummary() {
    if (!walkinServiceSelect) return;
    const hairstyleId = Number(walkinServiceSelect.value);
    const hs = hairstyleId ? getHairstyles().find((h) => h.hairstyle_id === hairstyleId) : null;

    if (!hs) {
      if (walkinPickerLabel) walkinPickerLabel.textContent = "View Services & Prices";
      if (walkinPickerBtn) walkinPickerBtn.classList.remove("has-selection");
      if (walkinStyleSummary) {
        walkinStyleSummary.style.display = "none";
        walkinStyleSummary.innerHTML = "";
      }
      return;
    }

    const info = getHairstyleServices(hs);
    if (walkinPickerLabel) {
      walkinPickerLabel.textContent = `${hs.hairstyle_name} (${formatPeso(info.totalPrice)})`;
    }
    if (walkinPickerBtn) walkinPickerBtn.classList.add("has-selection");
    if (walkinStyleSummary) {
      walkinStyleSummary.style.display = "block";
      walkinStyleSummary.innerHTML =
        `<strong>${escapeHtml(hs.hairstyle_name)}</strong>` +
        ` &nbsp;|&nbsp; <strong>Estimated Time:</strong> about ${info.totalMinutes} mins` +
        ` &nbsp;|&nbsp; <strong>Estimated Price:</strong> ${formatPeso(info.totalPrice)}`;
    }
  }

  function populateWalkinDropdowns() {
    if (!walkinStylistSelect) return;
    updateWalkinStyleSummary();

    const availableStylists = getUsers().filter((u) => u.role === "stylist" && u.is_active);
    walkinStylistSelect.innerHTML = '<option value="">-- Choose an available stylist --</option>';
    availableStylists.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st.user_id;
      opt.textContent = st.full_name;
      walkinStylistSelect.appendChild(opt);
    });

    if (availableStylists.length === 0 && walkinFeedback) {
      walkinFeedback.style.display = "block";
      showBanner(
        walkinFeedback,
        "No stylists are currently marked available. Waiting times may be affected.",
        true
      );
    }
  }

  setupWalkinServicesModal(walkinServiceSelect, updateWalkinStyleSummary);

  function renderWalkInClients() {
    if (!walkinClientsBody) return;

    syncTodayAppointmentsToQueue();
    const queue = recalculateQueueWaitTimes();
    const users = getUsers();
    const today = getTodayDateString();
    const allAppointments = getAppointments();

    const onlineBookings = getAppointments()
      .filter(
        (a) =>
          a.status !== "Cancelled" &&
          a.date > today &&
          users.some((u) => u.user_id === a.client_id && u.role === "client")
      )
      .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));

    walkinClientsBody.innerHTML = "";

    if (queue.length === 0 && onlineBookings.length === 0) {
      walkinClientsBody.innerHTML =
        '<tr><td colspan="9">No clients yet. Walk-in clients and online bookings will appear here.</td></tr>';
      return;
    }

    queue.forEach((item, index) => {
      const sty = users.find((u) => u.user_id === item.stylist_id);
      const isFinished = item.status === "Completed" || item.status === "Cancelled";
      const waitDisplay = isFinished
        ? "—"
        : item.status === "In Service"
        ? "0 mins (In Service)"
        : `${item.estimated_wait_minutes} mins`;

      const linkedAppt = item.appointment_id
        ? allAppointments.find((a) => a.appointment_id === item.appointment_id)
        : null;
      const typeBadge = linkedAppt
        ? '<span class="badge badge-online">Online Booking</span>'
        : '<span class="badge badge-walkin">Walk-in</span>';
      const scheduleCell = linkedAppt
        ? `Today<br>${linkedAppt.start_time} - ${linkedAppt.end_time}`
        : item.created_at || "—";

      const targetRecord = linkedAppt || item;
      const serviceDisplay = `${escapeHtml(getAppointmentDisplayText(targetRecord))} (${getAppointmentDurationMinutes(targetRecord)}m)`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${item.queue_number}</td>
        <td>${escapeHtml(item.client_name)}</td>
        <td>${typeBadge}</td>
        <td>${serviceDisplay}</td>
        <td>${sty ? escapeHtml(sty.full_name) : "Unassigned"}</td>
        <td>${scheduleCell}</td>
        <td>${waitDisplay}</td>
        <td>${getQueueBadgeHtml(item.status)}</td>
        <td>
          ${
            !isFinished
              ? `<div class="action-group">
                   <button type="button" class="btn btn-outline btn-sm" data-qaction="up" data-id="${item.queue_id}" ${index === 0 ? "disabled" : ""}>Move Up</button>
                   <button type="button" class="btn btn-outline btn-sm" data-qaction="down" data-id="${item.queue_id}" ${index === queue.length - 1 ? "disabled" : ""}>Move Down</button>
                   ${
                     item.status === "Waiting"
                       ? `<button type="button" class="btn btn-outline btn-sm" data-qaction="serve" data-id="${item.queue_id}">Start Service</button>`
                       : ""
                   }
                   <button type="button" class="btn btn-outline btn-sm" data-qaction="complete" data-id="${item.queue_id}">Complete</button>
                   <button type="button" class="btn btn-danger btn-sm" data-qaction="cancel" data-id="${item.queue_id}">Remove</button>
                 </div>`
              : "—"
          }
        </td>
      `;
      walkinClientsBody.appendChild(tr);
    });

    onlineBookings.forEach((a) => {
      const cli = users.find((u) => u.user_id === a.client_id);
      const sty = users.find((u) => u.user_id === a.stylist_id);
      const dayLabel = a.date === today ? "Today" : a.date;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>—</td>
        <td>${cli ? escapeHtml(cli.full_name) : "Unknown Client"}</td>
        <td><span class="badge badge-online">Online Booking</span></td>
        <td>${escapeHtml(getAppointmentDisplayText(a))} (${getAppointmentDurationMinutes(a)}m)</td>
        <td>${sty ? escapeHtml(sty.full_name) : "Unassigned"}</td>
        <td>${dayLabel}<br>${a.start_time} - ${a.end_time}</td>
        <td>—</td>
        <td>${getAppointmentBadgeHtml(a.status)}</td>
        <td>—</td>
      `;
      walkinClientsBody.appendChild(tr);
    });

    walkinClientsBody.querySelectorAll("button[data-qaction]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const queueId = Number(btn.dataset.id);
        const action = btn.dataset.qaction;
        handleQueueAction(queueId, action);
      });
    });
  }

  function handleQueueAction(queueId, action) {
    const queue = getQueueRecords();
    const idx = queue.findIndex((q) => q.queue_id === queueId);
    if (idx === -1) return;

    if (action === "up" && idx > 0) {
      [queue[idx - 1], queue[idx]] = [queue[idx], queue[idx - 1]];
    } else if (action === "down" && idx < queue.length - 1) {
      [queue[idx + 1], queue[idx]] = [queue[idx], queue[idx + 1]];
    } else if (action === "serve") {
      queue[idx].status = "In Service";
    } else if (action === "complete") {
      queue[idx].status = "Completed";
    } else if (action === "cancel") {
      queue[idx].status = "Cancelled";
    }

    if (queue[idx].appointment_id && (action === "complete" || action === "cancel")) {
      const appts = getAppointments();
      const ai = appts.findIndex((a) => a.appointment_id === queue[idx].appointment_id);
      if (ai !== -1) {
        appts[ai].status = action === "complete" ? "Completed" : "Cancelled";
        saveAppointments(appts);
      }
    }

    saveQueueRecords(queue);
    renderWalkInClients();
    renderDailyAppointments();
    renderStylistSchedules();
    if (refreshSalesReport) refreshSalesReport();
    if (refreshTrendsReport) refreshTrendsReport();
    refreshPaymentSection();
    renderDashboardOverview();
  }

  if (walkinForm) {
    walkinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const names = readNameFields("walkin");
      const clientName = names.full_name;
      const hairstyleId = Number(walkinServiceSelect.value);
      const stylistId = Number(walkinStylistSelect.value);

      if (!clientName || !hairstyleId || !stylistId) {
        walkinFeedback.style.display = "block";
        showBanner(
          walkinFeedback,
          "Incomplete Information: Please enter the client name and select a hairstyle/service and stylist.",
          true
        );
        return;
      }

      const hairstyle = getHairstyles().find((h) => h.hairstyle_id === hairstyleId);
      if (!hairstyle) return;

      const info = getHairstyleServices(hairstyle);
      const primaryServiceId = info.lines.length > 0 ? info.lines[0].service_id : 1;

      const queue = getQueueRecords();
      const duplicate = queue.some(
        (q) =>
          q.client_name.toLowerCase() === clientName.toLowerCase() &&
          (q.status === "Waiting" || q.status === "In Service")
      );
      if (duplicate) {
        walkinFeedback.style.display = "block";
        showBanner(
          walkinFeedback,
          `Duplicate Queue Entry: ${clientName} already has an active entry in the walk-in queue.`,
          true
        );
        return;
      }

      const nextId = queue.length > 0 ? Math.max(...queue.map((q) => q.queue_id)) + 1 : 1;
      const nextQueueNumber =
        queue.length > 0 ? Math.max(...queue.map((q) => q.queue_number)) + 1 : 1;

      queue.push({
        queue_id: nextId,
        client_first_name: names.first_name,
        client_last_name: names.last_name,
        client_name: clientName,
        service_id: primaryServiceId,
        hairstyle_id: hairstyle.hairstyle_id,
        stylist_id: stylistId,
        queue_number: nextQueueNumber,
        estimated_wait_minutes: 0,
        status: "Waiting",
        date: getTodayDateString(),
        created_at: getCurrentTimeString(),
      });

      saveQueueRecords(queue);
      recalculateQueueWaitTimes();
      walkinForm.reset();
      walkinServiceSelect.value = "";
      updateWalkinStyleSummary();
      renderWalkInClients();
      if (refreshTrendsReport) refreshTrendsReport();
      renderDashboardOverview();

      walkinFeedback.style.display = "block";
      showBanner(
        walkinFeedback,
        `Registered walk-in client ${clientName} for ${hairstyle.hairstyle_name} as Queue #${nextQueueNumber}.`,
        false
      );
    });
  }

  function populateStylistDropdown() {
    const stylists = getUsers().filter((u) => u.role === "stylist");
    stylistSelect.innerHTML = "";
    stylists.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st.user_id;
      opt.textContent = st.full_name;
      stylistSelect.appendChild(opt);
    });
    loadSelectedStylistIntoForm();
  }

  function loadSelectedStylistIntoForm() {
    const selectedId = Number(stylistSelect.value);
    const stylist = getUsers().find((u) => u.user_id === selectedId);
    if (!stylist) return;

    statusSelect.value = stylist.is_active ? "1" : "0";
    workStartInput.value = stylist.work_start;
    workEndInput.value = stylist.work_end;
    breakStartInput.value = stylist.break_start;
    breakEndInput.value = stylist.break_end;
  }

  function renderStylistSchedules() {
    const targetDate = inspectDateInput.value || getTodayDateString();
    const stylists = getUsers().filter((u) => u.role === "stylist");
    const appointments = getAppointments();

    schedulesBody.innerHTML = "";

    if (stylists.length === 0) {
      schedulesBody.innerHTML = '<tr><td colspan="6">No stylists found.</td></tr>';
      return;
    }

    stylists.forEach((st) => {
      const occupied = appointments
        .filter(
          (a) =>
            a.stylist_id === st.user_id &&
            a.date === targetDate &&
            a.status !== "Cancelled"
        )
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      const occupiedText =
        occupied.length > 0
          ? occupied
              .map((a) => `${a.start_time}-${a.end_time} (${getAppointmentDisplayText(a)})`)
              .join("<br>")
          : "None";

      const freeSlots = getAvailableSlots(st, targetDate, 30, 30);
      const freeSlotsText = freeSlots.length > 0 ? freeSlots.join(", ") : "None";

      const badgeHtml = st.is_active
        ? '<span class="badge badge-available">Available</span>'
        : '<span class="badge badge-unavailable">Unavailable</span>';

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${st.full_name}</td>
        <td>${st.work_start} - ${st.work_end}</td>
        <td>${st.break_start} - ${st.break_end}</td>
        <td>${occupiedText}</td>
        <td>${freeSlotsText}</td>
        <td>${badgeHtml}</td>
      `;
      schedulesBody.appendChild(tr);
    });
  }

  scheduleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const stylistId = Number(stylistSelect.value);
    const isActive = statusSelect.value === "1";
    const workStart = workStartInput.value;
    const workEnd = workEndInput.value;
    const breakStart = breakStartInput.value;
    const breakEnd = breakEndInput.value;

    const wsMins = timeToMinutes(workStart);
    const weMins = timeToMinutes(workEnd);
    const bsMins = timeToMinutes(breakStart);
    const beMins = timeToMinutes(breakEnd);

    if (wsMins >= weMins) {
      scheduleFeedback.style.display = "block";
      showBanner(scheduleFeedback, "Work start time must be earlier than work end time.", true);
      return;
    }

    if (bsMins >= beMins) {
      scheduleFeedback.style.display = "block";
      showBanner(scheduleFeedback, "Break start time must be earlier than break end time.", true);
      return;
    }

    if (bsMins < wsMins || beMins > weMins) {
      scheduleFeedback.style.display = "block";
      showBanner(
        scheduleFeedback,
        "Break window must fall within the stylist's working hours.",
        true
      );
      return;
    }

    const users = getUsers();
    const idx = users.findIndex((u) => u.user_id === stylistId);
    if (idx === -1) return;

    users[idx].is_active = isActive;
    users[idx].work_start = workStart;
    users[idx].work_end = workEnd;
    users[idx].break_start = breakStart;
    users[idx].break_end = breakEnd;

    saveUsers(users);
    renderStylistSchedules();
    populateWalkinDropdowns();
    renderDashboardOverview();

    scheduleFeedback.style.display = "block";
    showBanner(
      scheduleFeedback,
      `Saved schedule changes for ${users[idx].full_name} (${workStart}-${workEnd}, Break: ${breakStart}-${breakEnd}).`,
      false
    );
  });

  if (dailyDateInput) {
    dailyDateInput.addEventListener("change", renderDailyAppointments);
  }
  stylistSelect.addEventListener("change", loadSelectedStylistIntoForm);
  inspectDateInput.addEventListener("change", renderStylistSchedules);

  renderDailyAppointments();
  populateWalkinDropdowns();
  renderWalkInClients();
  populateStylistDropdown();
  renderStylistSchedules();
  renderDashboardOverview();

  window.addEventListener("storage", (e) => {
    if (
      e.key === STORAGE_KEYS.APPOINTMENTS ||
      e.key === STORAGE_KEYS.QUEUE ||
      e.key === STORAGE_KEYS.USERS ||
      e.key === STORAGE_KEYS.PAYMENTS ||
      e.key === STORAGE_KEYS.INVENTORY
    ) {
      renderDailyAppointments();
      renderWalkInClients();
      renderStylistSchedules();
      refreshPaymentSection();
      if (refreshSalesReport) refreshSalesReport();
      if (refreshTrendsReport) refreshTrendsReport();
      renderDashboardOverview();
    }
  });
}

// ==============================================================================
// WALK-IN SERVICES & PRICES MODAL (receptionist.html)
// Opens the 3x3 paginated hairstyle catalog so walk-in clients at the front desk
// can view available styles, estimated times, and prices, and click to select.
// ==============================================================================
function setupWalkinServicesModal(walkinServiceSelect, onSelectedCallback) {
  const modal = document.getElementById("walkin-services-modal");
  const openBtn = document.getElementById("open-walkin-services-btn");
  const closeBtn = document.getElementById("close-walkin-services-modal");
  const categorySelect = document.getElementById("walkin-hs-category");
  const lengthSelect = document.getElementById("walkin-hs-length");
  const popularBtn = document.getElementById("walkin-hs-popular-btn");
  const showAllBtn = document.getElementById("walkin-hs-show-all-btn");
  const results = document.getElementById("walkin-hs-results");
  const paginationBar = document.getElementById("walkin-hs-pagination");

  if (!modal || !openBtn || !results) return;

  const PAGE_SIZE = 9; // 3 rows x 3 columns
  let sortMode = "all"; // "all" | "popular"
  let currentPage = 1;

  function matchesCategory(hairstyle, category) {
    if (!category || category === "Others") return true;
    return hairstyle.categories.indexOf(category) !== -1;
  }

  function getFilteredList() {
    const category = categorySelect ? categorySelect.value : "";
    const length = lengthSelect ? lengthSelect.value : "Any";
    const wantsLength = length !== "Any";
    const popularityMap = getHairstylePopularityMap();

    let list = getHairstyles().filter((h) => matchesCategory(h, category));
    if (wantsLength) {
      list = list.filter((h) => h.hair_length === length || h.hair_length === "Any");
    }

    const mapped = list.map((h) => ({
      hairstyle: h,
      popularity: popularityMap[String(h.hairstyle_id)] || 0,
    }));

    if (sortMode === "popular") {
      return mapped.sort((a, b) => {
        if (b.popularity !== a.popularity) return b.popularity - a.popularity;
        return a.hairstyle.hairstyle_name.localeCompare(b.hairstyle.hairstyle_name);
      });
    }

    return mapped.sort((a, b) => a.hairstyle.hairstyle_name.localeCompare(b.hairstyle.hairstyle_name));
  }

  function renderPagination(totalItems) {
    if (!paginationBar) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    if (totalItems === 0) {
      paginationBar.innerHTML = "";
      return;
    }

    const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
    const endIdx = Math.min(totalItems, currentPage * PAGE_SIZE);

    let buttonsHtml = `<button type="button" class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>Prev</button>`;
    for (let p = 1; p <= totalPages; p++) {
      buttonsHtml += `<button type="button" class="page-btn${p === currentPage ? " is-active" : ""}" data-page="${p}">${p}</button>`;
    }
    buttonsHtml += `<button type="button" class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`;

    paginationBar.innerHTML = `
      <span class="pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} hairstyles (Page ${currentPage} of ${totalPages})</span>
      <div class="pagination-buttons">${buttonsHtml}</div>
    `;
  }

  function render() {
    const selectedId = walkinServiceSelect ? Number(walkinServiceSelect.value) : 0;
    const category = categorySelect ? categorySelect.value : "";
    const showCategory = !category || category === "Others";
    const items = getFilteredList();

    if (items.length === 0) {
      results.innerHTML = '<p style="grid-column: 1 / -1;">No hairstyles match the selected filters.</p>';
      renderPagination(0);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    results.innerHTML = pageItems
      .map((item) => {
        const h = item.hairstyle;
        const isSelected = h.hairstyle_id === selectedId;
        const info = getHairstyleServices(h);

        const starHtml =
          item.popularity > 0
            ? `<span class="popular-star" title="Popular — picked by ${item.popularity} client(s)" aria-label="Popular hairstyle">&#9733;</span>`
            : "";

        const tags = [];
        if (item.popularity > 0) {
          tags.push(`<span class="badge badge-popular">Popular (${item.popularity} picked)</span>`);
        }
        if (h.hair_length !== "Any") {
          tags.push(`<span class="badge badge-neutral">${escapeHtml(h.hair_length)} hair</span>`);
        }
        if (showCategory) {
          tags.push(`<span class="badge badge-neutral">${h.categories.length > 1 ? "Unisex" : escapeHtml(h.categories[0])}</span>`);
        }

        return `
          <article class="style-card${isSelected ? " is-selected" : ""}"
                   data-act="pick-walkin-style" data-id="${h.hairstyle_id}"
                   role="button" tabindex="0" aria-pressed="${isSelected}">
            <div class="style-card-top">
              <h4>${escapeHtml(h.hairstyle_name)}</h4>
              ${starHtml}
            </div>
            ${tags.length > 0 ? `<div class="tag-row">${tags.join("")}</div>` : ""}
            <p>${escapeHtml(h.description)}</p>
            <div class="style-services">
              <div class="service-line">
                <span>Estimated Time</span>
                <span>about ${info.totalMinutes} mins</span>
              </div>
              <div class="service-total" style="border-top: none; padding-top: 0; margin-top: 0;">
                <span>Estimated Price</span>
                <strong>${formatPeso(info.totalPrice)}</strong>
              </div>
            </div>
          </article>`;
      })
      .join("");

    renderPagination(items.length);
  }

  function openModal() {
    currentPage = 1;
    render();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      currentPage = 1;
      render();
    });
  }
  if (lengthSelect) {
    lengthSelect.addEventListener("change", () => {
      currentPage = 1;
      render();
    });
  }
  if (popularBtn) {
    popularBtn.addEventListener("click", () => {
      sortMode = "popular";
      currentPage = 1;
      render();
    });
  }
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      if (categorySelect) categorySelect.value = "";
      if (lengthSelect) lengthSelect.value = "Any";
      sortMode = "all";
      currentPage = 1;
      render();
    });
  }
  if (paginationBar) {
    paginationBar.addEventListener("click", (e) => {
      const btn = e.target.closest ? e.target.closest("button[data-page]") : null;
      if (!btn || btn.disabled) return;
      currentPage = Number(btn.dataset.page);
      render();
    });
  }

  function selectWalkinHairstyle(hairstyleId) {
    if (walkinServiceSelect) {
      walkinServiceSelect.value = String(hairstyleId);
    }
    if (onSelectedCallback) onSelectedCallback();
    closeModal();
  }

  results.addEventListener("click", (e) => {
    const cardEl = e.target.closest ? e.target.closest("[data-act='pick-walkin-style']") : null;
    if (!cardEl) return;
    selectWalkinHairstyle(Number(cardEl.dataset.id));
  });

  results.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const cardEl = e.target.closest ? e.target.closest("[data-act='pick-walkin-style']") : null;
    if (!cardEl) return;
    e.preventDefault();
    selectWalkinHairstyle(Number(cardEl.dataset.id));
  });
}

// ==============================================================================
// [SPRINT 4 - ID 013] RECEPTIONIST: DAILY SALES & SERVICE REPORTS
// ==============================================================================
function getDateOffsetString(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthStartString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function setupSalesReport() {
  const form = document.getElementById("sales-report-form");
  const body = document.getElementById("sales-report-body");
  if (!form || !body) return null;

  const presetSelect = document.getElementById("sales-period-preset");
  const startInput = document.getElementById("sales-start-date");
  const endInput = document.getElementById("sales-end-date");
  const feedback = document.getElementById("sales-report-feedback");
  const foot = document.getElementById("sales-report-foot");

  const kpiRevenue = document.getElementById("kpi-total-revenue");
  const kpiCount = document.getElementById("kpi-completed-count");
  const kpiAvg = document.getElementById("kpi-avg-sale");
  const kpiTop = document.getElementById("kpi-top-service");

  function applyPreset(preset) {
    const today = getTodayDateString();
    if (preset === "today") {
      startInput.value = today;
      endInput.value = today;
    } else if (preset === "week") {
      startInput.value = getDateOffsetString(-6);
      endInput.value = today;
    } else if (preset === "month") {
      startInput.value = getMonthStartString();
      endInput.value = today;
    } else if (preset === "all") {
      const apptDates = getAppointments().map((a) => a.date).filter(Boolean);
      const queueDates = getQueueRecords().map((q) => q.date).filter(Boolean);
      const allDates = apptDates.concat(queueDates, [getMonthStartString()]).sort();
      startInput.value = allDates[0];
      endInput.value = today;
    }
  }

  function render() {
    const startDate = startInput.value;
    const endDate = endInput.value;

    if (!startDate || !endDate) {
      feedback.style.display = "block";
      showBanner(feedback, "Select both From Date and To Date to view the report.", true);
      return;
    }

    if (startDate > endDate) {
      feedback.style.display = "block";
      showBanner(feedback, "Invalid Date Range: From Date cannot be later than To Date.", true);
      body.innerHTML = '<tr><td colspan="8">Please select a valid date range.</td></tr>';
      if (foot) foot.innerHTML = "";
      kpiRevenue.textContent = formatPeso(0);
      kpiCount.textContent = "0";
      kpiAvg.textContent = formatPeso(0);
      kpiTop.textContent = "—";
      return;
    }

    const users = getUsers();
    const entries = [];

    // 1. Completed appointments within the selected period
    getAppointments()
      .filter((a) => a.status === "Completed" && a.date >= startDate && a.date <= endDate)
      .forEach((a) => {
        const cli = users.find((u) => u.user_id === a.client_id);
        const sty = users.find((u) => u.user_id === a.stylist_id);
        entries.push({
          date: a.date,
          time: `${a.start_time} - ${a.end_time}`,
          sortTime: a.start_time || "00:00",
          ref: `Booking #${a.appointment_id}`,
          clientName: cli ? cli.full_name : "Unknown Client",
          itemName: getAppointmentDisplayText(a),
          stylistName: sty ? sty.full_name : "Unassigned",
          status: a.status,
          amount: getAppointmentPrice(a),
        });
      });

    // 2. Completed walk-in services (not already tied to a booked appointment)
    getQueueRecords()
      .filter((q) => !q.appointment_id && q.status === "Completed")
      .forEach((q) => {
        const itemDate = q.date || getTodayDateString();
        if (itemDate < startDate || itemDate > endDate) return;
        const sty = users.find((u) => u.user_id === q.stylist_id);
        entries.push({
          date: itemDate,
          time: q.created_at || "Walk-in",
          sortTime: q.created_at || "00:00",
          ref: `Walk-in #${q.queue_number}`,
          clientName: q.client_name,
          itemName: getAppointmentDisplayText(q),
          stylistName: sty ? sty.full_name : "Unassigned",
          status: q.status,
          amount: getAppointmentPrice(q),
        });
      });

    entries.sort((a, b) => `${a.date} ${a.sortTime}`.localeCompare(`${b.date} ${b.sortTime}`));

    const totalRevenue = entries.reduce((sum, item) => sum + item.amount, 0);
    const completedCount = entries.length;
    const avgSale = completedCount > 0 ? totalRevenue / completedCount : 0;

    const countsByItem = {};
    entries.forEach((item) => {
      countsByItem[item.itemName] = (countsByItem[item.itemName] || 0) + 1;
    });
    const sortedItems = Object.entries(countsByItem).sort((a, b) => b[1] - a[1]);
    const topLabel = sortedItems.length > 0 ? `${sortedItems[0][0]} (${sortedItems[0][1]})` : "—";

    kpiRevenue.textContent = formatPeso(totalRevenue);
    kpiCount.textContent = String(completedCount);
    kpiAvg.textContent = formatPeso(avgSale);
    kpiTop.textContent = topLabel;

    body.innerHTML = "";
    if (completedCount === 0) {
      feedback.style.display = "block";
      showBanner(
        feedback,
        `No Records Available: No recorded sales or completed services found from ${startDate} to ${endDate}.`,
        false
      );
      body.innerHTML = `<tr><td colspan="8">No completed services or sales recorded between ${startDate} and ${endDate}.</td></tr>`;
      if (foot) foot.innerHTML = "";
      return;
    }

    feedback.style.display = "block";
    showBanner(
      feedback,
      `Showing ${completedCount} completed service(s) totaling ${formatPeso(totalRevenue)} from ${startDate} to ${endDate}.`,
      false
    );

    entries.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(item.date)}</td>
        <td>${escapeHtml(item.time)}</td>
        <td>${escapeHtml(item.ref)}</td>
        <td>${escapeHtml(item.clientName)}</td>
        <td>${escapeHtml(item.itemName)}</td>
        <td>${escapeHtml(item.stylistName)}</td>
        <td>${getAppointmentBadgeHtml(item.status)}</td>
        <td class="price-cell">${formatPeso(item.amount)}</td>
      `;
      body.appendChild(tr);
    });

    if (foot) {
      foot.innerHTML = `
        <tr>
          <td colspan="7">Total Recorded Sales (${completedCount} completed service${completedCount === 1 ? "" : "s"})</td>
          <td class="price-cell">${formatPeso(totalRevenue)}</td>
        </tr>
      `;
    }
  }

  applyPreset(presetSelect ? presetSelect.value : "month");

  if (presetSelect) {
    presetSelect.addEventListener("change", () => {
      if (presetSelect.value !== "custom") {
        applyPreset(presetSelect.value);
        render();
      }
    });
  }

  [startInput, endInput].forEach((input) => {
    input.addEventListener("change", () => {
      if (presetSelect) presetSelect.value = "custom";
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    render();
  });

  render();
  return render;
}

// ==============================================================================
// [SPRINT 4 - ID 014] RECEPTIONIST: CLIENT TRENDS & PEAK HOURS REPORT
// ==============================================================================
function setupTrendsReport() {
  const form = document.getElementById("trends-report-form");
  const peakHoursBody = document.getElementById("peak-hours-body");
  if (!form || !peakHoursBody) return null;

  const startInput = document.getElementById("trends-start-date");
  const endInput = document.getElementById("trends-end-date");
  const feedback = document.getElementById("trends-report-feedback");
  const peakBanner = document.getElementById("peak-hours-banner");

  const kpiPeakHour = document.getElementById("kpi-peak-hour");
  const kpiUniqueClients = document.getElementById("kpi-unique-clients");
  const kpiRetention = document.getElementById("kpi-client-retention");
  const kpiBusiestDay = document.getElementById("kpi-busiest-day");

  const stylesBody = document.getElementById("trends-styles-body");
  const insightsBody = document.getElementById("trends-insights-body");

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function formatDayLabel(dateStr) {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return dateStr;
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    return `${dateStr} (${WEEKDAYS[dt.getDay()]})`;
  }

  function formatHourRange(hourNum) {
    const startH = String(hourNum).padStart(2, "0");
    const endH = String(hourNum + 1).padStart(2, "0");
    return `${startH}:00 - ${endH}:00`;
  }

  const today = getTodayDateString();
  const futureApptDates = getAppointments()
    .map((a) => a.date)
    .filter((d) => d && d >= today)
    .sort();
  startInput.value = getMonthStartString();
  endInput.value = futureApptDates.length > 0 ? futureApptDates[futureApptDates.length - 1] : today;

  function render() {
    const startDate = startInput.value;
    const endDate = endInput.value;

    if (!startDate || !endDate) {
      feedback.style.display = "block";
      showBanner(feedback, "Select both From Date and To Date to generate the report.", true);
      return;
    }

    if (startDate > endDate) {
      feedback.style.display = "block";
      showBanner(feedback, "Invalid Date Range: From Date cannot be later than To Date.", true);
      peakBanner.textContent = "Please select a valid date range.";
      kpiPeakHour.textContent = "—";
      kpiUniqueClients.textContent = "0";
      kpiRetention.textContent = "—";
      kpiBusiestDay.textContent = "—";
      peakHoursBody.innerHTML = '<tr><td colspan="4">Please select a valid date range.</td></tr>';
      if (stylesBody) stylesBody.innerHTML = "";
      if (insightsBody) insightsBody.innerHTML = "";
      return;
    }

    feedback.style.display = "none";

    const users = getUsers();
    const allAppointments = getAppointments();
    const allQueue = getQueueRecords();

    const periodAppts = allAppointments.filter(
      (a) => a.status !== "Cancelled" && a.date >= startDate && a.date <= endDate
    );

    const periodWalkins = allQueue.filter((q) => {
      if (q.appointment_id || q.status === "Cancelled") return false;
      const qDate = q.date || today;
      return qDate >= startDate && qDate <= endDate;
    });

    const allPeriodAppts = allAppointments.filter(
      (a) => a.date >= startDate && a.date <= endDate
    );

    const visits = [];

    periodAppts.forEach((a) => {
      const cli = users.find((u) => u.user_id === a.client_id);
      const hs = resolveAppointmentHairstyle(a);
      visits.push({
        type: "online",
        clientKey: `user:${a.client_id}`,
        userId: a.client_id,
        clientName: cli ? cli.full_name : `Client #${a.client_id}`,
        date: a.date,
        time: a.start_time || "09:00",
        styleName: getAppointmentDisplayText(a),
        hairLength: hs ? hs.hair_length : null,
      });
    });

    periodWalkins.forEach((q) => {
      const qDate = q.date || today;
      const hs = resolveAppointmentHairstyle(q);
      visits.push({
        type: "walkin",
        clientKey: `walkin:${q.client_name.trim().toLowerCase()}`,
        userId: null,
        clientName: q.client_name,
        date: qDate,
        time: q.created_at || "09:00",
        styleName: getAppointmentDisplayText(q),
        hairLength: hs ? hs.hair_length : null,
      });
    });

    const totalVisits = visits.length;

    const hourCounts = {};
    for (let h = 9; h <= 17; h++) {
      hourCounts[h] = 0;
    }
    visits.forEach((v) => {
      const hour = Number((v.time || "09:00").split(":")[0]);
      if (!Number.isNaN(hour)) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const sortedHours = Object.keys(hourCounts)
      .map(Number)
      .sort((a, b) => a - b);
    const maxHourCount = sortedHours.reduce((max, h) => Math.max(max, hourCounts[h]), 0);
    const peakHours = maxHourCount > 0 ? sortedHours.filter((h) => hourCounts[h] === maxHourCount) : [];

    if (totalVisits === 0) {
      peakBanner.style.borderLeftColor = "#8c4a58";
      peakBanner.style.backgroundColor = "#f7f3f1";
      peakBanner.style.color = "#4a4341";
      peakBanner.textContent = `No client or appointment records found between ${startDate} and ${endDate}.`;

      kpiPeakHour.textContent = "—";
      kpiUniqueClients.textContent = "0";
      kpiRetention.textContent = "0 New / 0 Returning";
      kpiBusiestDay.textContent = "—";

      peakHoursBody.innerHTML = sortedHours
        .map(
          (h) => `
          <tr>
            <td>${formatHourRange(h)}</td>
            <td>0</td>
            <td>
              <div class="hour-bar-wrap">
                <div class="hour-bar-track"><div class="hour-bar-fill" style="width: 0%;"></div></div>
                <span class="hour-bar-pct">0%</span>
              </div>
            </td>
            <td><span class="badge badge-neutral">Quiet</span></td>
          </tr>`
        )
        .join("");

      if (stylesBody) {
        stylesBody.innerHTML = '<tr><td colspan="3">No hairstyle or service requests in this period.</td></tr>';
      }
      if (insightsBody) {
        insightsBody.innerHTML = '<tr><td colspan="2">No client activity recorded in this period.</td></tr>';
      }
      return;
    }

    const peakHoursText = peakHours.map(formatHourRange).join(", ");
    peakBanner.style.borderLeftColor = "#1f6e43";
    peakBanner.style.backgroundColor = "#e4f3ea";
    peakBanner.style.color = "#1f6e43";
    peakBanner.innerHTML =
      `<strong>Peak Operating Hour${peakHours.length > 1 ? "s" : ""}:</strong> ${escapeHtml(peakHoursText)} ` +
      `(${maxHourCount} booking${maxHourCount === 1 ? "" : "s"} / client${maxHourCount === 1 ? "" : "s"} out of ${totalVisits} total).`;

    kpiPeakHour.textContent = peakHoursText;

    const historicalCounts = {};
    allAppointments
      .filter((a) => a.status !== "Cancelled" && a.date <= endDate)
      .forEach((a) => {
        const key = `user:${a.client_id}`;
        historicalCounts[key] = (historicalCounts[key] || 0) + 1;
      });
    allQueue
      .filter((q) => !q.appointment_id && q.status !== "Cancelled" && (q.date || today) <= endDate)
      .forEach((q) => {
        const key = `walkin:${q.client_name.trim().toLowerCase()}`;
        historicalCounts[key] = (historicalCounts[key] || 0) + 1;
      });

    const uniqueClientKeys = Array.from(new Set(visits.map((v) => v.clientKey)));
    let newClients = 0;
    let returningClients = 0;
    uniqueClientKeys.forEach((key) => {
      if ((historicalCounts[key] || 1) > 1) returningClients += 1;
      else newClients += 1;
    });

    kpiUniqueClients.textContent = String(uniqueClientKeys.length);
    kpiRetention.textContent = `${newClients} New / ${returningClients} Returning`;

    const dayCounts = {};
    visits.forEach((v) => {
      dayCounts[v.date] = (dayCounts[v.date] || 0) + 1;
    });
    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    kpiBusiestDay.textContent =
      sortedDays.length > 0
        ? `${formatDayLabel(sortedDays[0][0])} • ${sortedDays[0][1]}`
        : "—";

    peakHoursBody.innerHTML = sortedHours
      .map((h) => {
        const count = hourCounts[h];
        const pct = totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0;
        const isPeak = count > 0 && count === maxHourCount;
        const statusBadge = isPeak
          ? '<span class="badge badge-popular">Peak Hour</span>'
          : count > 0
          ? '<span class="badge badge-confirmed">Active</span>'
          : '<span class="badge badge-neutral">Quiet</span>';

        return `
          <tr>
            <td>${formatHourRange(h)}</td>
            <td><strong>${count}</strong></td>
            <td>
              <div class="hour-bar-wrap">
                <div class="hour-bar-track"><div class="hour-bar-fill" style="width: ${pct}%;"></div></div>
                <span class="hour-bar-pct">${pct}%</span>
              </div>
            </td>
            <td>${statusBadge}</td>
          </tr>`;
      })
      .join("");

    if (stylesBody) {
      const styleCounts = {};
      visits.forEach((v) => {
        styleCounts[v.styleName] = (styleCounts[v.styleName] || 0) + 1;
      });
      const rankedStyles = Object.entries(styleCounts).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      );

      stylesBody.innerHTML = rankedStyles
        .map(([name, count]) => {
          const share = Math.round((count / totalVisits) * 100);
          return `
            <tr>
              <td>${escapeHtml(name)}</td>
              <td><strong>${count}</strong></td>
              <td>${share}%</td>
            </tr>`;
        })
        .join("");
    }

    if (insightsBody) {
      const onlineCount = visits.filter((v) => v.type === "online").length;
      const walkinCount = visits.filter((v) => v.type === "walkin").length;

      const completedAppts = allPeriodAppts.filter((a) => a.status === "Completed").length;
      const confirmedAppts = allPeriodAppts.filter((a) => a.status === "Confirmed").length;
      const cancelledAppts = allPeriodAppts.filter((a) => a.status === "Cancelled").length;

      const shapeCounts = {};
      const activeUserIds = Array.from(new Set(visits.map((v) => v.userId).filter(Boolean)));
      activeUserIds.forEach((uid) => {
        const u = users.find((x) => x.user_id === uid);
        if (u && u.face_shape) {
          shapeCounts[u.face_shape] = (shapeCounts[u.face_shape] || 0) + 1;
        }
      });
      const rankedShapes = Object.entries(shapeCounts).sort((a, b) => b[1] - a[1]);
      const faceShapeSummary =
        rankedShapes.length > 0
          ? rankedShapes.map(([s, c]) => `${s} (${c})`).join(", ")
          : "No face shapes recorded on active profiles yet";

      const lengthCounts = {};
      visits.forEach((v) => {
        if (v.hairLength && v.hairLength !== "Any") {
          lengthCounts[v.hairLength] = (lengthCounts[v.hairLength] || 0) + 1;
        }
      });
      const rankedLengths = Object.entries(lengthCounts).sort((a, b) => b[1] - a[1]);
      const lengthSummary =
        rankedLengths.length > 0
          ? rankedLengths.map(([len, c]) => `${len} (${c})`).join(", ")
          : "All lengths / general services";

      insightsBody.innerHTML = `
        <tr>
          <td><strong>Booking Channel</strong></td>
          <td>${onlineCount} Online Booking${onlineCount === 1 ? "" : "s"} &nbsp;|&nbsp; ${walkinCount} Walk-In${walkinCount === 1 ? "" : "s"}</td>
        </tr>
        <tr>
          <td><strong>Appointment Outcomes</strong></td>
          <td>${completedAppts} Completed &nbsp;|&nbsp; ${confirmedAppts} Upcoming &nbsp;|&nbsp; ${cancelledAppts} Cancelled</td>
        </tr>
        <tr>
          <td><strong>Client Face Shapes</strong></td>
          <td>${escapeHtml(faceShapeSummary)}</td>
        </tr>
        <tr>
          <td><strong>Hair Length Demand</strong></td>
          <td>${escapeHtml(lengthSummary)}</td>
        </tr>
      `;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    render();
  });

  render();
  return render;
}

// ==============================================================================
// [SPRINT 2 - ID 006 & ID 023] CLIENT PROFILES (Stylist + Receptionist)
// ==============================================================================
const FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"];

function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setupClientProfiles(user, role) {
  const searchInput = document.getElementById("client-search");
  const resultsBody = document.getElementById("client-results-body");
  if (!searchInput || !resultsBody) return;

  const isStylist = role === "stylist";

  const panel = document.getElementById("client-profile-panel");
  const form = document.getElementById("client-profile-form");
  const title = document.getElementById("profile-title");
  const firstNameInput = document.getElementById("pf-firstname");
  const lastNameInput = document.getElementById("pf-lastname");
  const phoneInput = document.getElementById("pf-phone");
  const emailInput = document.getElementById("pf-email");
  const faceSelect = document.getElementById("pf-faceshape");
  const prefsInput = document.getElementById("pf-preferences");
  const closeBtn = document.getElementById("pf-close");
  const historyBody = document.getElementById("client-history-body");
  const feedback = document.getElementById("profile-feedback");
  const scopeNote = document.getElementById("profiles-scope");
  const hairstyleNote = document.getElementById("pf-hairstyle");

  let selectedClientId = null;

  [firstNameInput, lastNameInput, phoneInput, emailInput].forEach((el) => (el.readOnly = isStylist));
  faceSelect.disabled = !isStylist;
  prefsInput.disabled = !isStylist;

  faceSelect.innerHTML = '<option value="">Not set</option>';
  FACE_SHAPES.forEach((shape) => {
    const opt = document.createElement("option");
    opt.value = shape;
    opt.textContent = shape;
    faceSelect.appendChild(opt);
  });

  if (scopeNote) {
    scopeNote.textContent = isStylist
      ? "Showing clients who have booked with you. You can update face shape, hairstyle preferences, and service notes."
      : "Search all registered clients. You can update contact details; preferences and service notes are kept by stylists.";
  }

  function showFeedback(message, isError) {
    feedback.style.display = "block";
    showBanner(feedback, message, isError);
  }

  function getVisibleClients() {
    const clients = getUsers().filter((u) => u.role === "client");
    if (!isStylist) return clients;
    const myClientIds = getAppointments()
      .filter((a) => a.stylist_id === user.user_id)
      .map((a) => a.client_id);
    return clients.filter((c) => myClientIds.indexOf(c.user_id) !== -1);
  }

  function findVisibleClient(clientId) {
    return getVisibleClients().find((c) => c.user_id === clientId) || null;
  }

  function renderResults() {
    const query = searchInput.value.trim().toLowerCase();
    const digits = query.replace(/\D/g, "");
    const appointments = getAppointments();

    const matches = getVisibleClients()
      .filter((c) => {
        if (!query) return true;
        const haystack = [c.full_name, c.username, c.email, c.phone].join(" ").toLowerCase();
        if (haystack.indexOf(query) !== -1) return true;
        return digits.length >= 3 && String(c.phone || "").replace(/\D/g, "").indexOf(digits) !== -1;
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

    resultsBody.innerHTML = "";

    if (matches.length === 0) {
      resultsBody.innerHTML = `<tr><td colspan="5">${
        query
          ? "No clients match your search."
          : isStylist
          ? "No clients yet. Clients appear here after they book with you."
          : "No registered clients yet."
      }</td></tr>`;
      return;
    }

    matches.forEach((c) => {
      const visits = appointments.filter(
        (a) => a.client_id === c.user_id && a.status === "Completed"
      ).length;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(c.full_name)}</td>
        <td>${escapeHtml(c.phone || "—")}</td>
        <td>${escapeHtml(c.email || "—")}</td>
        <td>${visits}</td>
        <td><button type="button" class="btn btn-outline btn-sm" data-act="view" data-id="${c.user_id}">View Profile</button></td>
      `;
      resultsBody.appendChild(tr);
    });
  }

  function renderHistory() {
    const users = getUsers();
    const history = getAppointments()
      .filter((a) => a.client_id === selectedClientId)
      .sort((a, b) => `${b.date} ${b.start_time}`.localeCompare(`${a.date} ${a.start_time}`));

    historyBody.innerHTML = "";

    if (history.length === 0) {
      historyBody.innerHTML = `<tr><td colspan="${isStylist ? 7 : 6}">No service history yet.</td></tr>`;
      return;
    }

    history.forEach((a) => {
      const sty = users.find((u) => u.user_id === a.stylist_id);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.date}</td>
        <td>${a.start_time} - ${a.end_time}</td>
        <td>${escapeHtml(getAppointmentDisplayText(a))}</td>
        <td>${sty ? escapeHtml(sty.full_name) : "Unknown Stylist"}</td>
        <td>${getAppointmentBadgeHtml(a.status)}</td>
      `;
      historyBody.appendChild(tr);
    });
  }

  function updateHairstyleNote() {
    if (!hairstyleNote) return;
    if (selectedClientId === null) {
      hairstyleNote.style.display = "none";
      return;
    }
    const client = getUsers().find((u) => u.user_id === selectedClientId);
    const rec = getHairstyleRecs().find((r) => r.client_id === selectedClientId && r.was_selected);
    const chosen = rec ? getHairstyles().find((h) => h.hairstyle_id === rec.hairstyle_id) : null;

    hairstyleNote.style.display = "block";
    if (!chosen) {
      hairstyleNote.textContent = "Registered hairstyle: none yet.";
      return;
    }
    let text =
      `<strong>Registered hairstyle:</strong> ${escapeHtml(chosen.hairstyle_name)}` +
      (chosen.hair_length !== "Any" ? ` (${chosen.hair_length} hair)` : "");
    const shape = client ? client.face_shape : "";
    if (isStylist && shape && !hairstyleSuitsFace(chosen, shape)) {
      text += ` — Outside the usual suggestions for a ${escapeHtml(shape)} face. Talk it through with the client before the service.`;
    }
    hairstyleNote.innerHTML = text;
  }

  function closeProfile() {
    selectedClientId = null;
    updateHairstyleNote();
    panel.style.display = "none";
  }

  function openProfile(clientId) {
    const client = findVisibleClient(clientId);
    if (!client) {
      showFeedback("You do not have access to that client profile.", true);
      return;
    }

    selectedClientId = client.user_id;
    feedback.style.display = "none";

    title.textContent = `Client Profile: ${client.full_name}`;
    fillNameFields("pf", client);
    phoneInput.value = client.phone || "";
    emailInput.value = client.email || "";
    faceSelect.value = client.face_shape || "";
    prefsInput.value = client.hairstyle_preferences || "";

    panel.style.display = "block";
    updateHairstyleNote();
    renderHistory();
    if (panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth" });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (selectedClientId === null || !findVisibleClient(selectedClientId)) return;

    const users = getUsers();
    const idx = users.findIndex((u) => u.user_id === selectedClientId);
    if (idx === -1) {
      showFeedback("Client record not found.", true);
      return;
    }
    const current = users[idx];

    if (isStylist) {
      const shape = faceSelect.value;
      const prefs = prefsInput.value.trim();

      if (shape && FACE_SHAPES.indexOf(shape) === -1) {
        showFeedback("Choose a valid face shape.", true);
        return;
      }
      if (prefs.length > 500) {
        showFeedback("Hairstyle preferences must be 500 characters or fewer.", true);
        return;
      }
      current.face_shape = shape;
      current.hairstyle_preferences = prefs;
    } else {
      const names = readNameFields("pf");
      const fullName = names.full_name;
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();

      if (!fullName || !phone || !email) {
        showFeedback("Incomplete Information: name, phone number, and email are required.", true);
        return;
      }
      if (phone !== (current.phone || "") && !/^[0-9+\-()\s]{7,20}$/.test(phone)) {
        showFeedback("Enter a valid phone number (digits, spaces, +, -, parentheses).", true);
        return;
      }
      if (email !== (current.email || "")) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showFeedback("Enter a valid email address.", true);
          return;
        }
        const taken = users.some(
          (u) => u.user_id !== current.user_id && (u.email || "").toLowerCase() === email.toLowerCase()
        );
        if (taken) {
          showFeedback("Another account already uses that email address.", true);
          return;
        }
      }

      current.first_name = names.first_name;
      current.last_name = names.last_name;
      current.full_name = fullName;
      current.phone = phone;
      current.email = email;

      const myApptIds = getAppointments()
        .filter((a) => a.client_id === current.user_id)
        .map((a) => a.appointment_id);
      const queue = getQueueRecords();
      queue.forEach((q) => {
        if (q.appointment_id && myApptIds.indexOf(q.appointment_id) !== -1) q.client_name = fullName;
      });
      saveQueueRecords(queue);
    }

    saveUsers(users);

    const saved = getUsers().find((u) => u.user_id === selectedClientId);
    title.textContent = `Client Profile: ${saved.full_name}`;
    renderResults();
    updateHairstyleNote();
    showFeedback(`Profile changes for ${saved.full_name} were saved.`, false);
  });


  searchInput.addEventListener("input", renderResults);
  closeBtn.addEventListener("click", closeProfile);

  resultsBody.addEventListener("click", (e) => {
    const btn = e.target.closest ? e.target.closest("button[data-act]") : null;
    if (btn && btn.dataset.act === "view") openProfile(Number(btn.dataset.id));
  });


  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.HAIRSTYLE_RECS) updateHairstyleNote();
    if (e.key === STORAGE_KEYS.APPOINTMENTS || e.key === STORAGE_KEYS.USERS) {
      renderResults();
      if (selectedClientId !== null) {
        if (findVisibleClient(selectedClientId)) renderHistory();
        else closeProfile();
      }
    }
  });

  renderResults();
}

// ==============================================================================
// [SPRINT 3 - ID 015 & ID 016] INVENTORY MONITORING + PRODUCT USAGE
// ==============================================================================
function getInventoryStatus(product) {
  if (product.quantity_in_stock <= 0) {
    return { key: "out", label: "Out of Stock", cls: "badge-cancelled", needs: true };
  }
  if (product.quantity_in_stock <= product.reorder_level) {
    return { key: "low", label: "Low Stock", cls: "badge-waiting", needs: true };
  }
  return { key: "ok", label: "In Stock", cls: "badge-available", needs: false };
}

function setupInventoryMonitor() {
  const body = document.getElementById("inventory-body");
  if (!body) return;

  const searchInput = document.getElementById("inv-search");
  const filterSelect = document.getElementById("inv-filter");
  const summary = document.getElementById("inv-summary");
  const counts = document.getElementById("inv-counts");

  function render() {
    const all = getInventory();
    const query = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;
    const tally = { ok: 0, low: 0, out: 0 };
    all.forEach((p) => (tally[getInventoryStatus(p).key] += 1));

    const needing = all.filter((p) => getInventoryStatus(p).needs);
    if (needing.length === 0) {
      summary.style.borderLeftColor = "#1f6e43";
      summary.style.backgroundColor = "#e4f3ea";
      summary.style.color = "#1f6e43";
      summary.textContent = "All products are above their reorder levels.";
    } else {
      summary.style.borderLeftColor = "#9e2a2b";
      summary.style.backgroundColor = "#fbe8e8";
      summary.style.color = "#9e2a2b";
      summary.innerHTML =
        `<strong>${needing.length} product(s) need replenishment:</strong> ` +
        needing.map((p) => `${escapeHtml(p.product_name)} (${p.quantity_in_stock} left)`).join(", ");
    }
    counts.textContent = `${all.length} products  |  In stock: ${tally.ok}  |  Low: ${tally.low}  |  Out of stock: ${tally.out}`;

    const rank = { out: 0, low: 1, ok: 2 };
    const rows = all
      .filter((p) => {
        const st = getInventoryStatus(p);
        if (filter === "needs" && !st.needs) return false;
        if (filter === "out" && st.key !== "out") return false;
        if (!query) return true;
        return (p.product_name + " " + p.category).toLowerCase().indexOf(query) !== -1;
      })
      .sort((a, b) => {
        const d = rank[getInventoryStatus(a).key] - rank[getInventoryStatus(b).key];
        return d !== 0 ? d : a.product_name.localeCompare(b.product_name);
      });

    body.innerHTML = "";
    if (rows.length === 0) {
      body.innerHTML = '<tr><td colspan="7">No products match your filter.</td></tr>';
      return;
    }
    rows.forEach((p) => {
      const st = getInventoryStatus(p);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(p.product_name)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td><strong>${p.quantity_in_stock}</strong></td>
        <td>${p.reorder_level}</td>
        <td>PHP ${Number(p.unit_cost).toFixed(2)}</td>
        <td><span class="badge ${st.cls}">${st.label}</span></td>
        <td>${st.needs ? "Restock needed" : "—"}</td>
      `;
      body.appendChild(tr);
    });
  }

  searchInput.addEventListener("input", render);
  filterSelect.addEventListener("change", render);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.INVENTORY) render();
  });
  render();
}

function setupProductUsage(stylist) {
  const form = document.getElementById("usage-form");
  if (!form) return;

  const serviceSelect = document.getElementById("usage-service");
  const itemsBox = document.getElementById("usage-items");
  const addRowBtn = document.getElementById("usage-add-row");
  const feedback = document.getElementById("usage-feedback");
  const logBody = document.getElementById("usage-log-body");

  const MAX_ROWS = 10;
  let rows = [{ productId: "", qty: "" }];

  function showFeedback(message, isError) {
    feedback.style.display = "block";
    showBanner(feedback, message, isError);
  }

  function dateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getEligibleServices() {
    const users = getUsers();
    const today = getTodayDateString();
    const cutoff = dateOffset(-7);
    const list = [];

    getAppointments()
      .filter(
        (a) =>
          a.stylist_id === stylist.user_id &&
          (a.status === "Confirmed" || a.status === "Completed") &&
          a.date <= today &&
          a.date >= cutoff
      )
      .sort((a, b) => `${b.date} ${b.start_time}`.localeCompare(`${a.date} ${a.start_time}`))
      .forEach((a) => {
        const cli = users.find((u) => u.user_id === a.client_id);
        list.push({
          key: `appt:${a.appointment_id}`,
          label: `Booking #${a.appointment_id} | ${a.date} ${a.start_time} | ${cli ? cli.full_name : "Client"} | ${getAppointmentDisplayText(a)}`,
        });
      });

    getQueueRecords()
      .filter(
        (q) =>
          q.stylist_id === stylist.user_id &&
          !q.appointment_id &&
          (q.status === "In Service" || q.status === "Completed")
      )
      .forEach((q) => {
        list.push({
          key: `queue:${q.queue_id}`,
          label: `Walk-in #${q.queue_number} | ${q.client_name} | ${getAppointmentDisplayText(q)} (${q.status})`,
        });
      });

    return list;
  }

  function describeTarget(tx) {
    const users = getUsers();
    if (tx.appointment_id) {
      const a = getAppointments().find((x) => x.appointment_id === tx.appointment_id);
      if (!a) return `Booking #${tx.appointment_id}`;
      const cli = users.find((u) => u.user_id === a.client_id);
      return `${cli ? escapeHtml(cli.full_name) : "Client"} (${escapeHtml(getAppointmentDisplayText(a))}, ${a.date})`;
    }
    const q = getQueueRecords().find((x) => x.queue_id === tx.queue_id);
    return q ? `${escapeHtml(q.client_name)} (walk-in, ${escapeHtml(getAppointmentDisplayText(q))})` : "Walk-in";
  }

  function renderServiceOptions() {
    const previous = serviceSelect.value;
    serviceSelect.innerHTML = '<option value="">-- Choose a service you performed --</option>';
    getEligibleServices().forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.key;
      opt.textContent = s.label;
      serviceSelect.appendChild(opt);
    });
    serviceSelect.value = previous;
  }

  function renderRows() {
    const inventory = getInventory()
      .slice()
      .sort((a, b) => a.product_name.localeCompare(b.product_name));

    itemsBox.innerHTML = "";

    rows.forEach((row, index) => {
      const wrap = document.createElement("div");
      wrap.className = "usage-row";

      const select = document.createElement("select");
      select.title = `Product ${index + 1}`;
      let optionsHtml = '<option value="">-- Choose a product --</option>';
      inventory.forEach((p) => {
        const st = getInventoryStatus(p);
        const takenByOtherRow = rows.some(
          (r, i) => i !== index && String(r.productId) === String(p.product_id)
        );
        const disabled = st.key === "out" || takenByOtherRow;
        const label =
          st.key === "out"
            ? `${p.product_name} (out of stock)`
            : `${p.product_name} (${p.quantity_in_stock} in stock${st.key === "low" ? " - low" : ""})`;
        optionsHtml += `<option value="${p.product_id}"${disabled ? " disabled" : ""}${
          String(row.productId) === String(p.product_id) ? " selected" : ""
        }>${escapeHtml(label)}</option>`;
      });
      select.innerHTML = optionsHtml;
      select.value = row.productId;
      select.addEventListener("change", () => {
        rows[index].productId = select.value;
        renderRows();
      });

      const qty = document.createElement("input");
      qty.type = "number";
      qty.min = "1";
      qty.step = "1";
      qty.placeholder = "Qty";
      qty.title = `Quantity for product ${index + 1}`;
      qty.value = row.qty;
      qty.addEventListener("input", () => {
        rows[index].qty = qty.value;
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-danger btn-sm";
      remove.textContent = "Remove";
      remove.disabled = rows.length === 1;
      remove.addEventListener("click", () => {
        rows.splice(index, 1);
        renderRows();
      });

      wrap.appendChild(select);
      wrap.appendChild(qty);
      wrap.appendChild(remove);
      itemsBox.appendChild(wrap);
    });

    addRowBtn.disabled = rows.length >= MAX_ROWS;
  }

  function renderLog() {
    const products = getInventory();
    const mine = getInventoryLog().filter((t) => t.recorded_by === stylist.user_id);

    const groups = [];
    const byKey = {};
    mine.forEach((t) => {
      const key =
        t.batch_id !== undefined
          ? `b${t.batch_id}`
          : `${t.appointment_id}|${t.queue_id}|${t.transaction_date}`;
      if (!byKey[key]) {
        byKey[key] = { first: t, lastId: t.transaction_id, lines: [] };
        groups.push(byKey[key]);
      }
      byKey[key].lines.push(t);
      byKey[key].lastId = Math.max(byKey[key].lastId, t.transaction_id);
    });

    groups.sort((a, b) => b.lastId - a.lastId);

    logBody.innerHTML = "";
    if (groups.length === 0) {
      logBody.innerHTML = '<tr><td colspan="3">No product usage recorded yet.</td></tr>';
      return;
    }

    groups.slice(0, 15).forEach((g) => {
      const productsHtml = g.lines
        .map((t) => {
          const p = products.find((x) => x.product_id === t.product_id);
          return `${p ? escapeHtml(p.product_name) : "Unknown product"} &times; ${Math.abs(t.quantity_change)}`;
        })
        .join("<br>");

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(g.first.transaction_date)}</td>
        <td>${describeTarget(g.first)}</td>
        <td>${productsHtml}</td>
      `;
      logBody.appendChild(tr);
    });
  }

  addRowBtn.addEventListener("click", () => {
    if (rows.length < MAX_ROWS) {
      rows.push({ productId: "", qty: "" });
      renderRows();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const target = serviceSelect.value;

    if (!target) {
      showFeedback("Incomplete Information: choose the service you performed.", true);
      return;
    }

    const filled = rows
      .map((r, i) => ({ productId: r.productId, qty: String(r.qty).trim(), n: i + 1 }))
      .filter((r) => r.productId !== "" || r.qty !== "");

    if (filled.length === 0) {
      showFeedback("Add at least one product and its quantity.", true);
      return;
    }

    if (!getEligibleServices().some((s) => s.key === target)) {
      showFeedback("That service is no longer available for recording.", true);
      renderServiceOptions();
      return;
    }

    const inventory = getInventory();
    const items = [];
    const seen = {};

    for (const r of filled) {
      if (!r.productId || !r.qty) {
        showFeedback(`Product ${r.n}: choose a product and enter a quantity.`, true);
        return;
      }
      if (!/^[0-9]+$/.test(r.qty) || Number(r.qty) < 1) {
        showFeedback(`Product ${r.n}: enter the quantity as a whole number of 1 or more.`, true);
        return;
      }
      const product = inventory.find((p) => p.product_id === Number(r.productId));
      if (!product) {
        showFeedback(`Product ${r.n}: product not found.`, true);
        return;
      }
      if (seen[product.product_id]) {
        showFeedback(`${product.product_name} is listed more than once. Combine it into one line.`, true);
        return;
      }
      if (Number(r.qty) > product.quantity_in_stock) {
        showFeedback(
          `Only ${product.quantity_in_stock} of ${product.product_name} left in stock. Enter a smaller quantity.`,
          true
        );
        return;
      }
      seen[product.product_id] = true;
      items.push({ product: product, qty: Number(r.qty) });
    }

    items.forEach((it) => {
      it.product.quantity_in_stock -= it.qty;
    });
    saveInventory(inventory);

    const log = getInventoryLog();
    const [kind, idText] = target.split(":");
    let nextId = log.length > 0 ? Math.max(...log.map((t) => t.transaction_id)) + 1 : 1;
    const batchId = nextId;
    const stamp = `${getTodayDateString()} ${getCurrentTimeString()}`;
    items.forEach((it) => {
      log.push({
        transaction_id: nextId++,
        batch_id: batchId,
        product_id: it.product.product_id,
        appointment_id: kind === "appt" ? Number(idText) : null,
        queue_id: kind === "queue" ? Number(idText) : null,
        recorded_by: stylist.user_id,
        transaction_type: "Usage",
        quantity_change: -it.qty,
        remarks: "",
        transaction_date: stamp,
      });
    });
    saveInventoryLog(log);

    const alerts = items
      .filter((it) => getInventoryStatus(it.product).needs)
      .map((it) => `${it.product.product_name} is now ${getInventoryStatus(it.product).label.toLowerCase()}`);

    let message =
      `Recorded ${items.length} product(s): ` +
      items.map((it) => `${it.qty} x ${it.product.product_name}`).join(", ") + ".";
    if (alerts.length > 0) {
      message += ` Replenishment needed: ${alerts.join("; ")}.`;
    }
    showFeedback(message, alerts.length > 0);

    rows = [{ productId: "", qty: "" }];
    renderRows();
    renderLog();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.INVENTORY) renderRows();
    if (e.key === STORAGE_KEYS.INVENTORY_LOG) renderLog();
    if (e.key === STORAGE_KEYS.APPOINTMENTS || e.key === STORAGE_KEYS.QUEUE) renderServiceOptions();
  });

  renderServiceOptions();
  renderRows();
  renderLog();
}

// ==============================================================================
// [SPRINT 1 - ID 003 & SPRINT 3 - ID 007] SERVICES & PRICES + HAIRSTYLE RECOMMENDATIONS
// ==============================================================================
function hairstyleSuitsFace(hairstyle, faceShape) {
  return !!faceShape && hairstyle.face_shapes.indexOf(faceShape) !== -1;
}

function formatPeso(amount) {
  return "PHP " + Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getHairstyleServices(hairstyle) {
  const services = getServices();
  const lines = (hairstyle.service_ids || [])
    .map((id) => services.find((s) => s.service_id === id))
    .filter(Boolean);
  return {
    lines: lines,
    totalPrice: lines.reduce((sum, s) => sum + s.price, 0),
    totalMinutes: lines.reduce((sum, s) => sum + s.duration_minutes, 0),
  };
}

function registerChosenHairstyle(clientId, hairstyleId, stylistId = null) {
  const recs = getHairstyleRecs();
  const now = `${getTodayDateString()} ${getCurrentTimeString()}`;

  let resolvedStylistId = stylistId;
  if (!resolvedStylistId) {
    const clientAppts = getAppointments()
      .filter((a) => a.client_id === clientId && a.status !== "Cancelled")
      .sort((a, b) => `${b.date} ${b.start_time}`.localeCompare(`${a.date} ${a.start_time}`));
    if (clientAppts.length > 0) {
      resolvedStylistId = clientAppts[0].stylist_id;
    }
  }

  let rec = recs.find((r) => r.client_id === clientId && r.hairstyle_id === hairstyleId);
  if (!rec) {
    rec = {
      recommendation_id: recs.length > 0 ? Math.max(...recs.map((r) => r.recommendation_id)) + 1 : 1,
      client_id: clientId,
      hairstyle_id: hairstyleId,
      stylist_id: resolvedStylistId || null,
      recommendation_date: now,
      was_selected: true,
    };
    recs.push(rec);
  } else {
    rec.recommendation_date = now;
    if (resolvedStylistId) rec.stylist_id = resolvedStylistId;
  }

  recs.forEach((r) => {
    if (r.client_id === clientId) {
      r.was_selected = r.hairstyle_id === hairstyleId;
    }
  });

  saveHairstyleRecs(recs);
  window.dispatchEvent(
    new CustomEvent("lms:hairstyle-selected", {
      detail: { clientId, hairstyleId },
    })
  );
}

function clearChosenHairstyle(clientId) {
  const recs = getHairstyleRecs();
  recs.forEach((r) => {
    if (r.client_id === clientId) {
      r.was_selected = false;
    }
  });
  saveHairstyleRecs(recs);
  window.dispatchEvent(
    new CustomEvent("lms:hairstyle-selected", {
      detail: { clientId, hairstyleId: null },
    })
  );
}

// Counts how many clients have picked each hairstyle (via selection records, bookings, or walk-ins)
function getHairstylePopularityMap() {
  const pickersByStyle = {};
  const addPick = (hairstyleId, clientKey) => {
    if (!hairstyleId) return;
    const key = String(hairstyleId);
    if (!pickersByStyle[key]) pickersByStyle[key] = new Set();
    pickersByStyle[key].add(String(clientKey));
  };

  getHairstyleRecs().forEach((r) => {
    if (r.was_selected) {
      addPick(r.hairstyle_id, `rec:${r.client_id}`);
    }
  });

  getAppointments().forEach((a) => {
    if (a.hairstyle_id && a.status !== "Cancelled") {
      addPick(a.hairstyle_id, `appt:${a.client_id || a.appointment_id}`);
    }
  });

  getQueueRecords().forEach((q) => {
    if (!q.appointment_id && q.hairstyle_id && q.status !== "Cancelled") {
      addPick(q.hairstyle_id, `walkin:${q.client_name.trim().toLowerCase()}`);
    }
  });

  const counts = {};
  Object.keys(pickersByStyle).forEach((id) => {
    counts[id] = pickersByStyle[id].size;
  });
  return counts;
}

function setupHairstyleRecommendations(client) {
  const card = document.getElementById("hairstyle-card");
  if (!card) return;

  const faceNote = document.getElementById("hs-faceshape-note");
  const form = document.getElementById("hs-form");
  const categorySelect = document.getElementById("hs-category");
  const searchInput = document.getElementById("hs-search");
  const lengthSelect = document.getElementById("hs-length");
  const showAllBtn = document.getElementById("hs-show-all-btn");
  const feedback = document.getElementById("hs-feedback");
  const selectedBox = document.getElementById("hs-selected");
  const results = document.getElementById("hs-results");
  const paginationBar = document.getElementById("hs-pagination");

  const PAGE_SIZE = 9; // 3 rows x 3 columns
  let viewMode = "all"; // "all" | "recommended"
  let currentPage = 1;

  function getMe() {
    return getUsers().find((u) => u.user_id === client.user_id) || client;
  }

  function matchesCategory(hairstyle, category) {
    if (!category || category === "Others") return true;
    return hairstyle.categories.indexOf(category) !== -1;
  }

  function getDisplayList(faceShape, prefs, popularityMap) {
    const category = prefs.category || "";
    const length = prefs.length || "Any";
    const wantsLength = length !== "Any";

    let list = getHairstyles().filter((h) => matchesCategory(h, category));

    const search = searchInput.value.trim().toLowerCase();

    if (search) {
      list = list.filter((h) => {
      const name = h.hairstyle_name.toLowerCase();
      const description = (h.description || "").toLowerCase();
      const services = getHairstyleServices(h).lines;

    return name.includes(search) ||
      description.includes(search) ||
      services.some((service) =>
        service.service_name.toLowerCase().includes(search)
      );
  });
}

    if (viewMode === "all") {
      if (wantsLength) {
        list = list.filter((h) => h.hair_length === length || h.hair_length === "Any");
      }
      return list
        .map((h) => ({
          hairstyle: h,
          suited: hairstyleSuitsFace(h, faceShape),
          popularity: popularityMap[String(h.hairstyle_id)] || 0,
        }))
        .sort((a, b) => a.hairstyle.hairstyle_name.localeCompare(b.hairstyle.hairstyle_name));
    }

    const enriched = list.map((h) => ({
      hairstyle: h,
      suited: hairstyleSuitsFace(h, faceShape),
      popularity: popularityMap[String(h.hairstyle_id)] || 0,
      lengthScore: wantsLength ? (h.hair_length === length ? 2 : h.hair_length === "Any" ? 1 : 0) : 0,
    }));

    if (faceShape) {
      return enriched.sort((a, b) => {
        if (a.suited !== b.suited) return a.suited ? -1 : 1;
        if (b.lengthScore !== a.lengthScore) return b.lengthScore - a.lengthScore;
        if (b.popularity !== a.popularity) return b.popularity - a.popularity;
        return a.hairstyle.hairstyle_name.localeCompare(b.hairstyle.hairstyle_name);
      });
    }

    return enriched.sort((a, b) => {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      if (b.lengthScore !== a.lengthScore) return b.lengthScore - a.lengthScore;
      return a.hairstyle.hairstyle_name.localeCompare(b.hairstyle.hairstyle_name);
    });
  }

  function logRecommendations(list) {
    const recs = getHairstyleRecs();
    const now = `${getTodayDateString()} ${getCurrentTimeString()}`;
    list.forEach((item) => {
      const existing = recs.find(
        (r) => r.client_id === client.user_id && r.hairstyle_id === item.hairstyle.hairstyle_id
      );
      if (existing) {
        existing.recommendation_date = now;
      } else {
        recs.push({
          recommendation_id: recs.length > 0 ? Math.max(...recs.map((r) => r.recommendation_id)) + 1 : 1,
          client_id: client.user_id,
          hairstyle_id: item.hairstyle.hairstyle_id,
          recommendation_date: now,
          was_selected: false,
        });
      }
    });
    saveHairstyleRecs(recs);
  }

  function getSelectedHairstyleId() {
    const rec = getHairstyleRecs().find((r) => r.client_id === client.user_id && r.was_selected);
    return rec ? rec.hairstyle_id : null;
  }

  function cardHtml(item, chosenId, showCategory, hasFaceShape) {
    const h = item.hairstyle;
    const isChosen = h.hairstyle_id === chosenId;
    const info = getHairstyleServices(h);

    const starHtml =
      item.popularity > 0
        ? `<span class="popular-star" title="Popular — picked by ${item.popularity} client(s)" aria-label="Popular hairstyle">&#9733;</span>`
        : "";

    const tags = [];
    if (viewMode === "recommended" && hasFaceShape && item.suited) {
      tags.push(`<span class="badge badge-confirmed">Suits your face</span>`);
    }
    if (item.popularity > 0) {
      tags.push(`<span class="badge badge-popular">Popular (${item.popularity} picked)</span>`);
    }
    if (h.hair_length !== "Any") {
      tags.push(`<span class="badge badge-neutral">${escapeHtml(h.hair_length)} hair</span>`);
    }
    if (showCategory) {
      tags.push(`<span class="badge badge-neutral">${h.categories.length > 1 ? "Unisex" : escapeHtml(h.categories[0])}</span>`);
    }

    return `
        <article class="style-card${isChosen ? " is-selected" : ""}"
                 data-act="pick-style" data-id="${h.hairstyle_id}"
                 role="button" tabindex="0" aria-pressed="${isChosen}">
          <div class="style-card-top">
            <h4>${escapeHtml(h.hairstyle_name)}</h4>
            ${starHtml}
          </div>
          ${tags.length > 0 ? `<div class="tag-row">${tags.join("")}</div>` : ""}
          <p>${escapeHtml(h.description)}</p>
          <div class="style-services">
            <div class="service-line">
              <span>Estimated Time</span>
              <span>about ${info.totalMinutes} mins</span>
            </div>
            <div class="service-total" style="border-top: none; padding-top: 0; margin-top: 0;">
              <span>Estimated Price</span>
              <strong>${formatPeso(info.totalPrice)}</strong>
            </div>
          </div>
        </article>`;
  }

  function renderPagination(totalItems) {
    if (!paginationBar) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    if (totalItems === 0) {
      paginationBar.innerHTML = "";
      return;
    }

    const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
    const endIdx = Math.min(totalItems, currentPage * PAGE_SIZE);

    let buttonsHtml = `<button type="button" class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>Prev</button>`;
    for (let p = 1; p <= totalPages; p++) {
      buttonsHtml += `<button type="button" class="page-btn${p === currentPage ? " is-active" : ""}" data-page="${p}">${p}</button>`;
    }
    buttonsHtml += `<button type="button" class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`;

    paginationBar.innerHTML = `
      <span class="pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} hairstyles (Page ${currentPage} of ${totalPages})</span>
      <div class="pagination-buttons">${buttonsHtml}</div>
    `;
  }

  function syncCardSelectionUI(chosenId) {
    results.querySelectorAll("[data-act='pick-style']").forEach((el) => {
      const isMatch = Number(el.dataset.id) === chosenId;
      el.classList.toggle("is-selected", isMatch);
      el.setAttribute("aria-pressed", String(isMatch));
    });
  }

  function render() {
    const me = getMe();
    const shape = me.face_shape || "";
    const category = categorySelect.value;

    faceNote.textContent = "";
    faceNote.style.display = "none";

    if (selectedBox) {
      selectedBox.style.display = "none";
      selectedBox.innerHTML = "";
    }

    const chosenId = getSelectedHairstyleId();
    const popularityMap = getHairstylePopularityMap();
    const items = getDisplayList(shape, { category: category, length: lengthSelect.value }, popularityMap);

    if (items.length === 0) {
      results.innerHTML = '<p style="grid-column: 1 / -1;">No hairstyles match your selected filters.</p>';
      renderPagination(0);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);
    const showCategory = !category || category === "Others";

    results.innerHTML = pageItems
      .map((item) => cardHtml(item, chosenId, showCategory, !!shape))
      .join("");

    renderPagination(items.length);
  }

  function handleSelectCard(hairstyleId) {
    if (!getHairstyles().some((h) => h.hairstyle_id === hairstyleId)) return;
    if (getSelectedHairstyleId() === hairstyleId) {
      clearChosenHairstyle(client.user_id);
      syncCardSelectionUI(null);
    } else {
      registerChosenHairstyle(client.user_id, hairstyleId);
      syncCardSelectionUI(hairstyleId);
    }
  }

  categorySelect.value = "";
  lengthSelect.value = "Any";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    viewMode = "recommended";
    currentPage = 1;

    const users = getUsers();
    const idx = users.findIndex((u) => u.user_id === client.user_id);
    if (idx !== -1) {
      users[idx].style_preferences = { category: categorySelect.value, length: lengthSelect.value };
      saveUsers(users);
    }

    const shape = (idx !== -1 ? users[idx].face_shape : "") || "";
    const popularityMap = getHairstylePopularityMap();
    const items = getDisplayList(shape, { category: categorySelect.value, length: lengthSelect.value }, popularityMap);

    if (shape) {
      const suited = items.filter((item) => item.suited);
      if (suited.length > 0) logRecommendations(suited);
    }

    render();

    feedback.style.display = "block";
    if (shape) {
      const suitedCount = items.filter((item) => item.suited).length;
      showBanner(
        feedback,
        suitedCount > 0
          ? `Showing personalized recommendations for a ${shape} face (${suitedCount} suited hairstyle(s) listed first).`
          : `No specific match for a ${shape} face under these filters. Showing remaining hairstyles sorted by popularity.`,
        false
      );
    } else {
      const totalPicks = Object.values(popularityMap).reduce((sum, n) => sum + n, 0);
      showBanner(
        feedback,
        totalPicks > 0
          ? "Showing recommended hairstyles ranked from most popular (picked by clients) to least popular."
          : "Showing hairstyles (sorted by client popularity once clients pick hairstyles).",
        false
      );
    }
  });

  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      searchInput.value = "";
      categorySelect.value = "";
      lengthSelect.value = "Any";
      viewMode = "all";
      currentPage = 1;
      feedback.style.display = "none";
      render();
    });
  }
  searchInput.addEventListener("input", () => {
  currentPage = 1;
  feedback.style.display = "none";
  render();
  });

  categorySelect.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  lengthSelect.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  if (paginationBar) {
    paginationBar.addEventListener("click", (e) => {
      const btn = e.target.closest ? e.target.closest("button[data-page]") : null;
      if (!btn || btn.disabled) return;
      currentPage = Number(btn.dataset.page);
      render();
    });
  }

  results.addEventListener("click", (e) => {
    const cardEl = e.target.closest ? e.target.closest("[data-act='pick-style']") : null;
    if (!cardEl) return;
    handleSelectCard(Number(cardEl.dataset.id));
  });

  results.addEventListener("dblclick", (e) => {
    const cardEl = e.target.closest ? e.target.closest("[data-act='pick-style']") : null;
    if (!cardEl) return;
    const hairstyleId = Number(cardEl.dataset.id);
    if (!getHairstyles().some((h) => h.hairstyle_id === hairstyleId)) return;
    registerChosenHairstyle(client.user_id, hairstyleId);
    syncCardSelectionUI(hairstyleId);
    window.dispatchEvent(
      new CustomEvent("lms:open-booking", {
        detail: { hairstyleId },
      })
    );
  });

  results.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const cardEl = e.target.closest ? e.target.closest("[data-act='pick-style']") : null;
    if (!cardEl) return;
    e.preventDefault();
    handleSelectCard(Number(cardEl.dataset.id));
  });

  window.addEventListener("storage", (e) => {
    if (
      e.key === STORAGE_KEYS.USERS ||
      e.key === STORAGE_KEYS.HAIRSTYLE_RECS ||
      e.key === STORAGE_KEYS.APPOINTMENTS ||
      e.key === STORAGE_KEYS.QUEUE
    ) {
      render();
    }
  });

  render();
}

// ==============================================================================
// [SPRINT 3 - ID 009 & ID 022] BEFORE & AFTER GALLERY
// ==============================================================================
const GALLERY_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const GALLERY_MAX_BYTES = 5 * 1024 * 1024;

function compressImage(file, maxSide = 900, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not open the image."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function validateGalleryFile(file) {
  if (GALLERY_ALLOWED_TYPES.indexOf(file.type) === -1) {
    return "Unsupported file. Please upload a JPG, PNG, or WebP image.";
  }
  if (file.size > GALLERY_MAX_BYTES) {
    return "That file is larger than 5 MB. Please choose a smaller photo.";
  }
  return "";
}

function openImageViewer(src, caption) {
  if (!document.body) return;
  const overlay = document.createElement("div");
  overlay.className = "viewer-overlay";
  overlay.innerHTML = `<img src="${escapeHtml(src)}" alt="Gallery photo"><p>${escapeHtml(caption || "Click anywhere to close")}</p>`;
  const close = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
}

function setupGalleryManager(stylist) {
  const form = document.getElementById("gallery-form");
  if (!form) return;

  const clientSelect = document.getElementById("gallery-client");
  const typeSelect = document.getElementById("gallery-type");
  const fileInput = document.getElementById("gallery-file");
  const captionInput = document.getElementById("gallery-caption");
  const feedback = document.getElementById("gallery-feedback");
  const filterSelect = document.getElementById("gallery-filter");
  const body = document.getElementById("gallery-body");

  const editor = document.getElementById("gallery-editor");
  const editInfo = document.getElementById("ge-info");
  const editType = document.getElementById("ge-type");
  const editCaption = document.getElementById("ge-caption");
  const editFile = document.getElementById("ge-file");
  const editSave = document.getElementById("ge-save");
  const editCancel = document.getElementById("ge-cancel");

  let editingId = null;
  let busy = false;

  const STORAGE_FULL =
    "Storage is full. Delete some photos and try again. (This limit only applies while data is kept in the browser.)";

  function showFeedback(message, isError) {
    feedback.style.display = "block";
    showBanner(feedback, message, isError);
  }

  function getMyClients() {
    const ids = getAppointments()
      .filter((a) => a.stylist_id === stylist.user_id)
      .map((a) => a.client_id);
    return getUsers()
      .filter((u) => u.role === "client" && ids.indexOf(u.user_id) !== -1)
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  function renderClientOptions() {
    const clients = getMyClients();
    const prevClient = clientSelect.value;
    const prevFilter = filterSelect.value;

    clientSelect.innerHTML = '<option value="">-- Choose a client --</option>';
    filterSelect.innerHTML = '<option value="">All my clients</option>';
    clients.forEach((c) => {
      const a = document.createElement("option");
      a.value = c.user_id;
      a.textContent = c.full_name;
      clientSelect.appendChild(a);
      const b = document.createElement("option");
      b.value = c.user_id;
      b.textContent = c.full_name;
      filterSelect.appendChild(b);
    });
    clientSelect.value = prevClient;
    filterSelect.value = prevFilter;
  }

  function render() {
    const users = getUsers();
    const filterId = filterSelect.value ? Number(filterSelect.value) : null;
    const mine = getGalleryPhotos()
      .filter((p) => p.uploaded_by === stylist.user_id && (filterId === null || p.client_id === filterId))
      .sort((a, b) => b.photo_id - a.photo_id);

    body.innerHTML = "";
    if (mine.length === 0) {
      body.innerHTML = '<tr><td colspan="6">No photos uploaded yet.</td></tr>';
      return;
    }
    mine.forEach((p) => {
      const cli = users.find((u) => u.user_id === p.client_id);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img class="thumb" src="${escapeHtml(p.photo_url)}" alt="${escapeHtml(p.photo_type)} photo" data-act="view" data-id="${p.photo_id}"></td>
        <td>${cli ? escapeHtml(cli.full_name) : "Unknown client"}</td>
        <td><span class="badge badge-neutral">${escapeHtml(p.photo_type)}</span></td>
        <td>${p.caption ? escapeHtml(p.caption) : "—"}</td>
        <td>${escapeHtml(p.uploaded_at)}</td>
        <td>
          <div class="action-group">
            <button type="button" class="btn btn-outline btn-sm" data-act="edit" data-id="${p.photo_id}">Edit</button>
            <button type="button" class="btn btn-danger btn-sm" data-act="delete" data-id="${p.photo_id}">Delete</button>
          </div>
        </td>
      `;
      body.appendChild(tr);
    });
  }

  function closeEditor() {
    editingId = null;
    editor.style.display = "none";
    editFile.value = "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;

    const clientId = Number(clientSelect.value);
    const type = typeSelect.value;
    const file = fileInput.files && fileInput.files[0];
    const caption = captionInput.value.trim();

    if (!clientId || !type || !file) {
      showFeedback("Incomplete Information: choose a client, the photo type, and a photo.", true);
      return;
    }
    if (type !== "Before" && type !== "After") {
      showFeedback("Choose Before or After for the photo type.", true);
      return;
    }
    if (!getMyClients().some((c) => c.user_id === clientId)) {
      showFeedback("You can only upload photos for clients who have booked with you.", true);
      return;
    }
    if (caption.length > 120) {
      showFeedback("The caption must be 120 characters or fewer.", true);
      return;
    }
    const fileError = validateGalleryFile(file);
    if (fileError) {
      showFeedback(fileError, true);
      return;
    }

    busy = true;
    let dataUrl;
    try {
      dataUrl = await compressImage(file);
    } catch (err) {
      busy = false;
      showFeedback("The image could not be read. Check the file and try uploading it again.", true);
      return;
    }

    const photos = getGalleryPhotos();
    photos.push({
      photo_id: photos.length > 0 ? Math.max(...photos.map((p) => p.photo_id)) + 1 : 1,
      client_id: clientId,
      photo_type: type,
      photo_url: dataUrl,
      caption: caption,
      uploaded_by: stylist.user_id,
      uploaded_at: `${getTodayDateString()} ${getCurrentTimeString()}`,
    });
    if (!saveGalleryPhotos(photos)) {
      busy = false;
      showFeedback(STORAGE_FULL, true);
      return;
    }

    busy = false;
    fileInput.value = "";
    captionInput.value = "";
    typeSelect.value = "";
    render();
    showFeedback(`${type} photo uploaded. The client can now see it in their gallery.`, false);
  });

  body.addEventListener("click", (e) => {
    const el = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!el) return;
    const id = Number(el.dataset.id);
    const photo = getGalleryPhotos().find((p) => p.photo_id === id && p.uploaded_by === stylist.user_id);
    if (!photo) return;

    if (el.dataset.act === "view") {
      openImageViewer(photo.photo_url, photo.caption);
    } else if (el.dataset.act === "edit") {
      const cli = getUsers().find((u) => u.user_id === photo.client_id);
      editingId = id;
      editInfo.textContent = `${cli ? cli.full_name : "Client"} | uploaded ${photo.uploaded_at}`;
      editType.value = photo.photo_type;
      editCaption.value = photo.caption || "";
      editFile.value = "";
      editor.style.display = "block";
      if (editor.scrollIntoView) editor.scrollIntoView({ behavior: "smooth" });
    } else if (el.dataset.act === "delete") {
      if (!window.confirm("Delete this photo? The client will no longer see it.")) return;
      const remaining = getGalleryPhotos().filter((p) => p.photo_id !== id);
      saveGalleryPhotos(remaining);
      if (editingId === id) closeEditor();
      render();
      showFeedback("Photo deleted.", false);
    }
  });

  editSave.addEventListener("click", async () => {
    if (busy || editingId === null) return;
    const type = editType.value;
    const caption = editCaption.value.trim();
    const file = editFile.files && editFile.files[0];

    if (type !== "Before" && type !== "After") {
      showFeedback("Choose Before or After for the photo type.", true);
      return;
    }
    if (caption.length > 120) {
      showFeedback("The caption must be 120 characters or fewer.", true);
      return;
    }

    let dataUrl = null;
    if (file) {
      const fileError = validateGalleryFile(file);
      if (fileError) {
        showFeedback(fileError, true);
        return;
      }
      busy = true;
      try {
        dataUrl = await compressImage(file);
      } catch (err) {
        busy = false;
        showFeedback("The image could not be read. Check the file and try again.", true);
        return;
      }
      busy = false;
    }

    const photos = getGalleryPhotos();
    const idx = photos.findIndex((p) => p.photo_id === editingId && p.uploaded_by === stylist.user_id);
    if (idx === -1) {
      showFeedback("Photo not found.", true);
      return;
    }
    photos[idx].photo_type = type;
    photos[idx].caption = caption;
    if (dataUrl) photos[idx].photo_url = dataUrl;

    if (!saveGalleryPhotos(photos)) {
      showFeedback(STORAGE_FULL, true);
      return;
    }
    closeEditor();
    render();
    showFeedback("Photo details updated.", false);
  });

  editCancel.addEventListener("click", closeEditor);
  filterSelect.addEventListener("change", render);

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.GALLERY) render();
    if (e.key === STORAGE_KEYS.APPOINTMENTS) renderClientOptions();
  });

  renderClientOptions();
  render();
}

function setupClientGallery(client) {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const filterSelect = document.getElementById("gallery-view-filter");
  const count = document.getElementById("gallery-count");

  function render() {
    const users = getUsers();
    const photos = getGalleryPhotos()
      .filter(
        (p) => p.client_id === client.user_id && (!filterSelect.value || p.photo_type === filterSelect.value)
      )
      .sort((a, b) => b.photo_id - a.photo_id);

    count.textContent = `${photos.length} photo(s)`;

    if (photos.length === 0) {
      grid.innerHTML =
        '<p style="grid-column: 1 / -1;">No photos to show yet. Your stylist can add before-and-after photos after your service.</p>';
      return;
    }

    grid.innerHTML = photos
      .map((p) => {
        const by = users.find((u) => u.user_id === p.uploaded_by);
        return `
        <article class="photo-card">
          <img src="${escapeHtml(p.photo_url)}" alt="${escapeHtml(p.photo_type)} photo" data-act="view" data-id="${p.photo_id}">
          <div class="photo-meta">
            <span class="badge badge-neutral">${escapeHtml(p.photo_type)}</span>
            <p>${p.caption ? escapeHtml(p.caption) : ""}</p>
            <small>${escapeHtml(p.uploaded_at.split(" ")[0])}${by ? " | " + escapeHtml(by.full_name) : ""}</small>
          </div>
        </article>`;
      })
      .join("");
  }

  grid.addEventListener("click", (e) => {
    const img = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!img || img.dataset.act !== "view") return;
    const photo = getGalleryPhotos().find((p) => p.photo_id === Number(img.dataset.id) && p.client_id === client.user_id);
    if (photo) openImageViewer(photo.photo_url, photo.caption);
  });

  filterSelect.addEventListener("change", render);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.GALLERY) render();
  });

  render();
}

// ==============================================================================
// [SPRINT 4 - ID 026] ADMIN: MANAGE OTHER USERS' ACCOUNTS  +  CLIENT "MY PROFILE"
// ==============================================================================
const ACCOUNT_PHONE_PATTERN = /^[0-9+\-()\s]{7,20}$/;
const ACCOUNT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function validateAccountContact(users, userId, fields, original) {
  const fullName = (fields.full_name || "").trim();
  const phone = (fields.phone || "").trim();
  const email = (fields.email || "").trim();

  if (!fullName || !phone || !email) {
    return "Incomplete Information: name, phone number, and email are required.";
  }
  if (fullName.length > 150) return "The name must be 150 characters or fewer.";
  if (phone !== (original.phone || "") && !ACCOUNT_PHONE_PATTERN.test(phone)) {
    return "Enter a valid phone number (digits, spaces, +, -, parentheses).";
  }
  if (email !== (original.email || "")) {
    if (!ACCOUNT_EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
    const taken = users.some(
      (u) => u.user_id !== userId && (u.email || "").toLowerCase() === email.toLowerCase()
    );
    if (taken) return "Another account already uses that email address.";
  }
  return "";
}

function setupMyProfile(client) {
  const form = document.getElementById("my-profile-form");
  if (!form) return;

  const usernameInput = document.getElementById("mp-username");
  const emailInput = document.getElementById("mp-email");
  const phoneInput = document.getElementById("mp-phone");
  const faceShapeText = document.getElementById("mp-faceshape");
  const feedback = document.getElementById("mp-feedback");

  const pwForm = document.getElementById("mp-password-form");
  const pwCurrent = document.getElementById("mp-currentpass");
  const pwNew = document.getElementById("mp-newpass");
  const pwConfirm = document.getElementById("mp-confirmpass");
  const pwFeedback = document.getElementById("mp-password-feedback");

  function getMe() {
    return getUsers().find((u) => u.user_id === client.user_id) || client;
  }

  function showFeedback(el, message, isError) {
    el.style.display = "block";
    showBanner(el, message, isError);
  }

  function fillForm() {
    const me = getMe();

    fillNameFields("mp", me);
    usernameInput.value = me.username || "";
    emailInput.value = me.email || "";
    phoneInput.value = me.phone || "";
    faceShapeText.textContent = me.face_shape || "Not recorded";
  }

  function refreshSession(me) {
    setCurrentUser(me);

    const nameSpan = document.querySelector(".nav-username");

    if (nameSpan) nameSpan.textContent = me.full_name;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const users = getUsers();
    const idx = users.findIndex((u) => u.user_id === client.user_id);

    if (idx === -1) {
      showFeedback(feedback, "Your account could not be found.", true);
      return;
    }
    
    const names = readNameFields("mp");
    const error = validateAccountContact(
      users,
      client.user_id,
      {
        full_name: names.full_name,
        phone: phoneInput.value,
        email: emailInput.value
      },
      users[idx]
    );

    if (error) {
      showFeedback(feedback, error, true);
      return;
    }

    users[idx].first_name = names.first_name;
    users[idx].last_name = names.last_name;
    users[idx].full_name = names.full_name;
    users[idx].phone = phoneInput.value.trim();
    users[idx].email = emailInput.value.trim();

    if (!saveUsers(users)) {
      showFeedback(feedback, "Your changes could not be saved.", true);
      return;
    }

    refreshSession(users[idx]);
    fillForm();

    showFeedback(feedback, "Your profile was updated.", false);
  });

  pwForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const users = getUsers();
    const idx = users.findIndex((u) => u.user_id === client.user_id);

    if (idx === -1) return;

    if (!pwCurrent.value || !pwNew.value || !pwConfirm.value) {
      showFeedback(pwFeedback, "Complete all password fields.", true);
      return;
    }

    if (pwCurrent.value !== users[idx].password) {
      showFeedback(pwFeedback, "Your current password is incorrect.", true);
      return;
    }

    if (pwNew.value.length < MIN_PASSWORD_LENGTH) {
      showFeedback(
        pwFeedback,
        `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        true
      );
      return;
    }

    if (pwNew.value !== pwConfirm.value) {
      showFeedback(pwFeedback, "The new passwords do not match.", true);
      return;
    }

    if (pwNew.value === pwCurrent.value) {
      showFeedback(pwFeedback, "Choose a different password.", true);
      return;
    }

    users[idx].password = pwNew.value;

    if (!saveUsers(users)) {
      showFeedback(pwFeedback, "Your password could not be saved.", true);
      return;
    }

    refreshSession(users[idx]);
    pwForm.reset();

    showFeedback(pwFeedback, "Your password was changed.", false);
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.USERS) fillForm();
  });

  fillForm();
}

function setupAdminPage() {
  const listBody = document.getElementById("account-list-body");
  if (!listBody) return;

  const admin = enforceRoleAccess("admin");
  if (!admin) return;

  function getInitials(name) {
    const parts = String(name || "SA").trim().split(/\s+/);
    return (
      parts
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join("") || "SA"
    );
  }

  const initialsEl = document.getElementById("adm-user-initials");
  if (initialsEl) initialsEl.textContent = getInitials(admin.full_name);

  const logoutBtn = document.getElementById("adm-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    });
  }

  // One-word sidebar tab switching
  const sidebarEl = document.getElementById("adm-sidebar");
  const menuBtn = document.getElementById("adm-menu-btn");
  const sidebarCloseBtn = document.getElementById("adm-sidebar-close");
  const navButtons = document.querySelectorAll(".adm-nav-item[data-adm-tab]");
  const panels = document.querySelectorAll(".adm-panel[data-adm-panel]");

  function switchAdminTab(tabName) {
    navButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.admTab === tabName);
    });
    panels.forEach((panel) => {
      const match = panel.dataset.admPanel === tabName;
      panel.hidden = !match;
      panel.classList.toggle("is-active", match);
    });
    if (sidebarEl) sidebarEl.classList.remove("is-open");
    if (tabName === "dashboard") renderAdminDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switchAdminTab(btn.dataset.admTab);
    });
  });

  if (menuBtn && sidebarEl) {
    menuBtn.addEventListener("click", () => sidebarEl.classList.add("is-open"));
  }
  if (sidebarCloseBtn && sidebarEl) {
    sidebarCloseBtn.addEventListener("click", () => sidebarEl.classList.remove("is-open"));
  }

  const searchInput = document.getElementById("account-search");
  const roleFilter = document.getElementById("account-role-filter");
  const statusFilter = document.getElementById("account-status-filter");
  const counts = document.getElementById("account-counts");
  const feedback = document.getElementById("account-feedback");

  const panel = document.getElementById("account-panel");
  const panelTitle = document.getElementById("account-panel-title");
  const panelNote = document.getElementById("account-panel-note");
  const editForm = document.getElementById("account-edit-form");
  const firstNameInput = document.getElementById("acc-firstname");
  const lastNameInput = document.getElementById("acc-lastname");
  const usernameInput = document.getElementById("acc-username");
  const roleInput = document.getElementById("acc-role");
  const emailInput = document.getElementById("acc-email");
  const phoneInput = document.getElementById("acc-phone");
  const statusSelect = document.getElementById("acc-status");
  const saveBtn = document.getElementById("acc-save");
  const closeBtn = document.getElementById("acc-close");

  const pwForm = document.getElementById("account-password-form");
  const pwNew = document.getElementById("acc-newpass");
  const pwConfirm = document.getElementById("acc-confirmpass");

  const addForm = document.getElementById("staff-add-form");
  const addFeedback = document.getElementById("staff-add-feedback");

  let selectedId = null;

  const ROLE_LABELS = { client: "Client", receptionist: "Receptionist", stylist: "Stylist", admin: "Admin" };

  // Quick-jump triggers inside the Admin Dashboard
  document.addEventListener("click", (e) => {
    const jumpTrigger = e.target.closest ? e.target.closest("[data-adm-jump]") : null;
    if (!jumpTrigger) return;
    const targetTab = jumpTrigger.dataset.admJump;
    switchAdminTab(targetTab);

    if (jumpTrigger.dataset.openUserId) {
      openPanel(Number(jumpTrigger.dataset.openUserId));
    }
    if (targetTab === "staff") {
      const staffName = document.getElementById("staff-firstname");
      if (staffName) staffName.focus();
    }
  });

  // Topbar search routes to Accounts directory
  const globalSearch = document.getElementById("adm-global-search");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const term = globalSearch.value.trim();
      switchAdminTab("accounts");
      if (searchInput) {
        searchInput.value = term;
        renderList();
      }
    });
  }

  function showFeedback(message, isError) {
    feedback.style.display = "block";
    showBanner(feedback, message, isError);
  }

  function canEdit(account) {
    return account.role !== "admin" && account.user_id !== admin.user_id;
  }

  function renderAdminDashboard() {
    const users = getUsers();
    const appointments = getAppointments();
    const payments = getPayments();

    const totalUsers = users.length;
    const activeCount = users.filter((u) => u.is_active).length;
    const inactiveUsers = users.filter((u) => !u.is_active);
    const activeStaff = users.filter(
      (u) => u.is_active && (u.role === "stylist" || u.role === "receptionist")
    );

    const totalPill = document.getElementById("adm-total-pill");
    if (totalPill) totalPill.textContent = `${totalUsers} total`;

    const kpiActive = document.getElementById("adm-kpi-active");
    const kpiActiveSub = document.getElementById("adm-kpi-active-sub");
    const kpiStaff = document.getElementById("adm-kpi-staff");
    const kpiStaffSub = document.getElementById("adm-kpi-staff-sub");
    const kpiBookings = document.getElementById("adm-kpi-bookings");
    const kpiRevenueSub = document.getElementById("adm-kpi-revenue-sub");

    if (kpiActive) kpiActive.textContent = String(activeCount);
    if (kpiActiveSub) {
      kpiActiveSub.textContent = `${inactiveUsers.length} inactive account${inactiveUsers.length === 1 ? "" : "s"} suspended`;
    }

    if (kpiStaff) kpiStaff.textContent = String(activeStaff.length);
    if (kpiStaffSub) {
      const styCount = activeStaff.filter((u) => u.role === "stylist").length;
      const recCount = activeStaff.filter((u) => u.role === "receptionist").length;
      kpiStaffSub.textContent = `${styCount} stylist${styCount === 1 ? "" : "s"} • ${recCount} receptionist${recCount === 1 ? "" : "s"}`;
    }

    const activeAppts = appointments.filter((a) => a.status !== "Cancelled").length;
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    if (kpiBookings) kpiBookings.textContent = `${activeAppts} Bookings`;
    if (kpiRevenueSub) kpiRevenueSub.textContent = `${formatPeso(totalPaid)} recorded payments`;

    // Role Distribution Bars
    const roleBarsEl = document.getElementById("adm-role-bars");
    if (roleBarsEl) {
      const rolesOrder = [
        { key: "client", label: "Clients" },
        { key: "stylist", label: "Stylists" },
        { key: "receptionist", label: "Receptionists" },
        { key: "admin", label: "Administrators" },
      ];
      roleBarsEl.innerHTML = rolesOrder
        .map((r) => {
          const count = users.filter((u) => u.role === r.key).length;
          const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
          return `
            <div class="adm-role-row">
              <div class="adm-role-meta">
                <span>${r.label}</span>
                <span>${count} (${pct}%)</span>
              </div>
              <div class="adm-role-track">
                <div class="adm-role-fill" style="width: ${pct}%;"></div>
              </div>
            </div>`;
        })
        .join("");
    }

    // Staff & Admin Roster Table
    const rosterBody = document.getElementById("adm-staff-roster-body");
    if (rosterBody) {
      const teamAccounts = users
        .filter((u) => u.role !== "client")
        .sort((a, b) => a.role.localeCompare(b.role) || a.full_name.localeCompare(b.full_name));

      rosterBody.innerHTML =
        teamAccounts.length > 0
          ? teamAccounts
              .map((u) => {
                const isSelf = u.user_id === admin.user_id;
                const btnHtml = isSelf
                  ? '<span class="badge badge-neutral">Your account</span>'
                  : `<button type="button" class="btn btn-outline btn-sm" data-adm-jump="accounts" data-open-user-id="${u.user_id}">${
                      canEdit(u) ? "Manage" : "View"
                    }</button>`;
                return `
                  <tr>
                    <td><strong>${escapeHtml(u.full_name)}</strong></td>
                    <td>${escapeHtml(u.username)}</td>
                    <td><span class="badge badge-neutral">${ROLE_LABELS[u.role] || escapeHtml(u.role)}</span></td>
                    <td><span class="badge ${u.is_active ? "badge-available" : "badge-cancelled"}">${
                  u.is_active ? "Active" : "Inactive"
                }</span></td>
                    <td>${btnHtml}</td>
                  </tr>`;
              })
              .join("")
          : '<tr><td colspan="5">No staff or admin accounts found.</td></tr>';
    }

    // Inactive Accounts Watch
    const inactiveEl = document.getElementById("adm-inactive-watch");
    if (inactiveEl) {
      if (inactiveUsers.length === 0) {
        inactiveEl.innerHTML =
          '<p style="font-size:0.84rem;color:var(--ink-secondary);">All user accounts are currently active and able to log in.</p>';
      } else {
        inactiveEl.innerHTML = `<div class="adm-inactive-list">${inactiveUsers
          .map(
            (u) => `
            <div class="adm-inactive-item">
              <div>
                <strong>${escapeHtml(u.full_name)}</strong>
                <small>@${escapeHtml(u.username)} • ${ROLE_LABELS[u.role] || escapeHtml(u.role)}</small>
              </div>
              <button type="button" class="btn btn-outline btn-sm" data-adm-jump="accounts" data-open-user-id="${u.user_id}">Review</button>
            </div>`
          )
          .join("")}</div>`;
      }
    }
  }

  function renderList() {
    const query = searchInput.value.trim().toLowerCase();
    const users = getUsers();

    const tally = { total: users.length, active: 0, inactive: 0 };
    users.forEach((u) => (u.is_active ? (tally.active += 1) : (tally.inactive += 1)));
    counts.textContent = `${tally.total} accounts  |  Active: ${tally.active}  |  Inactive: ${tally.inactive}`;

    const rows = users
      .filter((u) => {
        if (roleFilter.value && u.role !== roleFilter.value) return false;
        if (statusFilter.value === "active" && !u.is_active) return false;
        if (statusFilter.value === "inactive" && u.is_active) return false;
        if (!query) return true;
        return [u.full_name, u.username, u.email, u.phone].join(" ").toLowerCase().indexOf(query) !== -1;
      })
      .sort((a, b) => a.role.localeCompare(b.role) || a.full_name.localeCompare(b.full_name));

    listBody.innerHTML = "";
    if (rows.length === 0) {
      listBody.innerHTML = '<tr><td colspan="7">No accounts match your search.</td></tr>';
      return;
    }

    rows.forEach((u) => {
      const isSelf = u.user_id === admin.user_id;
      const action = isSelf
        ? '<span class="badge badge-neutral">Your account</span>'
        : `<button type="button" class="btn btn-outline btn-sm" data-act="open" data-id="${u.user_id}">${canEdit(u) ? "Manage" : "View"}</button>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(u.full_name)}</td>
        <td>${escapeHtml(u.username)}</td>
        <td><span class="badge badge-neutral">${ROLE_LABELS[u.role] || escapeHtml(u.role)}</span></td>
        <td>${escapeHtml(u.email || "—")}</td>
        <td>${escapeHtml(u.phone || "—")}</td>
        <td><span class="badge ${u.is_active ? "badge-available" : "badge-cancelled"}">${u.is_active ? "Active" : "Inactive"}</span></td>
        <td>${action}</td>
      `;
      listBody.appendChild(tr);
    });
  }

  function closePanel() {
    selectedId = null;
    panel.style.display = "none";
    pwForm.reset();
  }

  function openPanel(userId) {
    const account = getUsers().find((u) => u.user_id === userId);
    if (!account || account.user_id === admin.user_id) return;

    selectedId = account.user_id;
    const editable = canEdit(account);

    panelTitle.textContent = `${editable ? "Manage" : "View"} account: ${account.full_name}`;
    panelNote.textContent = editable
      ? "You can update contact details, activate or deactivate the account, and set a new temporary password. Username and role cannot be changed."
      : "Admin accounts are view-only here. Each admin manages their own account.";

    fillNameFields("acc", account);
    usernameInput.value = account.username || "";
    roleInput.value = ROLE_LABELS[account.role] || account.role;
    emailInput.value = account.email || "";
    phoneInput.value = account.phone || "";
    statusSelect.value = account.is_active ? "active" : "inactive";

    [firstNameInput, lastNameInput, emailInput, phoneInput].forEach((el) => (el.readOnly = !editable));
    statusSelect.disabled = !editable;
    saveBtn.style.display = editable ? "inline-block" : "none";
    pwForm.style.display = editable ? "block" : "none";
    pwForm.reset();

    panel.style.display = "block";
    feedback.style.display = "none";
    if (panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth" });
  }

  listBody.addEventListener("click", (e) => {
    const btn = e.target.closest ? e.target.closest("button[data-act]") : null;
    if (btn && btn.dataset.act === "open") openPanel(Number(btn.dataset.id));
  });
  closeBtn.addEventListener("click", closePanel);
  [searchInput, roleFilter, statusFilter].forEach((el) => {
    el.addEventListener(el === searchInput ? "input" : "change", renderList);
  });

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const users = getUsers();
    const idx = users.findIndex((u) => u.user_id === selectedId);
    if (idx === -1) {
      showFeedback("Non-existing user account: that account could not be found.", true);
      return;
    }
    const account = users[idx];
    if (!canEdit(account)) {
      showFeedback("You do not have permission to modify this account.", true);
      return;
    }

    const names = readNameFields("acc");
    const error = validateAccountContact(
      users,
      account.user_id,
      { full_name: names.full_name, phone: phoneInput.value, email: emailInput.value },
      account
    );
    if (error) {
      showFeedback(error, true);
      return;
    }

    const makeActive = statusSelect.value === "active";
    if (account.is_active && !makeActive) {
      const upcoming =
        account.role === "stylist"
          ? getAppointments().filter(
              (a) => a.stylist_id === account.user_id && a.status === "Confirmed" && a.date >= getTodayDateString()
            ).length
          : 0;
      const warning =
        `Deactivate ${account.full_name}? They will no longer be able to log in.` +
        (upcoming > 0 ? ` ${upcoming} upcoming appointment(s) are assigned to this stylist.` : "");
      if (!window.confirm(warning)) return;
    }

    account.first_name = names.first_name;
    account.last_name = names.last_name;
    account.full_name = names.full_name;
    account.phone = phoneInput.value.trim();
    account.email = emailInput.value.trim();
    account.is_active = makeActive;

    if (!saveUsers(users)) {
      showFeedback("The changes could not be saved. Please try again.", true);
      return;
    }

    panelTitle.textContent = `Manage account: ${account.full_name}`;
    renderList();
    renderAdminDashboard();
    showFeedback(`Changes to ${account.full_name}'s account were saved.`, false);
  });

  pwForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const users = getUsers();
    const idx = users.findIndex((u) => u.user_id === selectedId);
    if (idx === -1 || !canEdit(users[idx])) {
      showFeedback("You do not have permission to modify this account.", true);
      return;
    }
    if (pwNew.value.length < MIN_PASSWORD_LENGTH) {
      showFeedback(`The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`, true);
      return;
    }
    if (pwNew.value !== pwConfirm.value) {
      showFeedback("The two passwords do not match.", true);
      return;
    }

    users[idx].password = pwNew.value;
    if (!saveUsers(users)) {
      showFeedback("The password could not be saved. Please try again.", true);
      return;
    }
    pwForm.reset();
    showFeedback(`A new temporary password was set for ${users[idx].full_name}. Share it with them privately.`, false);
  });

  function showAddFeedback(message, isError) {
    addFeedback.style.display = "block";
    showBanner(addFeedback, message, isError);
  }

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const names = readNameFields("staff");
    const fullName = names.full_name;
    const username = document.getElementById("staff-username").value.trim();
    const role = document.getElementById("staff-role").value;
    const email = document.getElementById("staff-email").value.trim();
    const phone = document.getElementById("staff-phone").value.trim();
    const password = document.getElementById("staff-password").value;

    if (!fullName || !username || !role || !email || !phone || !password) {
      showAddFeedback("Incomplete Information: fill in every field.", true);
      return;
    }
    if (role !== "receptionist" && role !== "stylist") {
      showAddFeedback("Choose Receptionist or Stylist.", true);
      return;
    }
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) {
      showAddFeedback("The username must be 3 to 30 characters (letters, numbers, dot, dash, underscore).", true);
      return;
    }
    if (!ACCOUNT_EMAIL_PATTERN.test(email)) {
      showAddFeedback("Enter a valid email address.", true);
      return;
    }
    if (!ACCOUNT_PHONE_PATTERN.test(phone)) {
      showAddFeedback("Enter a valid phone number (digits, spaces, +, -, parentheses).", true);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      showAddFeedback(`The temporary password must be at least ${MIN_PASSWORD_LENGTH} characters.`, true);
      return;
    }

    const users = getUsers();
    const duplicate = users.some(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        (u.email || "").toLowerCase() === email.toLowerCase()
    );
    if (duplicate) {
      showAddFeedback("An account with that username or email already exists.", true);
      return;
    }

    const newUser = {
      user_id: users.length > 0 ? Math.max(...users.map((u) => u.user_id)) + 1 : 1,
      username: username,
      email: email,
      first_name: names.first_name,
      last_name: names.last_name,
      full_name: fullName,
      role: role,
      phone: phone,
      is_active: true,
      password: password,
    };
    if (role === "stylist") {
      newUser.work_start = "09:00";
      newUser.work_end = "18:00";
      newUser.break_start = "12:00";
      newUser.break_end = "13:00";
    }

    users.push(newUser);
    if (!saveUsers(users)) {
      showAddFeedback("The account could not be saved. Please try again.", true);
      return;
    }

    addForm.reset();
    renderList();
    renderAdminDashboard();
    showAddFeedback(
      `${ROLE_LABELS[role]} account created for ${fullName}. They can log in with the username and temporary password you set.`,
      false
    );
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.USERS || e.key === STORAGE_KEYS.APPOINTMENTS || e.key === STORAGE_KEYS.PAYMENTS) {
      renderList();
      renderAdminDashboard();
    }
  });

  renderList();
  renderAdminDashboard();
}

// ==============================================================================
// INITIALIZE ON PAGE LOAD
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  setupAuthPage();
  setupClientPage();
  setupStylistPage();
  setupReceptionistPage();
  setupAdminPage();
});