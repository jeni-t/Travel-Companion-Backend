const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // no .js needed

const router = express.Router();

router.post("/register", async(req, res)=>{
    try{
        const {name,lastname,email,password,phone} = req.body

        const existingUser = await User.findOne({email})
        if(existingUser) return res.status(400).json({msg:"user already exists"})

            const hasedPassword = await bcrypt.hash(password,10)

            const newUser = new User({name,lastname,email,password:hasedPassword,phone})
            await newUser.save()
            
            res.status(201).json({msg:"User registerd successfully"})
    }catch(err){
        res.status(500).json({msg:"server error"})
    }
})

router.post("/login", async (req,res)=>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({email})
        if(!user) return res.status(400).json({msg:"User not found"})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg:"Invalied credentials"})

                res.status(200).json({msg:"Login sucessfully"})
    }catch(err){
        res.status(500).json({msg:"server error"})
    }
})

module.exports = router