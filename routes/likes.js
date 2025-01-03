const express = require("express");
const { checkAuthMiddleWare } = require("../util/auth");

const router = express.Router();
const prisma = require("./prisma");

router
  .route("/likes")
  .get(async (req, res) => {
    const likes = await prisma.likes.findMany();
    res.json(likes);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    console.log(req.body);
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const alreadyLiked = await prisma.likes.findMany({
      where: {
        postID: req.body.postID,
        userID: curUser.id,
      },
    });
    if (alreadyLiked.length !== 0) {
      return res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "Did I just catch you trying to like the same post twice?",
        },
      });
    }
    if (curUser.id === req.body.userID) {
      const like = await prisma.likes.create({
        data: req.body,
      });
      res.status(201).json({ message: "Post liked successfully.", like });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to like posts for other users. But you already know that anyway, don't you?",
        },
      });
  });

router
  .route("/likes/:id")
  .get(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const like = await prisma.likes.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (curUser.id === like.userID) res.json(like);
    else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          spying: "You are not allowed to view other user's likes! Mind your business.",
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
    const curLike = await prisma.likes.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (curUser.id === curLike.userID) {
      const like = await prisma.likes.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(201).json({ message: `Like ${id} removed successfully`, like });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to remove likes for other users. But you already know that anyway, don't you?",
        },
      });
  });

module.exports = router;
