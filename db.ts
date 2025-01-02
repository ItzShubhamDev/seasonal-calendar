import mongoose from "mongoose";
import { config } from "dotenv";

config();

const uri = process.env.MONGODB_URI;

export async function connect() {
    if (!uri) {
        throw new Error("MongoDB token is not provided");
    }
    mongoose
        .connect(uri, {})
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((err) => {
            console.error(err);
        });
}
