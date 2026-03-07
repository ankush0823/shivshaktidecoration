const form = document.getElementById("eventForm");

form.addEventListener("submit", function(e){

e.preventDefault();

const event = {
id: Date.now(),
customerName: document.getElementById("customerName").value,
customerContact: document.getElementById("customerContact").value,
name: document.getElementById("eventName").value,
date: document.getElementById("eventDate").value,
location: document.getElementById("eventLocation").value,
description: document.getElementById("eventDescription").value,
status:"pending"
};

let events = JSON.parse(localStorage.getItem("events")) || [];

events.push(event);

localStorage.setItem("events", JSON.stringify(events));

alert("Event Created Successfully!");

form.reset();

});