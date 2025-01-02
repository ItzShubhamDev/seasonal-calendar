import express, { NextFunction } from "express";
import ViteExpress from "vite-express";
import { Request, Response } from "express";
import countries from "./countries.json";
import customHolidays from "./holidays.json";
import weathers from "./weathers.json";
import multer from "multer";
import { config } from "dotenv";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { connect } from "./db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Ip, Holiday, Weather, Event as EventResponse } from "./types";
import { User } from "./schemas/User";
import { Event } from "./schemas/Event";

const upload = multer();
config();

let ai: GenerativeModel;

const app = express();
app.use(express.json());

if (process.env.GEMINI_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const date = new Date();
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: `Your are a professional image reader made specifically for taking out dates from the image. Extract the dates from the images and return in a json as { 'date': <Date>, 'event': <Event> }, if year is missing, set year to ${date.getFullYear()}, if month is missing set month to ${
            date.getMonth() + 1
        }, if date, month and year are missing, set date to null.`,
    });
    ai = model;
} else {
    console.error("No Gemini key found Image parsing will not work");
}

if (process.env.MONGODB_URI) {
    connect();
} else {
    console.error("No MongoDB URI found Database will not work");
}

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
    console.error("No auth secret found Auth will not work");
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, authSecret!, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req["user"] = decoded;
        next();
    });
};

app.get("/holidays", async (req: Request, res: Response) => {
    const clientIp = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    const ipres = await fetch(`http://ip-api.com/json/${clientIp}`);
    const ip = (await ipres.json()) as Ip;

    if (ip.status !== "success") {
        if (ip.message) {
            return res.status(400).json({ error: ip.message });
        }
        return res.status(400).json({ error: "Failed to get location" });
    }
    const country = ip.countryCode;

    const customCountries = Object.keys(customHolidays);

    if (!customCountries.includes(country) && !countries.includes(country)) {
        return res
            .status(400)
            .json({ error: "Sorry, we don't support this country" });
    }

    let { year } = req.query as {
        year: string | number;
    };

    if (!year) {
        return res.status(400).json({ error: "Year is required" });
    }

    try {
        year = parseInt(year as string);
    } catch {
        return res.status(400).json({
            error: "Year must be number",
        });
    }

    if (year < 2000 || year > 2030) {
        return res.status(400).json({
            error: "Year must be between 2000 and 2030",
        });
    }

    if (customCountries.includes(country)) {
        const customCountry = customHolidays[country];
        const years = Object.keys(customCountry);
        if (!years.includes(year.toString())) {
            return res.status(400).json({
                error: "Year is not available",
            });
        }
        return res.status(200).json(customCountry[year]);
    }

    const holidaysRes = await fetch(
        `https://date.nager.at/api/v3/publicholidays/${year}/${country}`
    );
    const holidays = (await holidaysRes.json()) as Holiday[];

    res.status(200).json(holidays);
});

app.get("/weather", async (req: Request, res: Response) => {
    const clientIp = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    const ipres = await fetch(`http://ip-api.com/json/${clientIp}`);
    const ip = (await ipres.json()) as Ip;

    if (ip.status !== "success") {
        if (ip.message) {
            return res.status(400).json({ error: ip.message });
        }
        return res.status(400).json({ error: "Failed to get location" });
    }

    const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${ip.lat}&longitude=${ip.lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min`
    );
    const weather = (await weatherRes.json()) as Weather;
    const w = weathers[weather.current.weather_code] || "";

    if (weather.error) {
        return res.status(400).json({ error: "Failed to get weather" });
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const index = weather.daily.time.indexOf(currentDate);

    res.status(200).json({
        temperature: `${weather.current.temperature_2m} ${weather.current_units.temperature_2m}`,
        apparent_temperature: `${weather.current.apparent_temperature} ${weather.current_units.temperature_2m}`,
        weather: w,
        wind_speed: `${weather.current.wind_speed_10m} ${weather.current_units.wind_speed_10m}`,
        humidity: `${weather.current.relative_humidity_2m} ${weather.current_units.relative_humidity_2m}`,
        temp_max: `${weather.daily.temperature_2m_max[index]} ${weather.daily_units.temperature_2m_max}`,
        temp_min: `${weather.daily.temperature_2m_min[index]} ${weather.daily_units.temperature_2m_min}`,
        city: ip.city,
        region: ip.regionName,
        weekly: weather.daily.time.map((time, i) => ({
            time,
            max: `${weather.daily.temperature_2m_max[i]}`,
            min: `${weather.daily.temperature_2m_min[i]}`,
        })),
    });
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

            if (req.headers["authorization"]) {
                try {
                    let token = req.headers["authorization"] as string;
                    if (token.startsWith("Bearer ")) {
                        token = token.slice(7, token.length);
                    }
                    const decoded = jwt.verify(token, authSecret!) as {
                        email: string;
                        id: string;
                    };
                    for (const event of json) {
                        if (event.date) {
                            const ev = await Event.findOne({
                                date: new Date(event.date),
                                event: event.event,
                                userId: decoded.id,
                            });
                            if (ev) {
                                continue;
                            }
                            await Event.create({
                                date: new Date(event.date),
                                event: event.event,
                                userId: decoded.id,
                            });
                        }
                    }

                    const events = await Event.find({ userId: decoded.id });
                    return res
                        .status(200)
                        .json({ authenticated: false, events });
                } catch (error) {
                    console.error(error);
                }
            }

            return res.status(200).json({ authenticated: false, events: json });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: "Failed to parse image" });
        }
    }
);

app.get("/events", verifyToken, async (req, res) => {
    try {
        const events = await Event.find({ userId: req["user"].id });
        res.status(200).json({ events });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/events", verifyToken, async (req, res) => {
    try {
        const event = await Event.create({
            date: req.body.date,
            event: req.body.event,
            userId: req["user"].id,
        });
        res.status(201).json({ event });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/events/:id", verifyToken, async (req, res) => {
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
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            email: req.body.email,
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
            { email: user.email, id: user._id.toString() },
            authSecret!,
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

ViteExpress.listen(app, 3000, () =>
    console.log("Server is listening on port 3000")
);
