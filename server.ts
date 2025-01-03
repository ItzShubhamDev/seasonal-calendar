import express, { NextFunction } from "express";
import ViteExpress from "vite-express";
import { Request, Response } from "express";
import multer from "multer";
import { config } from "dotenv";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { connect } from "./db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Event as EventResponse } from "./types";
import { User } from "./schemas/User";
import { Event } from "./schemas/Event";
import {
    getCities,
    getCountries,
    getHolidays,
    getIP,
    getRegions,
    getWeather,
    verifyJWT,
} from "./functions";

const upload = multer();
config();

let ai: GenerativeModel;

const app = express();
app.use(express.json());

const { GEMINI_KEY, MONGODB_URI, AUTH_SECRET } = process.env;

if (GEMINI_KEY) {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const date = new Date();
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: `Your are a professional image reader made specifically for taking out dates from the image. Extract the dates from the images and return in a json as { 'date': <Date>, 'event': <Event> }, if year is missing, set year to ${date.getFullYear()}, if month is missing set month to ${
            date.getMonth() + 1
        }, if date, month and year are missing, don't return the date`,
    });
    ai = model;
} else {
    console.error("No Gemini key found Image parsing will not work");
}

if (MONGODB_URI) {
    connect();
} else {
    console.error("No MongoDB URI found Database will not work");
}

if (!AUTH_SECRET) {
    console.error("No auth secret found Auth will not work");
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await verifyJWT(token);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    req["user"] = user;
    next();
};

app.get("/holidays", async (req: Request, res: Response) => {
    const year = (req.query.year ||
        new Date().getFullYear().toString()) as string;
    const { country } = req.query as { country: string };
    if (country) {
        const holidays = await getHolidays(country, year);
        if (holidays) {
            return res.status(200).json({ data: holidays });
        }
    }
    const user = await verifyJWT(req.headers["authorization"] as string);
    if (user && user.country) {
        const holidays = await getHolidays(user.country, year);
        if (holidays) {
            return res.status(200).json({ data: holidays });
        }
    }
    const clientIp = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    const ip = await getIP(clientIp as string);
    if (!ip) {
        return res.status(400).json({ error: "Failed to get location" });
    }
    const countryCode = ip.countryCode;

    const holidays = await getHolidays(countryCode, year);
    if (!holidays) {
        return res.status(400).json({ error: "Failed to get holidays" });
    }

    res.status(200).json({ data: holidays });
});

app.get("/weather", async (req: Request, res: Response) => {
    const { lat, lon, city, region } = req.query as {
        lat: string;
        lon: string;
        city: string;
        region: string;
    };
    if (lat && lon && city && region) {
        const weather = await getWeather(lat, lon, city, region);
        if (weather) {
            return res.status(200).json({ data: weather });
        }
    }
    const user = await verifyJWT(req.headers["authorization"] as string);
    if (user && user.latitude && user.longitude && user.city && user.region) {
        const weather = await getWeather(
            user.latitude,
            user.longitude,
            user.city,
            user.region
        );
        if (weather) {
            return res.status(200).json({ data: weather });
        }
    }
    const clientIp = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    const ip = await getIP(clientIp as string);
    if (!ip) {
        return res.status(400).json({ error: "Failed to get location" });
    }
    const weather = await getWeather(ip.lat, ip.lon, ip.city, ip.regionName);
    if (!weather) {
        return res.status(400).json({ error: "Failed to get weather" });
    }
    res.status(200).json({ data: weather });
});

app.get("/cities", async (req: Request, res: Response) => {
    const { country, region } = req.query as {
        country: string;
        region: string;
    };
    if (!country) {
        const countries = await getCountries();
        if (!countries) {
            return res.status(400).json({ error: "Failed to get countries" });
        }
        return res.status(200).json({ data: countries });
    }
    if (!region) {
        const regions = await getRegions(country);
        if (!regions) {
            return res.status(400).json({ error: "Failed to get regions" });
        }
        return res.status(200).json({ data: regions });
    }
    const cities = await getCities(country, region);
    if (!cities) {
        return res.status(400).json({ error: "Failed to get cities" });
    }
    res.status(200).json({ data: cities });
});

