import user from "../models/user.js";
import bcrypt from "bcrypt"; 

// post to create user
export const createUser = async (req, res) => {
  try {
    const { username, role, email, password } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newUser = await user.create({ username, role, email, password });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// update by id
export const updateUser = async (req, res) => {
  try {
    const found = await user.findByPk(req.params.id);
    if (!found) return res.status(404).json({ error: "User not found" });

    const { username, email, password } = req.body;

    if (username) found.username = username;
    if (email) found.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      found.password = await bcrypt.hash(password, salt); 
    }

    await found.save();
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// deleteeeeeeeeeeeeeeeeee
export const deleteUser = async (req, res) => {
  try {
    const found = await user.findByPk(req.params.id);
    if (!found) return res.status(404).json({ error: "User not found" });

    if (req.user.userId !== found.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this user" });
    }

    await found.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};
