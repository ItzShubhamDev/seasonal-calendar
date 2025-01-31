import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiKey = process.env.GEMINI_KEY;

if (!geminiKey) {
    throw new Error("Please set the GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(geminiKey);
const date = new Date();

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: `Your are a professional image reader made specifically for taking out dates from the image. Extract the dates from the images and return in a json as { 'date': <Date>, 'event': <Event> }, if year is missing, set year to ${date.getFullYear()}, if month is missing set month to ${
        date.getMonth() + 1
    }, if date, month and year are missing, don't return the date`,
});

export default model;
