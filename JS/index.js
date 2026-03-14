 
let lightboxImages = [];
let lightboxIndex = 0; 
// DOMContentLoaded 
document.addEventListener("DOMContentLoaded", () => {

  // --- Enquiry Form ---
  const Form = document.getElementById("enquiryForm");
  if (Form) {
    Form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = Form.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        message: document.getElementById("message").value.trim()
      };

      try {
        const res = await fetch("/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.message);
        Form.reset();
      } catch (err) {
        console.error(err);
        alert("Something went wrong! Please try again.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    });
  }

  // Load data on page load
  loadSpecializationCards();
  loadReviews();

  // Close modals on overlay click
  document.getElementById("specModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("specModal")) closeSpecModal();
  });

  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target === document.getElementById("lightbox")) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
      closeSpecModal();
    }
    if (e.key === "ArrowRight") lightboxNav(1);
    if (e.key === "ArrowLeft") lightboxNav(-1);
  });
});
 
// Specialization Cards 
async function loadSpecializationCards() {
  try {
    const res = await fetch("/api/specialization");
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("specialization-container");
    if (!container) return;
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:#aaa;padding:40px;">No specializations added yet.</p>`;
      return;
    }

    data.forEach(card => {
      const div = document.createElement("div");
      div.classList.add("special-card");
      div.setAttribute("data-id", card._id);
      div.setAttribute("data-title", card.title);
      div.setAttribute("data-desc", card.description);

      div.innerHTML = `
        <img src="${card.imageUrl}" alt="${card.title}" />
        <h3>${card.title}</h3>
        <p>${card.description}</p>
      `;

      div.addEventListener("click", () => openSpecModal(card._id, card.title, card.description));
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load specialization cards:", err);
  }
}
 
// Specialization Gallery Modal 
// Cache to avoid re-fetching same card
const specCache = {};

async function openSpecModal(id, title, desc) {
  document.getElementById("specModalTitle").textContent = title;
  document.getElementById("specModalDesc").textContent = desc;
  document.getElementById("specModal").classList.add("active");
  document.body.style.overflow = "hidden";

  if (specCache[id]) {
    renderModalImages(specCache[id]);
    return;
  }

  document.getElementById("specModalGrid").innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
      <div style="width:40px;height:40px;border:3px solid #f0e8d8;border-top-color:#d4a45a;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 14px;"></div>
      <p style="color:#aaa;font-size:0.9rem;">Loading images...</p>
    </div>`;

  try {
    const res = await fetch(`/api/specialization/${id}`);
    if (!res.ok) throw new Error("Failed to load");
    const card = await res.json();
    specCache[id] = card;
    renderModalImages(card);
  } catch (err) {
    document.getElementById("specModalGrid").innerHTML = `
      <div class="spec-modal-empty" style="grid-column:1/-1;">
        <span>⚠️</span>Could not load images. Please try again.
      </div>`;
  }
}

function renderModalImages(card) {
  const allImages = card.images && card.images.length > 0
    ? card.images
    : (card.imageUrl ? [card.imageUrl] : []);

  const grid = document.getElementById("specModalGrid");
  grid.innerHTML = "";

  if (allImages.length === 0) {
    grid.innerHTML = `
      <div class="spec-modal-empty" style="grid-column:1/-1;">
        <span>🖼️</span>No gallery images yet for this category.
      </div>`;
    return;
  }

  lightboxImages = allImages;

  allImages.forEach((imgUrl, idx) => {
    const wrap = document.createElement("div");
    wrap.classList.add("spec-modal-img-wrap");
    wrap.innerHTML = `<img src="${imgUrl}" alt="Gallery image ${idx + 1}" />`;
    wrap.addEventListener("click", () => openLightbox(idx));
    grid.appendChild(wrap);
  });
}
function closeSpecModal() {
  document.getElementById("specModal").classList.remove("active");
  document.body.style.overflow = "";
}
 
// Lightbox 
function openLightbox(index) {
  lightboxIndex = index;
  document.getElementById("lightboxImg").src = lightboxImages[index];
  document.getElementById("lightbox").classList.add("active");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("active");
}

function lightboxNav(dir) {
  if (!document.getElementById("lightbox").classList.contains("active")) return;
  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  document.getElementById("lightboxImg").src = lightboxImages[lightboxIndex];
}
 
// Reviews 
async function loadReviews() {
  const container = document.getElementById("reviews-list");
  if (!container) return;

  try {
    const res = await fetch("/reviews");
    if (!res.ok) return;
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = `
        <div class="reviews-empty">
          <span>💬</span>
          No reviews yet. Be the first to share your experience!
        </div>`;
      return;
    }

    container.innerHTML = "";
    data.forEach(review => {
      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      const initials = review.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });

      const card = document.createElement("div");
      card.classList.add("review-card");
      card.innerHTML = `
        <div class="review-card-header">
          <div class="review-avatar">${initials}</div>
          <div class="review-name-date">
            <strong>${review.name}</strong>
            <small>${date}</small>
          </div>
          <span class="review-stars">${stars}</span>
        </div>
        <p class="review-message">${review.message}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load reviews:", err);
    container.innerHTML = `<div class="reviews-empty"><span>⚠️</span>Could not load reviews.</div>`;
  }
}

async function submitReview() {
  const name = document.getElementById("review-name").value.trim();
  const email = document.getElementById("review-email").value.trim();
  const message = document.getElementById("review-message").value.trim();
  const ratingEl = document.querySelector('input[name="rating"]:checked');
  const btn = document.getElementById("review-submit-btn");
  const successMsg = document.getElementById("review-success");

  if (!name || !message) { alert("Please enter your name and message."); return; }
  if (!ratingEl) { alert("Please select a star rating."); return; }

  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const res = await fetch("/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, rating: parseInt(ratingEl.value), message })
    });
    const result = await res.json();

    if (res.ok) {
      successMsg.style.display = "block";
      document.getElementById("review-name").value = "";
      document.getElementById("review-email").value = "";
      document.getElementById("review-message").value = "";
      document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
      setTimeout(() => { successMsg.style.display = "none"; }, 5000);
    } else {
      alert(result.message || "Something went wrong.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Please try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Review";
  }
}