app.post(
    "/upload",
    upload.single("image"),
    async (req: Request, res: Response) => {
        if (!ai) {
            return res.status(400).json({ error: "AI is not available" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }
        const validTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!validTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: "Invalid file type" });
        }

        const image = req.file.buffer;
        try {
            const result = await ai.generateContent([
                {
                    inlineData: {
                        data: Buffer.from(image).toString("base64"),
                        mimeType: req.file.mimetype,
                    },
                },
                "date",
            ]);

            const response = result.response.text();
            const data = response.split("```")[1].replace("json", "");
            const json = JSON.parse(data) as EventResponse[];

            const user = await verifyJWT(
                req.headers["authorization"] as string
            );
            if (!user) {
                return res
                    .status(200)
                    .json({ authenticated: false, data: json });
            } else {
                for (const event of json) {
                    if (event.date) {
                        const ev = await Event.findOne({
                            date: new Date(event.date),
                            event: event.event,
                            userId: user.id,
                        });
                        if (ev) {
                            continue;
                        }
                        await Event.create({
                            date: new Date(event.date),
                            event: event.event,
                            userId: user.id,
                        });
                    }
                }

                const events = await Event.find({ userId: user.id });
                return res
                    .status(200)
                    .json({ authenticated: true, data: events });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: "Failed to parse image" });
        }
    }
);

app.get("/events", verifyToken, async (req, res) => {
    if (!MONGODB_URI) {
        return res.status(500).json({ error: "Internal server error" });
    }
    try {
        const events = await Event.find({ userId: req["user"].id });
        res.status(200).json({ data: events });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/events", verifyToken, async (req, res) => {
    if (!MONGODB_URI) {
        return res.status(500).json({ error: "Internal server error" });
    }
    try {
        const event = await Event.create({
            date: req.body.date,
            event: req.body.event,
            userId: req["user"].id,
        });
        res.status(201).json({ data: event });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/events/:id", verifyToken, async (req, res) => {
    if (!MONGODB_URI) {
        return res.status(500).json({ error: "Internal server error" });
    }
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            userId: req["user"].id,
        });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        await event.deleteOne();
        res.status(200).json({ message: "Event deleted successfully" });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/auth/register", async (req: Request, res: Response) => {
    if (!AUTH_SECRET || !MONGODB_URI) {
        return res.status(500).json({ error: "Internal server error" });
    }
    const email = req.body.email as string;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            email,
            password: hashedPassword,
        });

        return res
            .status(201)
            .json({ message: "User registered successfully" });
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/auth/login", async (req, res) => {
    if (!AUTH_SECRET || !MONGODB_URI) {
        return res.status(500).json({ error: "Internal server error" });
    }
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                email: user.email,
                id: user._id.toString(),
                city: user.city,
                region: user.region,
                country: user.country,
                latitude: user.latitude,
                longitude: user.longitude,
            },
            AUTH_SECRET,
            { expiresIn: "30d" }
        );
        res.status(200).json({ token });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/auth/user", verifyToken, async (req, res) => {
    res.status(200).json(req["user"]);
});

app.put("/auth/user", verifyToken, async (req, res) => {
    if (!AUTH_SECRET || !MONGODB_URI) {
        return res.status(500).json({ error: "Internal server error" });
    }
    try {
        const user = await User.findOne({ email: req["user"].email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.city = req.body.city;
        user.region = req.body.region;
        user.country = req.body.country;
        user.latitude = req.body.latitude;
        user.longitude = req.body.longitude;
        await user.save();
        const token = jwt.sign(
            {
                email: user.email,
                id: user._id.toString(),
                city: user.city,
                region: user.region,
                country: user.country,
                latitude: user.latitude,
                longitude: user.longitude,
            },
            AUTH_SECRET,
            { expiresIn: "30d" }
        );
        res.status(200).json({
            message: "User updated successfully",
            data: { token },
        });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
});

ViteExpress.listen(app, 3000, () =>
    console.log("Server is listening on port 3000")
);
