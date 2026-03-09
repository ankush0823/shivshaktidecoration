const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.post("/book-event", (req, res) => {

  console.log(req.body);

  const { name, phone, email, date, eventType, location, details } = req.body;

  console.log("New Booking:");
  console.log(name, phone, email, date, eventType, location, details);

  res.send("Thank you! Your booking request has been received.");

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});