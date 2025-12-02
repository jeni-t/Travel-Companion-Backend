const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const nodemailer = require("nodemailer");

//const { ServerClient } = require("postmark"); 
//const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN);

const twilio = require("twilio");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ====================
// Booking Schema
// ====================
const BookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  people: Number,
  fromDate: String,
  toDate: String,
  paymentMethod: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  zip: String,
  aadhar: String,
  amounts: Number,
});

const Booking = mongoose.model("Booking", BookingSchema);

const emailTransporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// ======================
//   POST /book
// ======================
router.post("/book", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();

    // ---------------- EMAIL (BREVO) ----------------
    try {
      await emailTransporter.sendMail({
        from: process.env.BREVO_FROM,
        to: savedBooking.email,
        subject: "Booking Confirmation",
        html: `
          <h2>Booking Confirmed</h2>
          <p><strong>Name:</strong> ${req.body.name}</p>
          <p><strong>Email:</strong> ${req.body.email}</p>
          <p><strong>Phone:</strong> ${req.body.phone}</p>
          <p><strong>From:</strong> ${req.body.fromDate}</p>
          <p><strong>To:</strong> ${req.body.toDate}</p>
          <p><strong>People:</strong> ${req.body.people}</p>
          <p><strong>Aadhar:</strong> ${req.body.aadhar}</p>
          <p><strong>Amount:</strong> ₹${req.body.amounts}</p>
          <p><strong>Payment Method:</strong> ${req.body.paymentMethod}</p>
        `,
      });
      console.log("📩 Email sent");
    } catch (emailErr) {
      console.error("Email Error:", emailErr);
    }

    // ---------------- SMS (TWILIO) ----------------
    try {
      await client.messages.create({
        body: `Booking Confirmed for ${req.body.name}. Amount: ₹${req.body.amounts}`,
        from: "+13135137596",
        to: req.body.phone,
      });
      console.log("📱 SMS sent");
    } catch (smsErr) {
      console.error("SMS Error:", smsErr);
    }

    res.status(201).json({
      message: "Booking Success (Email + SMS sent)",
      booking: savedBooking,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ======================
// GET History
// ======================
router.get("/history", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ======================
// UPDATE Booking
// ======================
router.put("/:id", async (req, res) => {
  try {
    const updateBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updateBooking) {
      res.status(404).json({ msg: "Booking not found" });
    } else {
      res.status(200).json(updateBooking);
    }
  } catch (err) {
    res.status(500).json({ error: "Update error" });
  }
});

// ======================
// DELETE Booking
// ======================
router.delete("/:id", async (req, res) => {
  try {
    const deleteBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deleteBooking) {
      res.status(404).json({ msg: "Booking not found" });
    } else {
      res.status(200).json({ msg: "Booking deleted" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Something went wrong" });
  }
});

module.exports = router;
