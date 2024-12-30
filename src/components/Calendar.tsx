import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Particles from "./Particles";
import spring from "../images/backgrounds/spring.jpg";
import summer from "../images/backgrounds/summer.jpg";
import monsoon from "../images/backgrounds/monsoon.jpg";
import autumn from "../images/backgrounds/autumn.jpg";
import winter from "../images/backgrounds/winter.jpg";

const getSeason = (month: number) => {
    if (month >= 2 && month <= 3) return "spring";
    if (month >= 4 && month <= 6) return "summer";
    if (month >= 7 && month <= 8) return "monsoon";
    if (month >= 9 && month <= 10) return "autumn";
    return "winter";
};

const breakMonthintoDays = (days: number[]) => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return weeks;
};

const seasonImages = {
    spring,
    summer,
    monsoon,
    autumn,
    winter,
};

const Calendar = ({
    date,
    setDate,
}: {
    date: Date;
    setDate: React.Dispatch<React.SetStateAction<Date>>;
}) => {
    const [monthArray, setMonthArray] = useState<number[][]>([]);
    const month = date.getMonth();
    const year = date.getFullYear();

    useEffect(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const monthArray = Array.from({ length: firstDayOfMonth }).concat(
            days
        ) as number[];
        setMonthArray(breakMonthintoDays(monthArray));
    }, [date, year, month]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                prevMonth();
            } else if (event.key === "ArrowRight") {
                nextMonth();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

    const week = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const season = getSeason(month);

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const prevMonth = () => {
        setDate(new Date(year, month - 1));
    };

    const nextMonth = () => {
        setDate(new Date(year, month + 1));
    };

    return (
        <div
            className="md:p-8 p-5 w-full h-full rounded-tl-2xl"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${seasonImages[season]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <Particles season={season} />
            <div className="px-16 flex items-center justify-between">
                <span className="focus:outline-none text-4xl font-bold text-gray-100">
                    {monthNames[month]} {year}
                </span>
                <div className="flex items-center space-x-2">
                    <button
                        className="hover:border-gray-100 text-gray-100 border-2 border-gray-400 rounded-full px-4 py-2"
                        onClick={() => setDate(new Date())}
                    >
                        Today
                    </button>
                    <button
                        className="hover:border-gray-100 text-gray-100 border-2 border-gray-400 rounded-full p-2"
                        onClick={prevMonth}
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        className="hover:border-gray-100 text-gray-100 border-2 border-gray-400 rounded-full p-2"
                        onClick={nextMonth}
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between pt-12 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            {week.map((day) => (
                                <th key={day}>
                                    <div className="w-full flex justify-center">
                                        <p className="text-2xl font-medium text-center text-gray-100">
                                            {day}
                                        </p>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {monthArray.map((week, index) => (
                            <tr key={index}>
                                {week.map((day, index) => (
                                    <td key={index} className="py-2">
                                        <div
                                            className={
                                                "w-10 h-10 rounded-full mx-auto flex items-center justify-center " +
                                                `${
                                                    day ===
                                                        new Date().getDate() &&
                                                    month ===
                                                        new Date().getMonth() &&
                                                    year ===
                                                        new Date().getFullYear()
                                                        ? "bg-red-700/80"
                                                        : day
                                                        ? "bg-gray-700/50"
                                                        : ""
                                                }`
                                            }
                                        >
                                            <p className="text-2xl font-medium text-gray-100">
                                                {day}
                                            </p>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {monthArray.length < 6 && (
                            <tr>
                                {Array.from({ length: 7 }).map((_, index) => (
                                    <td key={index} className="py-2">
                                        <div className="w-10 h-10 rounded-full mx-auto"></div>
                                    </td>
                                ))}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Calendar;
