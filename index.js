const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");
const likesRoutes = require("./routes/likes");
const dislikesRoutes = require("./routes/dislikes");
const messagesRoutes = require("./routes/messages");
const friendsRoutes = require("./routes/friends");

const app = express();
const port = Number(process.env.PORT) || 8080;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.get("/", async (req, res) => {
  res.json("SUCCESS! 😊");
});

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(authRoutes);
app.use(usersRoutes);
app.use(postsRoutes);
app.use(commentsRoutes);
app.use(likesRoutes);
app.use(dislikesRoutes);
app.use(messagesRoutes);
app.use(friendsRoutes);

app.listen(port, () => console.log(`App running on port ${port}`));
