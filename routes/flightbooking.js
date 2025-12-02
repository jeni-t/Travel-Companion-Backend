const express = require ("express")
const router = express.Router()
const mongoose = require ("mongoose")
require("dotenv").config();
const Bookinghistory = require("../models/User"); 

const FlightBookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  paymentMethod: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  zip: String,
  // from: String,
  // to: String,
  // date:String,
  // adults: Number,
  // amount:Number,
  // seat:Number,
  // time:Number  
});

const Booking = mongoose.model("FlightBooking",FlightBookingSchema)

router.post("/book", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({
      message: "Booking successful. Email and SMS sent.",
      booking: savedBooking,
    });
    } catch (err) {
    console.error("Booking/SMS Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
  })

  router.get("/flighthistory", async(req,res)=>{
    try{
    const bookings = await Booking.find()
    res.status(200).json(bookings)
    }catch(err){
        res.status(500).json({msg:"somthing wrong"})
    }  
})

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