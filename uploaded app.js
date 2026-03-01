const API = "http://127.0.0.1:8000";

function setUser(u){ sessionStorage.setItem("user", JSON.stringify(u)); }
function getUser(){ return JSON.parse(sessionStorage.getItem("user")); }
function logout(){ sessionStorage.clear(); location.href="index.html"; }

// Tabs
function showTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c=>c.classList.remove("active"));
  document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add("active");
  document.getElementById(tab).classList.add("active");
}

// Signup
async function signup(){
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;

  const res = await fetch(API+"/users",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name,email})
  });

  const data = await res.json();
  if(res.ok){ setUser(data); location.href="dashboard.html"; }
  else alert(data.detail);
}

// Login
async function login(){
  const email=document.getElementById("login-email").value;
  const res=await fetch(API+"/users");
  const users=await res.json();
  const user=users.find(u=>u.email===email);
  if(!user) return alert("User not found");
  setUser(user);
  location.href="dashboard.html";
}

// Create Event
async function createEvent(){
  const title=document.getElementById("event-title").value;
  const description=document.getElementById("event-description").value;
  const total_seats=parseInt(document.getElementById("event-seats").value);

  await fetch(API+"/events",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({title,description,total_seats})
  });

  loadEvents();
}

// Load Events
async function loadEvents(){
  const res=await fetch(API+"/events");
  const events=await res.json();
  const list=document.getElementById("event-list");
  if(!list) return;
  list.innerHTML="";

  events.forEach(e=>{
    const card=document.createElement("div");
    card.className="event-card";
    card.innerHTML=`
      <div class="event-title">${e.title}</div>
      <div>${e.description}</div>
      <div class="seats">${e.available_seats}/${e.total_seats} seats left</div>
      <div class="event-actions">
        <button class="primary-btn" onclick="registerEvent('${e.id}')">Register</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Register
async function registerEvent(id){
  const user=getUser();
  if(!user) return alert("Login first");

  const res=await fetch(API+"/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user_id:user.id,event_id:id})
  });

  const data=await res.json();
  alert(data.message||data.detail);
  loadEvents();
}

// Auto load dashboard
if(document.getElementById("event-list")){
  const user=getUser();
  if(!user) location.href="index.html";
  document.getElementById("welcome").innerText="Welcome, "+user.name;
  loadEvents();
}