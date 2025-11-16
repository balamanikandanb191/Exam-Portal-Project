import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

const router = express.Router();
const SECRET_KEY = "santhosh123";
const ALLOWED_ACCESS_EMAILS_STRING = "access@gmail.com,santhoshk@gmail.com";

const ALLOWED_ACCESS_EMAILS = ALLOWED_ACCESS_EMAILS_STRING.split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email); 


if (!SECRET_KEY || !ALLOWED_ACCESS_EMAILS_STRING) {
    console.error("🔴 FATAL ERROR in authRoutes: Hardcoded SECRET_KEY or ALLOWED_ACCESS_EMAILS_STRING is empty!");
   
} else {
    console.log("🔑 INFO: Using hardcoded secrets in authRoutes.");
    console.log("🔑 Access Manager emails (hardcoded):", ALLOWED_ACCESS_EMAILS);
}
router.post("/register", async (req, res) => {
  let { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required (name, email, password, role)." });
  }
  if (password.length < 6) { 
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }
   if (!['student', 'admin', 'access'].includes(role)) {
       return res.status(400).json({ message: "Invalid role specified." });
   }
  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // --- Role Restriction Logic ---
    if (role === 'access') {
      if (!ALLOWED_ACCESS_EMAILS.includes(normalizedEmail)) {
        console.log(`⚠️ INFO: Registration attempt for role 'access' by ${normalizedEmail}. Forcing to 'student' as email is not in the allowed list.`);
        role = 'student'; // Force to student if email not allowed
      } else {
         console.log(`✅ INFO: Allowed email ${normalizedEmail} registering as 'access'.`);
         // Check if an access manager already exists (optional, maybe allow multiple?)
         /*
         const accessExists = await User.findOne({ role: 'access' });
         if (accessExists) {
             console.log(`⚠️ WARN: An 'access' role user already exists. Forcing ${normalizedEmail} to 'student'.`);
             role = 'student';
         }
         */
      }
    } else if (role === 'admin') {
      // Optional: Check if an admin already exists and force to student
      /*
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
          console.log(`⚠️ WARN: An 'admin' role user already exists. Forcing ${normalizedEmail} to 'student'.`);
          role = 'student';
      } else {
          console.log(`ℹ️ INFO: User ${normalizedEmail} registering as 'admin'.`);
      }
      */
       console.log(`ℹ️ INFO: User ${normalizedEmail} registering as 'admin'.`); // Currently allowing any admin registration
    }
    // If role is 'student', no changes needed.

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create the new user with the determined role
    const newUser = await User.create({
      name,
      email: normalizedEmail, // Save normalized email
      password: hashed,
      role, // Final role
    });

    console.log(`✅ User registered: ${newUser.email} as ${newUser.role}`);
    res.status(201).json({ message: `User registered successfully as ${role}` }); // Respond with the final role

  } catch (err) {
    console.error("Registration Error:", err);
    // Provide a more generic error message to the client for security
    res.status(500).json({ message: "Registration failed due to a server error. Please try again later." });
  }
});

// --- Login Route ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
     return res.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    // Find user by email and explicitly select the password field
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    // Check if user exists
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      return res.status(404).json({ message: "Invalid email or password." }); // More generic message
    }

    // Compare submitted password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);

    // Check if passwords match
    if (!match) {
       console.log(`Login attempt failed: Invalid password for email ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid email or password." }); // More generic message
    }

    // Passwords match - Create JWT Payload
    const payload = {
      id: user._id, // Use MongoDB's _id
      role: user.role
    };

    // Sign the JWT (using the hardcoded SECRET_KEY)
    const token = jwt.sign(
        payload,
        SECRET_KEY,
        { expiresIn: "2h" } // Token expiry time
    );

    // Prepare user object to send back (excluding password)
    // The toJSON transform in the User model already removes password, _id, __v
    const userResponse = user.toJSON();

    console.log(`✅ Login successful: ${user.email} as ${user.role}`);
    // Send token and user info
    res.json({
        token,
        user: userResponse // Send user object { id, name, role, createdAt, updatedAt }
    });

  } catch (err) {
    console.error("Login Server Error:", err);
    res.status(500).json({ message: "Login failed due to a server error. Please try again later." });
  }
});

export default router;

