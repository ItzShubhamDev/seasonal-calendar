import mongoose, { Document, Schema } from "mongoose";

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            default: null,
        },
        region: {
            type: String,
            default: null,
        },
        country: {
            type: String,
            default: null,
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
    },
    { timestamps: true }
);

interface UserDocument extends Document {
    email: string;
    password: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
}

export const User =
    (mongoose.models.User as mongoose.Model<UserDocument>) ??
    mongoose.model("User", UserSchema);
