const express = require("express");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Create Chat (One-to-One or Group)
router.post("/", auth, async (req, res) => {
  try {
    const { userIds, isGroup, name } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs are required" });
    }

    const chat = await Chat.create({
      users: [...userIds, req.user.id],
      isGroup,
      name: isGroup ? name : undefined,
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get All My Chats
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user.id })
      .populate("users", "-password") // exclude passwords
      .populate("latestMessage");

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
