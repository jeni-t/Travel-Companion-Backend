const express = require ("express")
const router = express.Router()
const mongoose = require ("mongoose")
require("dotenv").config();
const Bookinghistory = require("../models/User"); 

const nodemailer = require("nodemailer");

// SMS (Twilio)
const twilio = require("twilio");
const smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const FlightBookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,

  from: String,
  to: String,
  date: String,
  time: String,
  seat: String,
  adults: Number,
  amount: Number,

  paymentMethod: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  zip: String,
});

const Booking = mongoose.model("FlightBooking", FlightBookingSchema);


//const Booking = mongoose.model("FlightBooking",FlightBookingSchema)

const emailTransporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

router.post("/book", async (req, res) => {
  try {
    // Save full booking
    const newBooking = new Booking(req.body);
    const saved = await newBooking.save();

    /* ---------------- EMAIL ---------------- */
    try {
      await emailTransporter.sendMail({
        from: process.env.BREVO_FROM,
        to: saved.email,
        subject: "Flight Booking Confirmation",
        html: `
          <h2>Your Flight Booking is Confirmed</h2>
          <p><strong>Name:</strong> ${saved.name}</p>
          <p><strong>From:</strong> ${saved.from}</p>
          <p><strong>To:</strong> ${saved.to}</p>
          <p><strong>Date:</strong> ${saved.date}</p>
          <p><strong>Time:</strong> ${saved.time}</p>
          <p><strong>Seat:</strong> ${saved.seat}</p>
          <p><strong>Amount:</strong> ₹${saved.amount}</p>
        `
      });
      console.log("📩 Email sent successfully");
    } catch (emailErr) {
      console.log("❌ Email error:", emailErr);
    }

    /* ---------------- SMS ---------------- */
    try {
      await smsClient.messages.create({
        body: `Flight booked successfully!\nFrom: ${saved.from}\nTo: ${saved.to}\nAmount: ₹${saved.amount}`,
        from: process.env.TWILIO_PHONE,  // Must be valid Twilio number
        to: saved.phone,
      });
      console.log("📱 SMS sent successfully");
    } catch (smsErr) {
      console.log("❌ SMS error:", smsErr);
    }

    res.status(201).json({
      message: "Flight booking successful (Email + SMS sent)",
      booking: saved,
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server error while booking" });
  }
});



 router.get("/flighthistory", async (req, res) => {
  try {
    const bookingList = await Booking.find();
    const flightDetailsList = await FlightDetails.find();

    const result = bookingList.map((item, index) => {
      const details = flightDetailsList[index] || {};

      return {
        name: item.name,
        email: item.email,
        phone: item.phone,

        from: details.from || "",
        to: details.to || "",
        date: details.date || "",
        time: details.time || "",
        seat: details.seat || "",
        amount: details.amount || "",
        adults: details.adults || "",
      };
    });

    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ msg: "something wrong" });
  }
});


const FlightDetailsSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: String,
  date: String,
  seat: String,
  time: String,
  adults: Number

});

const FlightDetails = mongoose.model("FlightDetails",FlightDetailsSchema)

router.post("/flightdetails", async(req,res)=>{

  try{
  const fewdetails = new FlightDetails(req.body)
  const details = await fewdetails.save()
   res.status(201).json({
      message: "Booking successful. Email and SMS sent.",
      books: details,
    });
    } catch (err) {
    console.error("Booking/SMS Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
})


  module.exports = router;