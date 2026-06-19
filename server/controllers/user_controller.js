import  User  from "../models/user.js";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { File } from "../models/file.js";
import { v4 as uuidv4 } from "uuid";

const generateUniqueId = () => {
  return uuidv4();
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (fullname.length < 3) {
      return res.status(400).json({ message: "Full name must be at least 3 characters" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
    const cleanedFullname = fullname.trim().replace(/\s+/g, "").toLowerCase();
    const username = `${cleanedFullname
      .substring(0, 4)
      .toLowerCase()}${nanoid(4, ALPHABET)}`;  

      const pic = Math.floor(Math.random() * 100)+1;
      const profilePic = `https://avatars.dicebear.com/api/avataaars/${pic}.svg`;

    const newUser = new User({
      fullname,
      username,
      email,
      password,
      profilePic,
      role: "user"
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        fullname: savedUser.fullname,
        username: savedUser.username,
        email: savedUser.email,
        profilePic: savedUser.profilePic,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
      
// lOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password || (!email && !username)) {
      return res.status(400).json({ message: "Credentials required" });
    }

    const user = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { username: username?.toLowerCase() }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

  // CREATE TOKEN 
  const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

   await User.findByIdAndUpdate(user._id, { lastlogin: new Date()});

    // SET COOKIE
    const cookie = res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};


 //  LOGOUT USER
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};


 //  GET ALL USERS (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};


 //  GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Error fetching user" });
  }
};

// UPDATE USERNAME
const updateUser = async (req, res) => {
  try {
    if(req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    const { username, fullname, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (fullname) updates.fullname = fullname;
    if (bio !== undefined) updates.bio = bio;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    if(req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userFiles = await File.find({ createdBy: req.params.userId });
    const cloudinaryDelettes = userFiles.filter(f => f.cloudinaryId).map(f => f.cloudinaryuploader.destroy(f.cloudinaryId));

    await File.deleteMany({ createdBy: req.params.userId });
    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  
};
