const express = require ("express")
const router = express.Router()
const mongoose = require ("mongoose")
require("dotenv").config();
const Bookinghistory = require("../models/User"); 
const nodemailer = require("nodemailer");
const twilio = require("twilio")
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
  amounts:Number,
});

const Booking = mongoose.model("Booking",BookingSchema)

router.post("/book", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 587,
      auth: {
        user: "38603050f3fa21",
        pass: "04cbc4f5f80670",
      },
    });

    const mailOptions = {
      from: "jenivijay19@gmail.com",
      to: savedBooking.email,
      subject: "Booking confirmation",
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
        <br/>
        <p>Thank you for booking with us!</p>`,
    };

    await transporter.sendMail(mailOptions);

    // Send SMS
    const smsMessage = `
Booking Confirmed:

Name: ${req.body.name}
Email: ${req.body.email}
Phone: ${req.body.phone}
From: ${req.body.fromDate}
To: ${req.body.toDate}
People: ${req.body.people}
Aadhar: ${req.body.aadhar}
Amount: ₹${req.body.amounts}
Payment Method: ${req.body.paymentMethod}

Thank you for booking with us!
`;

    await client.messages.create({
      body: smsMessage,
      from: "+13135137596", // Your Twilio number
      to: req.body.phone,    // Must be in correct E.164 format (e.g. +91xxxxxxxxxx)
    });

    // ✅ Send response after both email and SMS are sent
    res.status(201).json({
      message: "Booking successful. Email and SMS sent.",
      booking: savedBooking,
    });

  } catch (err) {
    console.error("Booking/SMS Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


router.get("/history", async (req, res) => {
  try {
    const bookings = await Booking.find(); // If using mongoose
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.put("/:id", async(req,res)=>{
  try{
    const updateBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new:true}
    )
    if(!updateBooking){
      res.status(404).json({msg:"booking not found"})
    }else{
      res.status(200).json(updateBooking)
    }
  }catch(err){
    res.status(500).json({error:"error"})
  }
})

router.delete("/:id", async(req,res)=>{
  try{
    const deleteBooking = await Booking.findByIdAndDelete(req.params.id)

    if(!deleteBooking){
      res.status(404).json({msg:"Booking not found"})
    }else{
      res.status(200).json({msg:"Booking deleted"})
    }
  }catch(err){
    res.status(500).json({msg:"somthing wrong"})
  }
})

module.exports = router