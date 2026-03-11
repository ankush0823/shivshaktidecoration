 

document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = bookingForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const data = {
      name: bookingForm.name.value.trim(),
      phone: bookingForm.phone.value.trim(),
      email: bookingForm.email.value.trim(),
      date: bookingForm.date.value,
      eventType: bookingForm.eventType.value,
      location: bookingForm.location.value.trim(),
      details: bookingForm.details.value.trim()
    };

    try {
      const res = await fetch("/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message);
      bookingForm.reset();
    } catch (err) {
      console.error(err);
      alert("Something went wrong! Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Booking";
    }
  });
});