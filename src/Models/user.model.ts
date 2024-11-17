import mongoose ,{Schema,model} from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
    lowercase: true,
  },
} ,{timestamps:true});

export const  UserModel = model("User",userSchema)