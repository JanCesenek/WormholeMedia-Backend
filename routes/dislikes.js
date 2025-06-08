const express = require("express");
const { checkAuthMiddleWare } = require("../util/auth");

const router = express.Router();
const prisma = require("./prisma");

router
  .route("/dislikes")
  .get(async (req, res) => {
    const dislikes = await prisma.social_dislikes.findMany();
    res.json(dislikes);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    console.log(req.body);
    const curUser = await prisma.social_users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const alreadyDisliked = await prisma.social_dislikes.findMany({
      where: {
        postID: req.body.postID,
        userID: curUser.id,
      },
    });
    if (alreadyDisliked.length !== 0) {
      return res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking: "Did I just catch you trying to dislike the same post twice?",
        },
      });
    }
    if (curUser.id === req.body.userID) {
      const dislike = await prisma.social_dislikes.create({
        data: req.body,
      });
      res.status(201).json({ message: "Post disliked successfully.", dislike });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to dislike posts for other users. But you already know that anyway, don't you?",
        },
      });
  });

router
  .route("/dislikes/:id")
  .get(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const curUser = await prisma.social_users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const dislike = await prisma.social_dislikes.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (curUser.id === dislike.userID) res.json(dislike);
    else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          spying: "You are not allowed to view other user's dislikes! Mind your business.",
        },
      });
  })
  .delete(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const curUser = await prisma.social_users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    const curDislike = await prisma.social_dislikes.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (curUser.id === curDislike.userID) {
      const dislike = await prisma.social_dislikes.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(201).json({ message: `Dislike ${id} removed successfully`, dislike });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to remove dislikes for other users. But you already know that anyway, don't you?",
        },
      });
  });

module.exports = router;
