 
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