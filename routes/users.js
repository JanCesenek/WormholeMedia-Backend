const express = require("express");
const { checkAuthMiddleWare } = require("../util/auth");

const router = express.Router();
const prisma = require("./prisma");

router.get("/users", async (req, res) => {
  const users = await prisma.social_users.findMany({
    orderBy: {
      id: "asc",
    },
  });
  res.json(users);
});

router
  .route("/users/:username")
  .get(checkAuthMiddleWare, async (req, res) => {
    const username = req.params.username;
    const user = await prisma.social_users.findUnique({
      where: {
        username,
      },
    });
    if (user.username === req.token.username) res.json(user);
    else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          spying: "You are not allowed to view other user's information! Mind your business.",
        },
      });
  })
  .patch(checkAuthMiddleWare, async (req, res) => {
    const username = req.params.username;
    console.log(req.body);
    const user = await prisma.social_users.findUnique({
      where: {
        username,
      },
    });
    const originOrPic = req.body.origin
      ? { origin: req.body.origin }
      : { profilePicture: req.body.profilePicture };
    if (user.username === req.token.username) {
      const updatedUser = await prisma.social_users.update({
        where: {
          username,
        },
        data: req.body.occupation ? { occupation: req.body.occupation } : originOrPic,
      });
      return res
        .status(201)
        .json({ message: `User ${username} successfully edited.`, updatedUser });
    } else {
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to edit other user's information. But you already know that anyway, don't you?",
        },
      });
    }
  })
  .delete(checkAuthMiddleWare, async (req, res) => {
    const username = req.params.username;
    const curUser = await prisma.social_users.findUnique({
      where: {
        username,
      },
    });
    if (curUser.username === req.token.username || req.token.admin) {
      const user = await prisma.social_users.delete({
        where: {
          username,
        },
      });
      res.status(201).json({ message: `User ${username} deleted successfully.`, user });
    } else
      res.status(401).json({
        message: "Not authorized.",
        errors: {
          hacking:
            "You are not allowed to delete other users. But you already know that anyway, don't you?",
        },
      });
  });

module.exports = router;
