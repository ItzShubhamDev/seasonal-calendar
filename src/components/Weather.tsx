import { Droplet, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetch } from "../functions";

const weatherData = [
    {
        icon:
            new Date().getHours() > 6 && new Date().getHours() < 19
                ? "Sun.png"
                : "Star.png",
        weather: ["Clear sky"],
    },
    {
        icon: "Sun%20Behind%20Cloud.png",
        weather: ["Mainly clear", "Partly cloudy"],
    },
    {
        icon: "Cloud.png",
        weather: ["Overcast"],
    },
    {
        icon: "Fog.png",
        weather: ["Fog", "Depositing rime fog"],
    },
    {
        icon: "Cloud%20with%20Rain.png",
        weather: ["Light drizzle", "Moderate drizzle", "Dense drizzle"],
    },
    {
        icon: "Cloud%20with%20Snow.png",
        weather: [
            "Light freezing drizzle",
            "Dense freezing drizzle",
            "Light rain",
            "Moderate rain",
            "Heavy rain",
            "Light freezing rain",
            "Heavy freezing rain",
            "Slight snow fall",
            "Moderate snow fall",
            "Heavy snow fall",
            "Snow grains",
            "Slight snow showers",
            "Heavy snow showers",
        ],
    },
    {
        icon: "Umbrella%20with%20Rain%20Drops.png",
        weather: ["Light rain", "Moderate rain", "Heavy rain"],
    },
    {
        icon: "Sun%20Behind%20Rain%20Cloud.png",
        weather: [
            "Slight rain showers",
            "Moderate rain showers",
            "Violent rain showers",
        ],
    },
    {
        icon: "Cloud%20with%20Lightning.png",
        weather: [
            "Slight thunderstorm",
            "Thunderstorm with slight hail",
            "Thunderstorm with heavy hail",
        ],
    },
    {
        icon: "Bubbles.png",
        weather: ["Unknown weather code"],
    },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type WeatherData = {
    temperature: string;
    apparent_temperature: string;
    weather: string;
    humidity: string;
    wind_speed: string;
    temp_min: string;
    temp_max: string;
    city: string;
    region: string;
    weekly: {
        time: string;
        max: string;
        min: string;
    }[];
};

type User = {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
};

const Weather = ({ user }: { user: User | null }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [icon, setIcon] = useState<string | null>("Sun%20Behind%20Cloud.png");

    useEffect(() => {
        const getWeather = async () => {
            try {
                const params = user
                    ? `?lat=${user.latitude}&lon=${user.longitude}&city=${user.city}&region=${user.region}`
                    : "";
                const url = `/weather${params}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.error) return toast.error(data.error);
                setWeather(data.data);
                setLoading(false);
            } catch {
                toast.error(
                    "An error occurred while fetching the weather data"
                );
                setLoading(false);
            }
        };
        getWeather();
    }, [user]);

    useEffect(() => {
        if (weather) {
            const icon = weatherData.find((data) =>
                data.weather.includes(weather.weather)
            )?.icon;
            setIcon(icon || "Bubbles.png");
        }
    }, [weather]);

    return (
        <>
            {loading ? (
                <>
                    <div className="w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
                    </div>
                </>
            ) : (
                <>
                    <div className="h-full lg:max-w-sm flex w-full bg-gray-700 shadow-lg rounded-lg overflow-hidden p-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="text-4xl font-bold text-yellow-300">
                                    {weather?.temperature}
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-gray-100">
                                <div className="flex items-center">
                                    <Droplet
                                        size={16}
                                        className="text-blue-400"
                                    />
                                    <span className="ml-2">
                                        Humidity: {weather?.humidity}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Wind
                                        size={16}
                                        className="text-green-400"
                                    />
                                    <span className="ml-2">
                                        Wind: {weather?.wind_speed}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold mr-1">
                                        Feels like:{" "}
                                    </span>
                                    <span>{weather?.apparent_temperature}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow flex flex-col items-end text-white">
                            <span className="text-lg font-semibold truncate max-w-52">
                                {weather?.city}, {weather?.region}
                            </span>
                            <span className="text-sm font-semibold mb-2">
                                {weather?.temp_min} - {weather?.temp_max}
                            </span>
                            <img
                                src={`https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/${icon}`}
                                alt="Weather Icon"
                                width="50"
                                height="50"
                            />
                            <span className="text-lg font-semibold truncate max-w-52">
                                {weather?.weather}
                            </span>
                        </div>
                    </div>
                    <div className="h-full lg:max-w-xl flex flex-col space-y-4 w-full bg-gray-700 shadow-lg rounded-lg overflow-hidden p-4">
                        <h1 className="text-2xl font-medium text-gray-100 text-center">
                            Weekly Forecast
                        </h1>
                        <div className="w-full flex h-full">
                            <div className="text-gray-100 w-full text-center flex flex-col space-y-2">
                                <span className="text-md font-medium ">
                                    Day
                                </span>
                                <span className="text-sm">Max</span>
                                <span className="text-sm">Min</span>
                            </div>
                            {weather?.weekly.map((day, i) => (
                                <div
                                    key={`time-${i}`}
                                    className={`text-gray-100 w-full text-center flex flex-col space-y-2 ${
                                        new Date(day.time).getDay() ===
                                        new Date().getUTCDay()
                                            ? "bg-gray-100/10 rounded-lg"
                                            : ""
                                    }`}
                                >
                                    <span className="text-md font-medium ">
                                        {days[new Date(day.time).getDay()]}
                                    </span>
                                    <span className="text-sm">{day.max}</span>
                                    <span className="text-sm">{day.min}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Weather;
