import mongoose, { Schema } from "mongoose";

const EventSchema = new Schema(
    {
        date: {
            type: Date,
            default: null,
        },
        event: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Event =
    mongoose.models.Event || mongoose.model("Event", EventSchema);
