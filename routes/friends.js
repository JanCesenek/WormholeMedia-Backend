const express = require("express");
const { checkAuthMiddleWare } = require("../util/auth");

const router = express.Router();
const prisma = require("./prisma");

router
  .route("/friendList")
  .get(async (req, res) => {
    const friendList = await prisma.friendList.findMany();
    res.json(friendList);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const duplicates = await prisma.friendList.findMany({
      where: {
        OR: [
          {
            firstUser: req.body.firstUser,
            secondUser: req.body.secondUser,
          },
          {
            firstUser: req.body.secondUser,
            secondUser: req.body.firstUser,
          },
        ],
      },
    });
    if (duplicates.length !== 0 || req.body.firstUser === req.body.secondUser) {
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "That friendship already exists!",
        },
      });
    } else if (req.body.firstUser === curUser.id || req.body.secondUser === curUser.id) {
      const data = req.body;
      const newFriend = await prisma.friendList.create({
        data,
      });
      res.status(201).json({ message: "Friend added successfully!", newFriend });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "You are not allowed to add friends for other users!",
        },
      });
  });

router.delete("/friendList/:id/:deletingUser", checkAuthMiddleWare, async (req, res) => {
  const id = Number(req.params.id);
  const deletingUser = Number(req.params.deletingUser);
  const curUser = await prisma.users.findUnique({
    where: {
      username: req.token.username,
    },
  });
  if (deletingUser === curUser.id) {
    const deletedFriend = await prisma.friendList.delete({
      where: {
        id,
      },
    });
    res.status(201).json({ message: "Friend removed successfully!", deletedFriend });
  } else
    res.status(401).json({
      message: "Not authorized.",
      errors: {
        hacking: "You are not allowed to remove friends for other users!",
      },
    });
});

router
  .route("/friendRequests")
  .get(async (req, res) => {
    const friendRequests = await prisma.friendRequests.findMany();
    res.json(friendRequests);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const duplicates = await prisma.friendRequests.findMany({
      where: {
        OR: [
          {
            sender: req.body.sender,
            recipient: req.body.recipient,
          },
          {
            sender: req.body.recipient,
            recipient: req.body.sender,
          },
        ],
      },
    });
    if (duplicates.length !== 0 || req.body.sender === req.body.recipient) {
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "Can't send a friend request that already exists!",
        },
      });
    } else if (req.body.sender === curUser.id) {
      const data = req.body;
      const newRequest = await prisma.friendRequests.create({
        data,
      });
      res.status(201).json({ message: "Friend request sent successfully!", newRequest });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "You are not allowed to send friend requests for other users!",
        },
      });
  });

router.delete("/friendRequests/:id/:sender/:recipient", checkAuthMiddleWare, async (req, res) => {
  const id = Number(req.params.id);
  const sender = Number(req.params.sender);
  const recipient = Number(req.params.recipient);
  const curUser = await prisma.users.findUnique({
    where: {
      username: req.token.username,
    },
  });
  if (sender === curUser.id || recipient === curUser.id) {
    const deletedRequest = await prisma.friendRequests.delete({
      where: {
        id,
      },
    });
    res.status(201).json({ message: "Friend request deleted successfully!", deletedRequest });
  } else
    res.status(401).json({
      message: "Not authorized",
      errors: {
        hacking: "You are not allowed to remove friend requests for other users!",
      },
    });
});

router
  .route("/blockList")
  .get(async (req, res) => {
    const blockList = await prisma.blockList.findMany();
    res.json(blockList);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    const blocker = req.body.blocker;
    const blocked = req.body.blocked;
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const duplicates = await prisma.blockList.findMany({
      where: {
        blocker,
        blocked,
      },
    });
    if (duplicates.length !== 0 || blocker === blocked) {
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "Can't create duplicates...",
        },
      });
    } else if (curUser.id === blocker) {
      const data = req.body;
      const newBlockedUser = await prisma.blockList.create({
        data,
      });
      res.status(201).json({ message: "User blocked successfully!", newBlockedUser });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "Can't block users for other users!",
        },
      });
  });

router.delete("/blockList/:id/:blocker", checkAuthMiddleWare, async (req, res) => {
  const id = Number(req.params.id);
  const blocker = Number(req.params.blocker);
  const curUser = await prisma.users.findUnique({
    where: {
      username: req.token.username,
    },
  });
  if (curUser.id === blocker) {
    const deletedBlock = await prisma.blockList.delete({
      where: {
        id,
      },
    });
    res.status(201).json({ message: "User unblocked successfully!", deletedBlock });
  } else
    res.status(401).json({
      message: "Not authorized.",
      errors: {
        hacking: "Can't unblock users for other users!",
      },
    });
});

module.exports = router;
