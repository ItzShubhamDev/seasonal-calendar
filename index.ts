import holidaysFile from "./holidays.json";
import fs from "fs";

const apiKey = "API_KEY" as string; // Replace with your actual API key from AbstractAPI
const country = "CC" as string; // Country code for which to fetch holiday data
const years = [2025] as number[]; // Array of years for which to fetch holiday data

type Holiday = {
    name: string;
    name_local: string;
    language: string;
    description: string;
    country: string;
    location: string;
    type: string;
    date: string;
    date_year: string;
    date_month: string;
    date_day: string;
    week_day: string;
};

type formattedHoliday = {
    date: string;
    localName: string;
    name: string;
    countryCode: string;
    fixed: boolean;
    global: boolean;
    counties: null;
    launchYear: null;
    types: string[];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const holidays: { [year: string]: formattedHoliday[] } = {};

const fetchAndSaveHoliday = async (
    day: number,
    month: number,
    year: number
) => {
    try {
        const url = `https://holidays.abstractapi.com/v1/?api_key=${apiKey}&country=${country}&year=${year}&month=${month}&day=${day}`;

        const response = await fetch(url);
        const holidayData = await response.json();

        return holidayData as Holiday[];
    } catch (error) {
        console.error(
            `Error fetching data for ${day}/${month}/${year}:`,
            error.message
        );
    }
};

const convertToFormattedHoliday = (holiday: Holiday): formattedHoliday => {
    return {
        date: holiday.date,
        localName: holiday.name_local,
        name: holiday.name,
        countryCode: holiday.country,
        fixed: false,
        global: false,
        counties: null,
        launchYear: null,
        types: [holiday.type],
    };
};

const fetchAllHolidays = async () => {
    if (country === "CC") {
        console.error("Please replace 'CC' with the actual country code");
        return;
    } else if (apiKey === "API_KEY") {
        console.error("Please replace 'API_KEY' with your actual API key");
        return;
    }
    if (country.length !== 2) {
        console.error("Country code should be exactly 2 characters long");
        return;
    }
    if (!fs.existsSync("backups")) {
        fs.mkdirSync("backups");
    }
    for (const year of years) {
        const yearlyHolidays = [] as formattedHoliday[];
        for (let month = 1; month <= 12; month++) {
            const daysInMonth = new Date(year, month, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const r = await fetchAndSaveHoliday(day, month, year);
                if (r) {
                    r.forEach((holiday) => {
                        yearlyHolidays.push(convertToFormattedHoliday(holiday));
                    });
                }
                await delay(1000);
            }
        }
        holidays[year] = yearlyHolidays;
        fs.writeFileSync(
            `backups/holidays-${country}-${year}.json`,
            JSON.stringify(yearlyHolidays, null, 2)
        );
    }
};

fetchAllHolidays()
    .then(() => {
        fs.writeFileSync(
            "backups/holidays.json",
            JSON.stringify(holidaysFile, null, 2)
        );
        console.log("New file saved successfully at holidays-new.json");
        holidaysFile[country] = holidays;
        fs.writeFileSync(
            "holidays.json",
            JSON.stringify(holidaysFile, null, 2)
        );
        console.log("Holidays file updated successfully");
    })
    .catch((error) => {
        console.error("Error during holiday fetching process:", error.message);
    });
