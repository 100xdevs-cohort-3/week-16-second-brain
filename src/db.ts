import mongoose, { connect } from "mongoose";


export async function connect_db() {
    try {
       const stored = await connect("mongodb://localhost:27017/second-brain");
        console.log("MongoDB connected successfully...");
        // console.log(stored.connection,stored.Collection);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); 

    }
}

