 
if (localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "login.html";
}
 
// Sidebar Navigation 
const sidebarItems = document.querySelectorAll(".sidebar-nav li");
const sections     = document.querySelectorAll(".section");

sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    const sectionId = item.getAttribute("data-section");
    sections.forEach(sec => sec.style.display = sec.id === sectionId ? "block" : "none");
  });
});
 
// Modal (Add Specialization) 
const modal         = document.getElementById("card-modal");
const closeBtn      = document.querySelector(".close-btn");
const cardForm      = document.getElementById("card-form");
const modalTitle    = document.getElementById("modal-title");
const modalSubmitBtn = document.getElementById("modal-submit-btn");

// Open modal
document.getElementById("addSpecBtn").addEventListener("click", () => {
  modalTitle.textContent       = "Add New Specialization";
  modalSubmitBtn.textContent   = "Add Card";
  cardForm.reset();
  modal.style.display = "block";
});

// Close modal
closeBtn.addEventListener("click", () => { modal.style.display = "none"; cardForm.reset(); });
window.addEventListener("click", e => {
  if (e.target === modal) { modal.style.display = "none"; cardForm.reset(); }
});

// Submit new specialization card
cardForm.addEventListener("submit", async e => {
  e.preventDefault();

  const imageInput = document.getElementById("card-image");
  const title      = document.getElementById("card-title").value.trim();
  const desc       = document.getElementById("card-desc").value.trim();

  if (!imageInput.files[0]) { alert("Please select a cover image!"); return; }
  if (!title || !desc)       { alert("Title and description are required!"); return; }

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);
  formData.append("title", title);
  formData.append("description", desc);

  modalSubmitBtn.disabled    = true;
  modalSubmitBtn.textContent = "Saving...";

  try {
    const res  = await fetch("/api/specialization", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) { alert("Error: " + (data.error || "Failed to save")); return; }

    alert("Specialization card added successfully!");
    modal.style.display = "none";
    cardForm.reset();
    loadSpecializationCards();
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    modalSubmitBtn.disabled    = false;
    modalSubmitBtn.textContent = "Add Card";
  }
});
 
