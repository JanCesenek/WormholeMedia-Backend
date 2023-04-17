const express = require("express");
const { get } = require("../data/user");
const { createJSONToken, isValidPassword } = require("../util/auth");
const {
  isValidPassword: pwCheck,
  isValidUsername,
  isValidDate,
  isValidText,
} = require("../util/validation");
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/signup", async (req, res, next) => {
  const data = req.body;
  let errors = {};

  // Start with validating user data, if any of them do not satisfy the condition, return an error

  if (!isValidUsername(data.username)) {
    errors.username = "Invalid username.";
  } else {
    try {
      const existingUser = await prisma.users.findUnique({
        where: {
          username,
        },
      });
      if (existingUser) {
        errors.username = "Username already exists.";
      }
    } catch (error) {}
  }

  if (!pwCheck(data.password)) {
    errors.password = "Invalid password.";
  }

  if (!isValidDate(data.birthDate)) {
    errors.birthDate = "Invalid birth date.";
  }

  if (!isValidText(data.firstName)) {
    errors.firstName = "Invalid first name.";
  }

  if (data.age > 105) {
    errors.age = "Too old to be on this website!";
  }

  if (!isValidText(data.lastName)) {
    errors.lastName = "Invalid last name.";
  }

  if (!isValidText(data.race)) {
    errors.race = "Invalid race.";
  }

  if (!isValidText(data.occupation)) {
    errors.occupation = "Invalid occupation.";
  }

  if (!isValidText(data.origin)) {
    errors.origin = "Invalid origin.";
  }

  if (!(data.gender === "M" || data.gender === "F")) {
    errors.gender = "Invalid gender.";
  }

  if (
    !(
      data.profilePicture === "/src/imgs/maleDefaultPic.jpg" ||
      data.profilePicture === "/src/imgs/femaleDefaultPic.jfif" ||
      data.profilePicture.startsWith(
        "https://jwylvnqdlbtbmxsencfu.supabase.co/storage/v1/object/public/imgs/userPics/"
      )
    )
  ) {
    errors.profilePicture = "Invalid profile picture.";
  }

  if (req.body.admin) {
    errors.hacker = "Hacker trying to add admin priviliges...";
  }

  if (Object.keys(errors).length > 0) {
    console.log(errors);
    return res.status(422).json({
      message: "User signup failed due to validation errors.",
      errors,
    });
  }

  data.password = (await hash(data.password, 16)).toString();

  try {
    const createdUser = await prisma.users.create({
      data,
    });
    console.log(createdUser);
    console.log("Success?");
    const username = data.username;
    const authToken = createJSONToken(username);
    res.status(201).json({ message: "User created.", user: data, token: authToken });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  let user;
  try {
    user = await get(username);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Authentication failed.", error });
  }

  const pwIsValid = await isValidPassword(password, user.password);
  if (!pwIsValid) {
    return res.status(422).json({
      message: "Invalid credentials.",
      errors: { credentials: "Invalid username or password entered." },
    });
  }
  console.log(user.admin);
  const admin = user.admin;
  const token = createJSONToken(username, admin);
  console.log(token);
  res.json({ token });
});

module.exports = router;
