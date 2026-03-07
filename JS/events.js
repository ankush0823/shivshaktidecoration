const container = document.getElementById("eventsContainer");

let events = JSON.parse(localStorage.getItem("events")) || [];

let approvedEvents = events.filter((event) => event.status === "Approved");

if (approvedEvents.length === 0) {
  container.innerHTML = "<p>No approved events yet.</p>";
}

approvedEvents.forEach((event) => {
  const card = document.createElement("div");

  card.classList.add("eventCard");

  card.innerHTML = `

<h3>${event.name}</h3>

<p><strong>Date:</strong> ${event.date}</p>

<p><strong>Location:</strong> ${event.location}</p>

<p>${event.description}</p>

`;

  container.appendChild(card);
});
