const express = require("express");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Send a Message
router.post("/", auth, async (req, res) => {
  try {
    const { chatId, content, media } = req.body;

    if (!chatId || (!content && !media)) {
      return res.status(400).json({ message: "Chat ID and content/media required" });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      chat: chatId,
      content,
      media
    });

    // update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    const fullMessage = await newMessage.populate("sender", "username email");
    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get Messages in a Chat
router.get("/:chatId", auth, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
