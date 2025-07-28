const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
require("dotenv").config();

const router = express.Router();

// Handle preflight requests for all routes in this router
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});





router.post("/api/signup", async (req, res) => {
    console.log("Received signup request from:", req.headers.origin); 
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: "Please provide all required fields" });
    }

    try {
        const normalizedEmail = email.toLowerCase();

        
        const userExists = await User.findOne({ email: normalizedEmail });
        const adminExists = await Admin.findOne({ email: normalizedEmail });

        if (userExists || adminExists) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        if (role === "admin") {
            if (adminSecret !== process.env.ADMIN_SECRET) {
                return res.status(403).json({ msg: "Unauthorized to create an admin account" });
            }
            newUser = new Admin({ name, email: normalizedEmail, password: hashedPassword });
        } else {
            newUser = new User({ name, email: normalizedEmail, password: hashedPassword });
        }

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            msg: `${role} registered successfully`,
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


router.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Please provide email and password" });
    }

    try {
        const normalizedEmail = email.toLowerCase();
        
        
        let foundUser = await User.findOne({ email: normalizedEmail });
        let role = "user";

        if (!foundUser) {
            foundUser = await Admin.findOne({ email: normalizedEmail });
            role = foundUser ? "admin" : null;
        }

        if (!foundUser) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: foundUser._id, role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ 
            msg: "Login successful",
            token, 
            user: { id: foundUser._id, name: foundUser.name, email: foundUser.email, role } 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
