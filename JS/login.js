 

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const btn = document.querySelector("button");
  btn.disabled = true;
  btn.textContent = "Logging in...";

  try {
    const res = await fetch("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important: sends/receives cookies
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();

    if (result.success) {
      // No localStorage needed — JWT is in httpOnly cookie now
      window.location.href = "dashboard.html";
    } else {
      alert(result.message || "Wrong username or password");
    }
  } catch (err) {
    console.error(err);
    alert("Server error! Make sure server is running.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Login";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });
});