// Load Specialization Cards 
async function loadSpecializationCards() {
  try {
    const res  = await fetch("/api/specialization");
    if (!res.ok) { console.error("Failed to load specialization"); return; }
    const data = await res.json();

    const container = document.getElementById("specialization-cards");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p style="color:#aaa;padding:20px;">No specialization cards yet. Click "+ Add New Card" to create one.</p>`;
      updateSummaryCounts();
      return;
    }

    data.forEach(card => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.setAttribute("data-id", card._id);

      const galleryCount = card.images ? card.images.length : 0;

      cardDiv.innerHTML = `
        <img src="${card.imageUrl}" alt="${card.title}" style="width:100%;border-radius:8px;margin-bottom:10px;max-height:180px;object-fit:cover;" />
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <p style="font-size:0.8rem;color:#888;">📷 ${galleryCount} gallery image${galleryCount !== 1 ? 's' : ''}</p>
        <div class="card-actions">
          <button class="toggle-gallery-btn">🖼️ Manage Gallery</button>
          <button class="delete-btn">Delete</button>
        </div>

        <!-- Gallery Panel (hidden by default) -->
        <div class="gallery-panel" id="gallery-panel-${card._id}">
          <h4>Gallery Images for "${card.title}"</h4>
          <div class="gallery-panel-grid" id="gallery-grid-${card._id}">
            <div class="gallery-panel-empty">Loading...</div>
          </div>
          <div class="add-gallery-form">
            <input type="file" id="gallery-input-${card._id}" accept="image/*" multiple />
            <button onclick="uploadGalleryImages('${card._id}')">+ Add Images</button>
          </div>
        </div>
      `;

      // Toggle gallery panel
      cardDiv.querySelector(".toggle-gallery-btn").addEventListener("click", () => {
        const panel = document.getElementById(`gallery-panel-${card._id}`);
        const isOpen = panel.classList.contains("open");
        // Close all panels first
        document.querySelectorAll(".gallery-panel").forEach(p => p.classList.remove("open"));
        if (!isOpen) {
          panel.classList.add("open");
          loadGalleryImages(card._id);
        }
      });

      // Delete card
      cardDiv.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm(`Delete "${card.title}" and ALL its images?`)) {
          try {
            await fetch(`/api/specialization/${card._id}`, { method: "DELETE" });
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
    console.error("Error loading specialization:", err);
  }
}
 
// Load Gallery Images for a Card 
async function loadGalleryImages(cardId) {
  const grid = document.getElementById(`gallery-grid-${cardId}`);
  grid.innerHTML = `<div class="gallery-panel-empty">Loading...</div>`;

  try {
    const res  = await fetch(`/api/specialization/${cardId}`);
    if (!res.ok) throw new Error("Failed");
    const card = await res.json();

    grid.innerHTML = "";

    if (!card.images || card.images.length === 0) {
      grid.innerHTML = `<div class="gallery-panel-empty">No gallery images yet. Add some below!</div>`;
      return;
    }

    card.images.forEach(imgUrl => {
      const wrap = document.createElement("div");
      wrap.classList.add("gallery-panel-img");
      wrap.innerHTML = `
        <img src="${imgUrl}" alt="Gallery" />
        <button class="remove-img-btn" title="Remove image">✕</button>
      `;

      wrap.querySelector(".remove-img-btn").addEventListener("click", async () => {
        if (confirm("Remove this image?")) {
          try {
            await fetch(`/api/specialization/${cardId}/images`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: imgUrl })
            });
            wrap.remove();
            // Update count label
            updateGalleryCount(cardId);
          } catch (err) {
            alert("Could not remove image.");
          }
        }
      });

      grid.appendChild(wrap);
    });
  } catch (err) {
    grid.innerHTML = `<div class="gallery-panel-empty">Failed to load images.</div>`;
  }
}
 
// Upload Gallery Images 
async function uploadGalleryImages(cardId) {
  const input = document.getElementById(`gallery-input-${cardId}`);
  if (!input.files || input.files.length === 0) {
    alert("Please select at least one image.");
    return;
  }

  const formData = new FormData();
  Array.from(input.files).forEach(file => formData.append("images", file));

  try {
    const res  = await fetch(`/api/specialization/${cardId}/images`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!res.ok) { alert("Upload failed: " + (data.error || "Unknown error")); return; }

    alert(`${input.files.length} image(s) uploaded successfully!`);
    input.value = "";
    loadGalleryImages(cardId);
    updateGalleryCount(cardId);
  } catch (err) {
    alert("Upload error: " + err.message);
  }
}

// Update the gallery count label on the card
async function updateGalleryCount(cardId) {
  try {
    const res  = await fetch(`/api/specialization/${cardId}`);
    const card = await res.json();
    const cardDiv = document.querySelector(`[data-id="${cardId}"]`);
    if (cardDiv) {
      const countEl = cardDiv.querySelector("p:nth-of-type(2)");
      if (countEl) {
        const count = card.images ? card.images.length : 0;
        countEl.textContent = `📷 ${count} gallery image${count !== 1 ? 's' : ''}`;
      }
    }
  } catch (err) { /* silent */ }
}
 
// Load Enquiries 
async function loadEnquiries() {
  try {
    const res  = await fetch("/enquiries");
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("enquiries-cards");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p style="color:#aaa;padding:20px;">No enquiries yet.</p>`;
      updateSummaryCounts();
      return;
    }

    data.forEach(item => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.innerHTML = `
        <h3>${item.name}</h3>
        <p><strong>Email:</strong> ${item.email || '—'}</p>
        <p><strong>Mobile:</strong> ${item.mobile || '—'}</p>
        <p><strong>Message:</strong> ${item.message}</p>
        <p><small>${new Date(item.createdAt).toLocaleDateString('en-IN')}</small></p>
        <div class="card-actions">
          <button class="delete-btn">Delete</button>
        </div>
      `;
      cardDiv.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this enquiry?")) {
          try {
            await fetch(`/enquiries/${item._id}`, { method: "DELETE" });
            cardDiv.remove();
            updateSummaryCounts();
          } catch (err) { alert("Delete failed"); }
        }
      });
      container.appendChild(cardDiv);
    });
    updateSummaryCounts();
  } catch (err) {
    console.error("Error loading enquiries:", err);
  }
}
 
// Load Bookings 
async function loadBookings() {
  try {
    const res  = await fetch("/bookings");
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("bookings-cards");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p style="color:#aaa;padding:20px;">No bookings yet.</p>`;
      updateSummaryCounts();
      return;
    }

    data.forEach(item => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.innerHTML = `
        <h3>${item.name} (${item.eventType})</h3>
        <p><strong>Phone:</strong> ${item.phone}</p>
        <p><strong>Email:</strong> ${item.email || '—'}</p>
        <p><strong>Date:</strong> ${item.date}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Details:</strong> ${item.details || '—'}</p>
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
            body: JSON.stringify({ status: "Approved" })
          });
          cardDiv.querySelector(".status-text").innerHTML = "<strong>Status:</strong> Approved ✅";
          cardDiv.querySelector(".approve-btn").disabled = true;
        } catch (err) { alert("Approve failed"); }
      });

      cardDiv.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this booking?")) {
          try {
            await fetch(`/bookings/${item._id}`, { method: "DELETE" });
            cardDiv.remove();
            updateSummaryCounts();
          } catch (err) { alert("Delete failed"); }
        }
      });

      container.appendChild(cardDiv);
    });
    updateSummaryCounts();
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}
 
