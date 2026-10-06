import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const foundUser = await User.findOne({ email: trimmedEmail });

    if (foundUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);

    // Enforce STUDENT role for public signups (prevents privilege escalation)
    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      passwordHash,
      role: "STUDENT",
    });

    const payload = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
    };

    const token = signToken(payload);

    return res.status(201).json({ token, user: payload });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Failed to sign up: " + error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const userFound = await User.findOne({ email: trimmedEmail });
    if (!userFound) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, userFound.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const payload = {
      id: userFound._id.toString(),
      role: userFound.role,
      name: userFound.name,
    };

    const token = signToken(payload);

    return res.status(200).json({
      token,
      user: payload,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Failed to log in" });
  }
}
