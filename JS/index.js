 

// const  Form = document.getElementById("enquiryForm");

//  Form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const data = {
//     name: document.getElementById("name").value,
//     email: document.getElementById("email").value,
//     mobile: document.getElementById("mobile").value,
//     message: document.getElementById("message").value
//   };

//   const res = await fetch("http://localhost:3000/enquiry", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(data)
//   });

//   const result = await res.json();

//   alert("Enquiry Sent");
// });


// const Form = document.getElementById("enquiryForm");

// Form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const data = {
//     name: document.getElementById("name").value,
//     email: document.getElementById("email").value,
//     mobile: document.getElementById("mobile").value,
//     message: document.getElementById("message").value
//   };

//   try {
//     const res = await fetch("http://localhost:3000/enquiry", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data)
//     });

//     const result = await res.json(); // make sure server sends JSON
//     alert(result.message); // Event received
//   } catch (err) {
//     console.error(err);
//     alert("Something went wrong!");
//   }
// });











document.addEventListener("DOMContentLoaded", () => {
  const Form = document.getElementById("enquiryForm");

  Form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      mobile: document.getElementById("mobile").value,
      message: document.getElementById("message").value
    };

    try {
      const res = await fetch("http://localhost:3000/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  });
});