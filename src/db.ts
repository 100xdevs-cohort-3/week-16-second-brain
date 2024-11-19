import mongoose, { Schema, model } from "mongoose";

import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.DATABASE_URL as string)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const contentSchema = new Schema({
  title:String,
  link:String,
  tags:[{type:mongoose.Types.ObjectId,ref:'Tag'}],
  userId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
  type:String,
});

export const contentModel = model("Content",contentSchema);
export const userModel = model("User", userSchema);