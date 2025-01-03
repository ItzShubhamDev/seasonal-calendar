import mongoose, { Schema } from "mongoose";

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

export const User = mongoose.model("User", UserSchema);
