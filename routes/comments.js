const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { checkAuthMiddleWare } = require("../util/auth");

const router = express.Router();
const prisma = new PrismaClient();

router
  .route("/comments")
  .get(async (req, res) => {
    const comments = await prisma.comments.findMany();
    res.json(comments);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    console.log(req.body);
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (curUser.id === req.body.userID) {
      const comment = await prisma.comments.create({
        data: req.body,
      });
      res.status(201).json({ message: "Comment created successfully.", comment });
    } else
      res.status(401).json({
        message: "Not authorized",
        errors: {
          hacking:
            "You are not allowed to create comments for other users. But you already know that anyway, don't you?",
        },
      });
  });

router
  .route("/comments/:id")
  .get(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const comment = await prisma.comments.findUnique({
      where: {
        id: Number(id),
      },
    });
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (curUser.id === comment.userID) res.json(comment);
    else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          spying: "You are not allowed to view other user's comments! Mind your business.",
        },
      });
  })
  .delete(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const curComment = await prisma.comments.findUnique({
      where: {
        id: Number(id),
      },
    });
    const curUser = await prisma.users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (curComment.userID === curUser.id || req.token.admin) {
      const comment = await prisma.comments.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(201).json({ message: `Comment ${id} deleted successfully`, comment });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are no allowed to delete comments of other users. But you already know that anyway, don't you?",
        },
      });
  });

module.exports = router;
