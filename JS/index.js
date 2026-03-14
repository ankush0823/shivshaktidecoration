 
document.addEventListener("DOMContentLoaded", () => {
 
  // HAMBURGER MENU TOGGLE 
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
      menuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    }
  }); 
  const Form = document.getElementById("enquiryForm");

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

  loadSpecializationCards();
  loadWorkCards();
  loadReviews();
});

async function loadSpecializationCards() {
  try {
    const res = await fetch("/api/specialization");
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("specialization-container");
    container.innerHTML = "";

    data.forEach(card => {
      const div = document.createElement("div");
      div.classList.add("special-card");
      div.innerHTML = `
        <img src="${card.imageUrl}" alt="${card.title}" />
        <h3>${card.title}</h3>
        <p>${card.description}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load specialization cards:", err);
  }
}

async function loadWorkCards() {
  try {
    const res = await fetch("/api/work");
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("work-container");
    container.innerHTML = "";

    data.forEach(card => {
      const div = document.createElement("div");
      div.classList.add("work-card");
      div.innerHTML = `<img src="${card.imageUrl}" alt="Our Work" />`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load work cards:", err);
  }
}

 
// --- Load & Display Approved Reviews ---
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

// --- Submit New Review ---
async function submitReview() {
  const name    = document.getElementById("review-name").value.trim();
  const email   = document.getElementById("review-email").value.trim();
  const message = document.getElementById("review-message").value.trim();
  const ratingEl = document.querySelector('input[name="rating"]:checked');
  const btn     = document.getElementById("review-submit-btn");
  const successMsg = document.getElementById("review-success");

  if (!name || !message) {
    alert("Please enter your name and message.");
    return;
  }
  if (!ratingEl) {
    alert("Please select a star rating.");
    return;
  }

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
      // Reset form
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