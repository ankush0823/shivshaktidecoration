document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: bookingForm.name.value,
      phone: bookingForm.phone.value,
      email: bookingForm.email.value,
      date: bookingForm.date.value,
      eventType: bookingForm.eventType.value,
      location: bookingForm.location.value,
      details: bookingForm.details.value
    };

    try {
      const res = await fetch("http://localhost:3000/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message);  // "Booking submitted successfully"

      bookingForm.reset();    // Form clear after submission
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  });
});