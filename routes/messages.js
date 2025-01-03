const express = require("express");
const { checkAuthMiddleWare } = require("../util/auth");

const router = express.Router();
const prisma = require("./prisma");

router
  .route("/messages")
  .get(async (req, res) => {
    const messages = await prisma.messages.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
    res.json(messages);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    console.log(req.body);
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (curUser.id === req.body.senderID) {
      const message = await prisma.messages.create({
        data: req.body,
      });
      res.status(201).json({ message: "Message sent successfully.", createdMsg: message });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to send messages for other users. But you already know that anyway, don't you?",
        },
      });
  })
  .patch(checkAuthMiddleWare, async (req, res) => {
    const id = req.body.id;
    const senderID = req.body.senderID;
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (curUser.id === id) {
      const readMessages = await prisma.messages.updateMany({
        where: {
          recipientID: id,
          senderID,
        },
        data: {
          read: true,
        },
      });
      res.status(201).json({ message: "Messages read successfully.", readMessages });
    } else res.status(401).json({ message: "Not authorized." });
  });

router
  .route("/messages/:id")
  .get(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const message = await prisma.messages.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (curUser.id === message.senderID) res.json(message);
    else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          spying: "You are not allowed to view other user's messages! Mind your business.",
        },
      });
  })
  .delete(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const curMessage = await prisma.messages.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (curUser.id === curMessage.senderID) {
      const message = await prisma.messages.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(201).json({ message: `Message ${id} deleted successfully`, deletedMsg: message });
    } else
      res.status(401).json({
        message: "Not authorized",
        errors: {
          hacking:
            "You are not allowed to delete messages of other users. But you already know that anyway, don't you?",
        },
      });
  });

module.exports = router;
