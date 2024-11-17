import mongoose, { connect } from "mongoose";


export async function connect_db() {
    try {
        await connect("mongodb://localhost:27017/brainly");
        console.log("MongoDB connected successfully...");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); 

    }
}

