import type { Region, Holiday, Ip, Weather } from "./types";
import weathers from "@/datas/weathers.json";
import holidays from "@/datas/holidays.json";
import countries from "@/datas/countries.json";
import cities from "@/datas/cities.json";

export async function getIP(clientIp: string) {
    const ipres = await fetch(`http://ip-api.com/json/${clientIp}`);
    const ip = (await ipres.json()) as Ip;

    if (ip.status !== "success") {
        return null;
    }

    return ip;
}

export async function getHolidays(country: string, year: string) {
    const customCountries = Object.keys(holidays);
    if (!countries.includes(country) && !customCountries.includes(country)) {
        return null;
    }
    try {
        if (parseInt(year) < 2021 || parseInt(year) > 2030) {
            return null;
        }

        if (customCountries.includes(country)) {
            const code = country as keyof typeof holidays;
            const y = year as keyof (typeof holidays)[typeof code];
            const holiday = (holidays[code][y] as Holiday[]) || null;
            return holiday;
        }

        const res = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
        );

        const holiday = (await res.json()) as Holiday[];
        return holiday;
    } catch {
        return null;
    }
}

export async function getCountries() {
    return Object.keys(cities);
}

export async function getRegions(country: string) {
    if (!Object.keys(cities).includes(country)) {
        return null;
    }
    const con = country as keyof typeof cities;

    return Object.keys(cities[con]);
}

export async function getCities(country: string, region: string) {
    if (!Object.keys(cities).includes(country)) {
        return null;
    }
    const con = country as keyof typeof cities;

    const regions = cities[con] as Region;
    if (!regions) {
        return null;
    }

    return regions[region] || null;
}

export async function getWeather(
    lat: string | number,
    lon: string | number,
    city: string,
    region: string
) {
    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min`
    );

    const weather = (await res.json()) as Weather;
    if (weather.error) {
        return null;
    }

    const code =
        weather.current.weather_code.toString() as keyof typeof weathers;

    const w = weathers[code] || "";

    const currentDate = new Date().toISOString().split("T")[0];
    const index = weather.daily.time.indexOf(currentDate);

    return {
        temperature: `${weather.current.temperature_2m} ${weather.current_units.temperature_2m}`,
        apparent_temperature: `${weather.current.apparent_temperature} ${weather.current_units.temperature_2m}`,
        weather: w,
        wind_speed: `${weather.current.wind_speed_10m} ${weather.current_units.wind_speed_10m}`,
        humidity: `${weather.current.relative_humidity_2m} ${weather.current_units.relative_humidity_2m}`,
        temp_max: `${weather.daily.temperature_2m_max[index]} ${weather.daily_units.temperature_2m_max}`,
        temp_min: `${weather.daily.temperature_2m_min[index]} ${weather.daily_units.temperature_2m_min}`,
        city,
        region,
        weekly: weather.daily.time.map((time, i) => ({
            time,
            max: `${weather.daily.temperature_2m_max[i]}`,
            min: `${weather.daily.temperature_2m_min[i]}`,
        })),
    };
}
