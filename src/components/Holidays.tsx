import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Holiday = {
    date: string;
    name: string;
    types: string[];
};

type Event = {
    date: string;
    event: string;
};

const Holidays = ({
    date,
}: {
    date: Date;
}) => {
    const [loading, setLoading] = useState(true);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [hidden, setHidden] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLoading(true);
        setHolidays([]);
        fetch(`/holidays?year=${date.getFullYear()}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    console.error(data.error);
                    setHolidays([]);
                    setLoading(false);
                    return;
                }
                const holidays = data.filter(
                    (holiday: Holiday) =>
                        new Date(holiday.date).getMonth() === date.getMonth()
                );
                setHolidays(holidays);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setHolidays([]);
                setLoading(false);
            });
    }, [date]);

    const upload = () => {
        if (ref.current) {
            ref.current.click();
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const validTypes = ["image/png", "image/jpeg", "image/webp"];
        if (file) {
            if (!validTypes.includes(file.type)) {
                alert("Invalid file type");
                return;
            }
            const formData = new FormData();
            formData.append("image", file);
            const res = await fetch("/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.error) {
                console.error(data.error);
                return;
            }
            setEvents(data);
        }
    };

    return (
        <div
            className={`flex max-w-64 w-full h-screen flex-col max-lg:fixed z-20 max-lg:bg-gray-900 p-4 ease-in-out duration-300 lg:translate-x-0 ${
                hidden ? "-translate-x-64" : "translate-x-0"
            }`}
        >
            <button
                onClick={() => setHidden(!hidden)}
                className="lg:hidden absolute top-1/2 right-0 translate-x-full py-2 bg-gray-900 rounded-tr-full rounded-br-full text-white"
            >
                {hidden ? <ChevronRight /> : <ChevronLeft />}
            </button>
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
                </div>
            ) : (
                <>
                    <div className="w-full flex flex-col h-1/2">
                        <div className="w-full flex justify-between">
                            <span className="text-2xl font-medium text-gray-100 text-center">
                                Events
                            </span>
                            <button
                                onClick={upload}
                                className="hover:border-gray-100 transition-colors text-gray-100 border-2 border-gray-400 rounded-full px-4 py-1"
                            >
                                Upload
                            </button>
                        </div>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            ref={ref}
                            className="hidden"
                            onChange={handleUpload}
                        />
                        <div className="flex-grow overflow-y-scroll">
                            {events
                                .filter((e) => {
                                    const d = new Date(e.date);
                                    return (
                                        d.getMonth() === date.getMonth() &&
                                        d.getFullYear() === date.getFullYear()
                                    );
                                })
                                .map((event, i) => (
                                    <div key={i} className="py-2">
                                        <p className="text-lg font-medium text-gray-100">
                                            {event.event}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {event.date}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="w-full flex flex-col h-1/2">
                        <div className="w-full flex justify-between">
                            <span className="text-2xl font-medium text-gray-100 text-center">
                                Holidays
                            </span>
                        </div>
                        <div className="flex-grow overflow-y-scroll">
                            {holidays.map((holiday, i) => (
                                <div key={i} className="py-2">
                                    <p className="text-lg font-medium text-gray-100">
                                        {holiday.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {holiday.date}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Holidays;
