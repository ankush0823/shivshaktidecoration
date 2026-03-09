// ============================
// dashboard.js
// ============================

// --- Sidebar navigation ---
const sidebarItems = document.querySelectorAll(".sidebar-nav li");
const sections = document.querySelectorAll(".section");

sidebarItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remove active from all
    sidebarItems.forEach((i) => i.classList.remove("active"));
    // Add active to clicked
    item.classList.add("active");

    // Show related section
    const sectionId = item.getAttribute("data-section");
    sections.forEach((sec) => {
      if (sec.id === sectionId) sec.style.display = "block";
      else sec.style.display = "none";
    });
  });
});

// --- Modal for Add/Edit Cards ---
const modal = document.getElementById("card-modal");
const closeBtn = document.querySelector(".close-btn");
const cardForm = document.getElementById("card-form");
const modalTitle = document.getElementById("modal-title");
const modalSubmitBtn = document.getElementById("modal-submit-btn");

// current target section (specialization or gallery)
let currentSection = "";
let editingCard = null;

// --- Open Modal ---
document.querySelectorAll(".add-card-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentSection = btn.closest(".section").id; // 'specialization' or 'gallery'
    modalTitle.textContent = "Add New Card";
    modalSubmitBtn.textContent = "Add Card";
    editingCard = null;
    cardForm.reset();
    modal.style.display = "block";
  });
});

// --- Close Modal ---
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// --- Add / Edit Card Submit ---
cardForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const imageInput = document.getElementById("card-image");
  const title = document.getElementById("card-title").value;
  const desc = document.getElementById("card-desc").value;

  // Create card element
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  // Image preview
  const imgURL = URL.createObjectURL(imageInput.files[0]);
  cardDiv.innerHTML = `
    <img src="${imgURL}" alt="${title}" />
    <h3>${title}</h3>
    <p>${desc}</p>
    <div class="card-actions">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

  const container =
    currentSection === "specialization"
      ? document.getElementById("specialization-cards")
      : document.getElementById("gallery-cards");

  if (editingCard) {
    container.replaceChild(cardDiv, editingCard);
    editingCard = null;
  } else {
    container.appendChild(cardDiv);
  }

  updateSummaryCounts();
  modal.style.display = "none";

  // --- Add Edit/Delete button functionality
  const editBtn = cardDiv.querySelector(".edit-btn");
  const deleteBtn = cardDiv.querySelector(".delete-btn");

  editBtn.addEventListener("click", () => {
    modal.style.display = "block";
    modalTitle.textContent = "Edit Card";
    modalSubmitBtn.textContent = "Save Changes";
    document.getElementById("card-title").value = title;
    document.getElementById("card-desc").value = desc;
    editingCard = cardDiv;
    currentSection = cardDiv.closest(".section").id;
  });

  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this card?")) {
      cardDiv.remove();
      updateSummaryCounts();
    }
  });
});

// --- Update Summary Counts ---
function updateSummaryCounts() {
  document
    .getElementById("total-specialization")
    .querySelector("p").textContent = document.getElementById(
    "specialization-cards",
  ).children.length;

  document.getElementById("total-gallery").querySelector("p").textContent =
    document.getElementById("gallery-cards").children.length;

  // Bookings & Enquiries counts (frontend simulation)
  document.getElementById("total-bookings").querySelector("p").textContent =
    document.getElementById("bookings-cards").children.length;

  document.getElementById("total-enquiries").querySelector("p").textContent =
    document.getElementById("enquiries-cards").children.length;
}

// ============================
// Simulated Bookings / Enquiries (frontend)
// ============================

function addBooking(data) {
  const container = document.getElementById("bookings-cards");
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  cardDiv.innerHTML = `
    <h3>${data.name}</h3>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Date:</strong> ${data.date}</p>
    <p><strong>Event:</strong> ${data.eventType}</p>
    <p><strong>Location:</strong> ${data.location}</p>
    <p><strong>Details:</strong> ${data.details}</p>
    <p><strong>Status:</strong> Pending</p>
    <div class="card-actions">
      <button class="approve-btn">Approve</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;
  container.appendChild(cardDiv);
  updateSummaryCounts();

  const approveBtn = cardDiv.querySelector(".approve-btn");
  const deleteBtn = cardDiv.querySelector(".delete-btn");

  approveBtn.addEventListener("click", () => {
    cardDiv.querySelector("p:nth-child(7)").textContent = "Status: Approved";
  });

  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this booking?")) {
      cardDiv.remove();
      updateSummaryCounts();
    }
  });
}

function addEnquiry(data) {
  const container = document.getElementById("enquiries-cards");
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  cardDiv.innerHTML = `
    <h3>${data.name}</h3>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Message:</strong> ${data.message}</p>
    <div class="card-actions">
      <button class="delete-btn">Delete</button>
    </div>
  `;
  container.appendChild(cardDiv);
  updateSummaryCounts();

  const deleteBtn = cardDiv.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      cardDiv.remove();
      updateSummaryCounts();
    }
  });
}

if (localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("adminLoggedIn");

  window.location.href = "login.html";
}
