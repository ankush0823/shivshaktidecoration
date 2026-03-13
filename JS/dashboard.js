 
async function checkAuth() {
  try {
    const res = await fetch("/admin/check", {
      credentials: "include" // sends the httpOnly cookie
    });
    if (!res.ok) {
      window.location.href = "login.html";
    }
  } catch (err) {
    window.location.href = "login.html";
  }
}

checkAuth();

// --- Sidebar Navigation ---
const sidebarItems = document.querySelectorAll(".sidebar-nav li");
const sections = document.querySelectorAll(".section");

sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    const sectionId = item.getAttribute("data-section");
    sections.forEach(sec => sec.style.display = sec.id === sectionId ? "block" : "none");
  });
});

// --- Modal ---
const modal = document.getElementById("card-modal");
const closeBtn = document.querySelector(".close-btn");
const cardForm = document.getElementById("card-form");
const modalTitle = document.getElementById("modal-title");
const modalSubmitBtn = document.getElementById("modal-submit-btn");

let currentSection = "";

// Open modal
document.querySelectorAll(".add-card-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentSection = btn.closest(".section").id;
    modalTitle.textContent = "Add New Card";
    modalSubmitBtn.textContent = "Add Card";
    cardForm.reset();

    const titleLabel = document.querySelector('label[for="card-title"]');
    const descLabel = document.querySelector('label[for="card-desc"]');
    const titleInput = document.getElementById("card-title");
    const descInput = document.getElementById("card-desc");

    const showTitleDesc = currentSection === "specialization";
    titleLabel.style.display = showTitleDesc ? "block" : "none";
    descLabel.style.display = showTitleDesc ? "block" : "none";
    titleInput.style.display = showTitleDesc ? "block" : "none";
    descInput.style.display = showTitleDesc ? "block" : "none";
    titleInput.required = showTitleDesc;
    descInput.required = showTitleDesc;

    modal.style.display = "block";
  });
});

closeBtn.addEventListener("click", () => { modal.style.display = "none"; cardForm.reset(); });
window.addEventListener("click", e => {
  if (e.target === modal) { modal.style.display = "none"; cardForm.reset(); }
});

// --- Load Cards ---
async function loadCards(section) {
  const endpoint = section === "specialization" ? "/api/specialization" : "/api/work";
  const containerId = section === "specialization" ? "specialization-cards" : "gallery-cards";

  try {
    const res = await fetch(endpoint, { credentials: "include" });
    if (!res.ok) { console.error("Failed to load:", endpoint); return; }

    const data = await res.json();
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data.forEach(card => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");

      cardDiv.innerHTML = `
        <img src="${card.imageUrl}" alt="${card.title || 'Gallery Image'}" />
        ${card.title ? `<h3>${card.title}</h3>` : ""}
        ${card.description ? `<p>${card.description}</p>` : ""}
        <div class="card-actions">
          <button class="delete-btn">Delete</button>
        </div>
      `;

      cardDiv.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this card?")) {
          const deleteEndpoint = section === "specialization"
            ? `/api/specialization/${card._id}`
            : `/api/work/${card._id}`;
          try {
            await fetch(deleteEndpoint, { method: "DELETE", credentials: "include" });
            cardDiv.remove();
            updateSummaryCounts();
          } catch (err) {
            alert("Delete failed: " + err.message);
          }
        }
      });

      container.appendChild(cardDiv);
    });

    updateSummaryCounts();
  } catch (err) {
    console.error("Error loading cards:", err);
  }
}

// --- Add Card ---
cardForm.addEventListener("submit", async e => {
  e.preventDefault();

  const imageInput = document.getElementById("card-image");
  const title = document.getElementById("card-title").value;
  const desc = document.getElementById("card-desc").value;

  if (!imageInput.files[0]) { alert("Please select an image!"); return; }
  if (currentSection === "specialization" && (!title || !desc)) {
    alert("Title and description required!");
    return;
  }

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);
  if (currentSection === "specialization") {
    formData.append("title", title);
    formData.append("description", desc);
  }

  const endpoint = currentSection === "specialization" ? "/api/specialization" : "/api/work";

  modalSubmitBtn.disabled = true;
  modalSubmitBtn.textContent = "Saving...";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include", // sends httpOnly cookie
      body: formData
    });
    const data = await res.json();

    if (!res.ok) { alert("Error: " + (data.error || "Failed to save")); return; }

    alert("Card saved successfully!");
    modal.style.display = "none";
    cardForm.reset();
    loadCards(currentSection);
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    modalSubmitBtn.disabled = false;
    modalSubmitBtn.textContent = "Add Card";
  }
});

// --- Update Summary Counts ---
function updateSummaryCounts() {
  document.getElementById("total-specialization").querySelector("p").textContent =
    document.getElementById("specialization-cards").children.length;
  document.getElementById("total-gallery").querySelector("p").textContent =
    document.getElementById("gallery-cards").children.length;
  document.getElementById("total-bookings").querySelector("p").textContent =
    document.getElementById("bookings-cards").children.length;
  document.getElementById("total-enquiries").querySelector("p").textContent =
    document.getElementById("enquiries-cards").children.length;
}

