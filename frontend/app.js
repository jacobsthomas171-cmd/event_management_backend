const API = "http://127.0.0.1:8000";

let isLogin = true;
let currentUser = null;
let editingEventId = null;

const authSection = document.getElementById("authSection");
const dashboard = document.getElementById("dashboard");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const authBtn = document.getElementById("authBtn");
const toggleAuth = document.getElementById("toggleAuth");
const authTitle = document.getElementById("authTitle");

const logoutBtn = document.getElementById("logoutBtn");
const eventsGrid = document.getElementById("eventsGrid");

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

toggleAuth.onclick = () => {
  isLogin = !isLogin;
  authTitle.innerText = isLogin ? "Login" : "Sign Up";
  authBtn.innerText = isLogin ? "Login" : "Sign Up";
  nameInput.classList.toggle("hidden");
};

authBtn.onclick = async () => {
  if (isLogin) {
    const res = await fetch(`${API}/users`);
    const users = await res.json();
    const user = users.find(u => u.email === emailInput.value);

    if (user) {
      currentUser = user;
      enterDashboard();
    } else {
      showToast("User not found");
    }

  } else {
    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
      })
    });

    if (res.ok) {
      showToast("Account created!");
      isLogin = true;
      toggleAuth.click();
    }
  }
};

logoutBtn.onclick = () => {
  currentUser = null;
  dashboard.classList.add("hidden");
  authSection.classList.remove("hidden");
  logoutBtn.classList.add("hidden");
};

function enterDashboard() {
  authSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  loadEvents();
}

async function loadEvents() {
  const res = await fetch(`${API}/events`);
  const events = await res.json();

  eventsGrid.innerHTML = "";

  events.forEach(event => {
    const percent = (event.registered_seats / event.total_seats) * 100;

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <p>${event.registered_seats} / ${event.total_seats} seats</p>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>

      <button onclick="registerEvent('${event.id}')" class="btn primary">Register</button>
      <button onclick="editEvent('${event.id}','${event.title}','${event.description}',${event.total_seats})" class="btn">Edit</button>
      <button onclick="deleteEvent('${event.id}')" class="btn">Delete</button>
    `;

    eventsGrid.appendChild(card);
  });
}

async function registerEvent(id) {
  await fetch(`${API}/events/${id}/register`, {method:"POST"});
  showToast("Registered successfully!");
  loadEvents();
}

async function deleteEvent(id) {
  await fetch(`${API}/events/${id}`, {method:"DELETE"});
  showToast("Event deleted!");
  loadEvents();
}

function editEvent(id, title, desc, seats) {
  editingEventId = id;
  document.getElementById("eventTitle").value = title;
  document.getElementById("eventDesc").value = desc;
  document.getElementById("eventSeats").value = seats;
}

document.getElementById("saveEventBtn").onclick = async () => {
  const title = document.getElementById("eventTitle").value;
  const desc = document.getElementById("eventDesc").value;
  const seats = document.getElementById("eventSeats").value;

  if (editingEventId) {
    await fetch(`${API}/events/${editingEventId}`, {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({title, description:desc, total_seats:seats})
    });
    editingEventId = null;
  } else {
    await fetch(`${API}/events`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        title,
        description:desc,
        total_seats:seats
      })
    });
  }

  showToast("Event saved!");
  loadEvents();
};