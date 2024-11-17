import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import bcrypt from "bcrypt";
import { UserModel } from "./Models/user.model";
import { ContentModel } from "./Models/content.model";
import  {connect_db} from "./db"
const app = express();
app.use(express.json());



    connect_db();


app.post("/api/v1/signup", async (req, res) => {
  // TODO: zod validation , hash the password
  const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Must be at least 6 chars"),
  });

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const result = userSchema.safeParse(userData);

  if (result.success) {
    console.log("Data is valid:", result.data);
    try {
      const myPlaintextPassword = result.data.password;
      const hash = await bcrypt.hash(myPlaintextPassword, 10);
      await UserModel.create({
        username: result.data.name,
        email: result.data.email,
        password: hash,
      });
      res.json({ message: "User signed up" });
    } catch (e) {
      // Handle errors (e.g., duplicate user)
      {
        // Duplicate key error
        res.status(411).json({ message: "User already exists" });
      }
    }
  } else {
    console.error("Validation errors:", result.error.errors);
  }
});
app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username,
    password,
  });
  if (existingUser) {
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_PASSWORD
    );

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Incorrrect credentials",
    });
  }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  await ContentModel.create({
    link,
    type,
    //@ts-ignore
    userId: req.userId,
    tags: [],
  });

  res.json({
    message: "Content added",
  });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId: userId,
  }).populate("userId", "username");
  res.json({
    content,
  });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;

  await ContentModel.deleteMany({
    contentId,
    // @ts-ignore
    userId: req.userId,
  });

  res.json({
    message: "Deleted",
  });
});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000);
