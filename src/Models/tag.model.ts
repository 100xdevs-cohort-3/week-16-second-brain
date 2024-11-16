import mongoose from "mongoose";
const tagSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true },
},
{timestamps:true});

const Tag = mongoose.model("Tag", tagSchema);
module.exports = Tag;
