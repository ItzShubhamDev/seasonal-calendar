import express from "express";
import ViteExpress from "vite-express";
import { Request, Response } from "express";
import countries from "./countries.json";
import customHolidays from "./holidays.json";
import weathers from "./weathers.json";

type Ip = {
    status: string;
    countryCode: string;
    regionName: string;
    city: string;
    lat: number;
    lon: number;
    region: string;
    message?: string;
};

type Holiday = {
    date: string;
    name: string;
    types: string[];
};

type Weather = {
    daily_units: {
        time: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
    };
    current_units: {
        temperature_2m: string;
        apparent_temperature: string;
        weather_code: string;
        relative_humidity_2m: string;
        wind_speed_10m: string;
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
    };
    current: {
        temperature_2m: number;
        apparent_temperature: number;
        weather_code: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
    };
    error?: boolean;
};

const app = express();

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

ViteExpress.listen(app, 3000, () =>
    console.log("Server is listening on port 3000")
);
