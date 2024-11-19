import express from "express";

import { contentModel, userModel } from "./db";
import { z } from "zod";

import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { userMiddleware } from "./middleware";
dotenv.config();

const app = express();
app.use(express.json());

app.post(
  "/api/v1/signup",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const signupSchema = z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be of 8 characters"),
      });

      const validatedData = signupSchema.parse(req.body);
      const { email, password } = validatedData;

      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(403).json({
          message: "User already exist",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.create({
        email,
        password: hashedPassword,
      });
      return res.status(200).json({
        message: "sign up successfully",
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
);
app.post(
  "/api/v1/signin",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password }: { email: string; password: string } = req.body;

      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const match = await bcrypt.compare(password, user.password as string);
      if (!match) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_SECRET as Secret
      );

      return res.status(200).json({
        message: "SignIn successful",
        token,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "SignIn failed",
        error: error.message,
      });
    }
  }
);

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  const title = req.body.title;

  await contentModel.create({
    link,
    title,
    type,
    userId: req.userId,
    tags: [],
  });
  res.json({
    message: "Content Added",
  });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  const deleted = await contentModel.deleteMany({
    _id: contentId,
    userId: req.userId,
  });
  if (deleted.deletedCount > 0) {
    res.json({
      message: "Deleted",
    });
    return;
  }
  res.json({
    message: "error in Deleting",
  });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await contentModel.find({ userId });

    res.json({ content: result });
  } catch (error) {
    res.json({
      message: "error in getting the posts",
    });
  }
});
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share;
  const userId = req.userId;
  let link = null;
  if (typeof share !== "boolean") {
    res
      .status(400)
      .json({ message: 'Invalid input, "share" must be a boolean.' });
  }
  if (share) {
    link = `http://localhost:3000/api/v1/brain/${userId}-${Date.now()}`;
    res.status(200).json({
      link: link,
    });
  } else {
    res.status(400).json({
      message: "Bad request",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const link = req.params.shareLink;
  const userId = link.split("-")[0];
  const result = await contentModel.find({ userId }).select(["-_id", "-__v"]);
  if(!result){
    res.status(404).json({
      message:"Invalid Link"
    })
  }
  const user = await userModel
    .findById(userId)
    .select(["-password", "-_id", "-__v"]);

  res.status(200).json({ user, content: result });
});

app.listen(3000);