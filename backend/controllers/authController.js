import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import user from "../models/user.js";

const JWT_SECRET = process.env.JWT_SECRET;

// sign in

export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const { id } = newUser;
    res.status(201).json({ id, username, email, role: role || "user" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// loginn
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingUser = await user.findOne({ where: { email } });

    if (!existingUser) {
      console.log("User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, existingUser.password);
    if (!match) {
      console.log("Password does not match");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: existingUser.id,
        role: existingUser.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};
//          ../user(me)
export const getCurrentUser = async (req, res) => {
  try {
    const currentUser = await user.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'email']
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(currentUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};
