function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const adminUser = "admin";
  const adminPass = "12345";

  if (username === adminUser && password === adminPass) {
    localStorage.setItem("adminLoggedIn", "true");

    window.location.href = "dashboard.html";
  } else {
    alert("Wrong username or password");
  }
}
