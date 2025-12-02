const express = require("express")
const router = express.Router()
const Stripe = require("stripe")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async(req, res)=>{

    const {amount} = req.body
    try{
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency:"inr",
            automatic_payment_methods: { enabled: true },
        })
        res.send({
            clientSecret:paymentIntent.client_secret
        })
    }catch(err){
        res.status(500).json({err:"something wrong"})
    }
})

module.exports = router; 