// Load Reviews (Admin) 
async function loadReviews() {
  try {
    const res  = await fetch("/admin/reviews");
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("reviews-cards");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p style="color:#aaa;padding:20px;">No reviews submitted yet.</p>`;
      updateSummaryCounts();
      return;
    }

    data.forEach(item => {
      const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
      const date  = new Date(item.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });

      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.style.borderLeft = item.approved ? "4px solid #22c55e" : "4px solid #f59e0b";

      cardDiv.innerHTML = `
        <h3>${item.name} <span style="color:#f5a623;font-size:0.9rem;">${stars}</span></h3>
        <p><strong>Email:</strong> ${item.email || '—'}</p>
        <p>${item.message}</p>
        <p>
          <small>${date}</small>
          &nbsp;|&nbsp;
          <span style="font-weight:600;color:${item.approved ? '#22c55e' : '#f59e0b'}">
            ${item.approved ? '✅ Approved' : '⏳ Pending'}
          </span>
        </p>
        <div class="card-actions">
          <button class="approve-btn"
            style="background:${item.approved ? '#ef4444' : '#22c55e'};color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-size:0.85rem;"
            data-approved="${item.approved}">
            ${item.approved ? 'Unapprove' : 'Approve'}
          </button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      cardDiv.querySelector(".approve-btn").addEventListener("click", async (e) => {
        const newApproved = e.target.dataset.approved === "true" ? false : true;
        try {
          await fetch(`/admin/reviews/${item._id}/approve`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approved: newApproved })
          });
          loadReviews();
        } catch (err) { alert("Action failed: " + err.message); }
      });

      cardDiv.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this review permanently?")) {
          try {
            await fetch(`/admin/reviews/${item._id}`, { method: "DELETE" });
            cardDiv.remove();
            updateSummaryCounts();
          } catch (err) { alert("Delete failed"); }
        }
      });

      container.appendChild(cardDiv);
    });
    updateSummaryCounts();
  } catch (err) {
    console.error("Error loading reviews:", err);
  }
}
 
// Update Summary Counts 
function updateSummaryCounts() {
  document.getElementById("total-specialization").querySelector("p").textContent =
    document.getElementById("specialization-cards").children.length;
  document.getElementById("total-bookings").querySelector("p").textContent =
    document.getElementById("bookings-cards").children.length;
  document.getElementById("total-enquiries").querySelector("p").textContent =
    document.getElementById("enquiries-cards").children.length;
  document.getElementById("total-reviews").querySelector("p").textContent =
    document.getElementById("reviews-cards").children.length;
}



// Change Password 
async function changePassword() {
  const currentPassword    = document.getElementById("currentPassword").value;
  const newPassword        = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;
  const msgEl              = document.getElementById("change-pass-msg");

  msgEl.style.display = "none";

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    msgEl.style.display = "block";
    msgEl.style.color   = "#dc2626";
    msgEl.textContent   = "❌ All fields are required.";
    return;
  }

  if (newPassword !== confirmNewPassword) {
    msgEl.style.display = "block";
    msgEl.style.color   = "#dc2626";
    msgEl.textContent   = "❌ New passwords do not match.";
    return;
  }

  if (newPassword.length < 6) {
    msgEl.style.display = "block";
    msgEl.style.color   = "#dc2626";
    msgEl.textContent   = "❌ Password must be at least 6 characters.";
    return;
  }

  try {
    const res    = await fetch("/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const result = await res.json();

    msgEl.style.display = "block";
    if (result.success) {
      msgEl.style.color = "#16a34a";
      msgEl.textContent = "✅ " + result.message;
      document.getElementById("currentPassword").value    = "";
      document.getElementById("newPassword").value        = "";
      document.getElementById("confirmNewPassword").value = "";
    } else {
      msgEl.style.color = "#dc2626";
      msgEl.textContent = "❌ " + result.message;
    }
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.style.color   = "#dc2626";
    msgEl.textContent   = "❌ Server error.";
  }
}
 
// Delete Account 
async function deleteAccount() {
  const password = document.getElementById("deletePassword").value;
  const msgEl    = document.getElementById("delete-acc-msg");

  if (!password) {
    msgEl.style.display = "block";
    msgEl.style.color   = "#dc2626";
    msgEl.textContent   = "❌ Please enter your password.";
    return;
  }

  if (!confirm("Are you sure? This will permanently delete your admin account.")) return;

  try {
    const res    = await fetch("/admin/delete-account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const result = await res.json();

    if (result.success) {
      localStorage.removeItem("adminLoggedIn");
      alert("Account deleted. Redirecting to registration...");
      window.location.href = "register.html";
    } else {
      msgEl.style.display = "block";
      msgEl.style.color   = "#dc2626";
      msgEl.textContent   = "❌ " + result.message;
    }
  } catch (err) {
    msgEl.style.display = "block";
    msgEl.style.color   = "#dc2626";
    msgEl.textContent   = "❌ Server error.";
  }
}

 
// DOM Loaded — Initial Load 
document.addEventListener("DOMContentLoaded", () => {
  loadSpecializationCards();
  loadEnquiries();
  loadBookings();
  loadReviews();
});
 
// Logout 
function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
}