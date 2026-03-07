const container = document.getElementById("adminEventsContainer");

let events = JSON.parse(localStorage.getItem("events")) || [];

function renderEvents(){

container.innerHTML = "";

if(events.length === 0){
container.innerHTML = "<p>No events found</p>";
return;
}

events.forEach(event => {

const card = document.createElement("div");
card.classList.add("eventCard");

card.innerHTML = `
<h3>${event.name}</h3>

<div class="event-info">
<p><strong>Customer:</strong> ${event.customerName}</p>
<p><strong>Contact:</strong> ${event.customerContact}</p>
<p><strong>Date:</strong> ${event.date}</p>
<p><strong>Location:</strong> ${event.location}</p>
</div>

<p>${event.description}</p>

<span class="status">${event.status}</span>

<div class="btn-group">
<button class="approveBtn">Approve</button>
<button class="rejectBtn">Reject</button>
<button class="deleteBtn">Delete</button>
</div>
`;

container.appendChild(card);

const approveBtn = card.querySelector(".approveBtn");
const rejectBtn = card.querySelector(".rejectBtn");
const deleteBtn = card.querySelector(".deleteBtn");

approveBtn.addEventListener("click", ()=>{

event.status = "Approved";

localStorage.setItem("events", JSON.stringify(events));

renderEvents();

});

rejectBtn.addEventListener("click", ()=>{

event.status = "Rejected";

localStorage.setItem("events", JSON.stringify(events));

renderEvents();

});

deleteBtn.addEventListener("click", ()=>{

events = events.filter(ev => ev.id !== event.id);

localStorage.setItem("events", JSON.stringify(events));

renderEvents();

});

});

}

renderEvents();

function goToApproved(){

window.location.href = "events.html";

}