// --- Load Enquiries ---
async function loadEnquiries() {
  try {
    const res = await fetch("/enquiries", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("enquiries-cards");
    container.innerHTML = "";

    data.forEach(item => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.innerHTML = `
        <h3>${item.name}</h3>
        <p><strong>Email:</strong> ${item.email}</p>
        <p><strong>Mobile:</strong> ${item.mobile || '-'}</p>
        <p><strong>Message:</strong> ${item.message}</p>
        <p><small>${new Date(item.createdAt).toLocaleDateString('en-IN')}</small></p>
        <div class="card-actions">
          <button class="delete-btn">Delete</button>
        </div>
      `;
      cardDiv.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this enquiry?")) {
          try {
            await fetch(`/enquiries/${item._id}`, { method: "DELETE", credentials: "include" });
            cardDiv.remove();
            updateSummaryCounts();
          } catch (err) {
            alert("Delete failed");
          }
        }
      });
      container.appendChild(cardDiv);
    });
    updateSummaryCounts();
  } catch (err) {
    console.error("Error loading enquiries:", err);
  }
}

// --- Load Bookings ---
async function loadBookings() {
  try {
    const res = await fetch("/bookings", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("bookings-cards");
    container.innerHTML = "";

    data.forEach(item => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.innerHTML = `
        <h3>${item.name} (${item.eventType})</h3>
        <p><strong>Phone:</strong> ${item.phone}</p>
        <p><strong>Email:</strong> ${item.email || '-'}</p>
        <p><strong>Date:</strong> ${item.date}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Details:</strong> ${item.details || '-'}</p>
        <p class="status-text"><strong>Status:</strong> ${item.status || 'Pending'}</p>
        <div class="card-actions">
          <button class="approve-btn" ${item.status === 'Approved' ? 'disabled' : ''}>Approve</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      cardDiv.querySelector(".approve-btn").addEventListener("click", async () => {
        try {
          await fetch(`/bookings/${item._id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: "Approved" })
          });
          cardDiv.querySelector(".status-text").innerHTML = "<strong>Status:</strong> Approved ✅";
          cardDiv.querySelector(".approve-btn").disabled = true;
        } catch (err) {
          alert("Approve failed");
        }
      });

      cardDiv.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this booking?")) {
          try {
            await fetch(`/bookings/${item._id}`, { method: "DELETE", credentials: "include" });
            cardDiv.remove();
            updateSummaryCounts();
          } catch (err) {
            alert("Delete failed");
          }
        }
      });

      container.appendChild(cardDiv);
    });
    updateSummaryCounts();
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

// --- DOM Loaded ---
document.addEventListener("DOMContentLoaded", () => {
  loadCards("specialization");
  loadCards("gallery");
  loadEnquiries();
  loadBookings();
});

// --- Logout ---
async function logout() {
  try {
    await fetch("/admin/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  window.location.href = "login.html";
}


// --- Change Password ---
async function changePassword() {
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmNewPassword = document.getElementById("confirm-new-password").value;
  const btn = document.getElementById("change-pass-btn");
  const msgEl = document.getElementById("change-pass-msg");

  msgEl.style.cssText = "";
  msgEl.textContent = "";

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    msgEl.style.cssText = "color:#c0392b;margin-top:12px;font-size:14px;";
    msgEl.textContent = "❌ All fields are required.";
    return;
  }

  if (newPassword.length < 6) {
    msgEl.style.cssText = "color:#c0392b;margin-top:12px;font-size:14px;";
    msgEl.textContent = "❌ New password must be at least 6 characters.";
    return;
  }

  if (newPassword !== confirmNewPassword) {
    msgEl.style.cssText = "color:#c0392b;margin-top:12px;font-size:14px;";
    msgEl.textContent = "❌ Passwords do not match.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Updating...";

  try {
    const res = await fetch("/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await res.json();

    if (result.success) {
      msgEl.style.cssText = "color:#2d7a47;margin-top:12px;font-size:14px;";
      msgEl.textContent = "✅ " + result.message;
      document.getElementById("current-password").value = "";
      document.getElementById("new-password").value = "";
      document.getElementById("confirm-new-password").value = "";
    } else {
      msgEl.style.cssText = "color:#c0392b;margin-top:12px;font-size:14px;";
      msgEl.textContent = "❌ " + result.message;
    }
  } catch (err) {
    msgEl.style.cssText = "color:#c0392b;margin-top:12px;font-size:14px;";
    msgEl.textContent = "❌ Server error. Please try again.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Update Password";
  }
}


// --- Delete Account ---
async function deleteAccount() {
  const confirmed = confirm("⚠️ Are you sure you want to delete your admin account? This cannot be undone!");
  if (!confirmed) return;

  const secondConfirm = confirm("🚨 Last warning! After deletion, anyone can register as admin. Proceed?");
  if (!secondConfirm) return;

  const btn = document.getElementById("delete-account-btn");
  const msgEl = document.getElementById("delete-account-msg");

  btn.disabled = true;
  btn.textContent = "Deleting...";

  try {
    const res = await fetch("/admin/delete-account", {
      method: "DELETE",
      credentials: "include",
    });

    const result = await res.json();

    if (result.success) {
      msgEl.style.cssText = "color:#2d7a47;margin-top:12px;font-size:14px;";
      msgEl.textContent = "✅ Account deleted. Redirecting...";
      setTimeout(() => { window.location.href = "register.html"; }, 2000);
    } else {
      msgEl.style.cssText = "color:#c0392b;margin-top:12px;font-size:14px;";
      msgEl.textContent = "❌ " + result.message;
      btn.disabled = false;
      btn.textContent = "Delete My Account";
    }
  } catch (err) {
    msgEl.style.cssText = "color:#c0392b;margin-top:12px;font-size:14px;";
    msgEl.textContent = "❌ Server error. Please try again.";
    btn.disabled = false;
    btn.textContent = "Delete My Account";
  }
}