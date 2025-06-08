const express = require("express");
const { checkAuthMiddleWare } = require("../util/auth");

const router = express.Router();
const prisma = require("./prisma");

router
  .route("/posts")
  .get(async (req, res) => {
    const posts = await prisma.social_posts.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.json(posts);
  })
  .post(checkAuthMiddleWare, async (req, res) => {
    const data = req.body;
    console.log(data);
    const curUser = await prisma.social_users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (curUser.id === data.userID || (data.shared && curUser.id !== data.userID)) {
      const post = await prisma.social_posts.create({
        data,
      });
      res.status(201).json({ message: "Post created successfully", post });
    } else
      res.status(401).json({
        message: "Not authorized",
        errors: {
          hacking:
            "You are not allowed to create posts for other users. But you already know that anyway, don't you?",
        },
      });
  });

router
  .route("/posts/:id")
  .get(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const post = await prisma.social_posts.findUnique({
      where: {
        id: Number(id),
      },
    });
    const curUser = await prisma.social_users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (post.userID === curUser.id) res.json(post);
    else
      res.status(401).json({
        message: "Not authorized.",
        errors: { spying: "You are not allowed to view other user's posts! Mind your business." },
      });
  })
  .patch(checkAuthMiddleWare, async (req, res) => {
    const id = req.params.id;
    const post = await prisma.social_posts.findUnique({
      where: {
        id: Number(id),
      },
    });
    const curUser = await prisma.social_users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (post.userID === curUser.id && !post.shared) {
      const updatedPost = await prisma.social_posts.update({
        where: {
          id: Number(id),
        },
        data: {
          userID: req.body.userID,
          message: req.body.message,
          image: req.body.image,
          updatedAt: req.body.updatedAt,
        },
      });
      res.status(201).json({ message: `Post ${id} updated successfully`, updatedPost });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to edit posts of other users. But you already know that anyway, don't you?",
        },
      });
  })
  .delete(checkAuthMiddleWare, async (req, res) => {
    const postID = req.params.id;
    const curPost = await prisma.social_posts.findUnique({
      where: {
        id: Number(postID),
      },
    });
    const curUser = await prisma.social_users.findUnique({
      where: {
        username: req.token.username,
      },
    });
    if (
      curPost.userID === curUser.id ||
      req.token.admin ||
      (curPost.userID !== curUser.id && curPost.sharedBy === curUser.id)
    ) {
      const post = await prisma.social_posts.delete({
        where: {
          id: Number(postID),
        },
      });
      res.status(201).json({ message: `Post ${postID} deleted successfully`, post });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to delete posts of other users. But you already know that anyway, don't you?",
        },
      });
  });

module.exports = router;
