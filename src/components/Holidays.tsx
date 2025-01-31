import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./Modal";
import AddEventModal from "./AddEventModal";
import { toast } from "react-toastify";
import ThemeToggle from "./ToggleTheme";

export type Holiday = {
    date: string;
    name: string;
    types: string[];
};

type Event = {
    date: string;
    event: string;
    _id?: string;
};

type User = {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
};

const Holidays = React.memo(
    ({
        date,
        user,
        holidays,
        setHolidays,
    }: {
        date: Date;
        user: User | null;
        holidays: Holiday[];
        setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
    }) => {
        const [loading, setLoading] = useState(true);
        const [hidden, setHidden] = useState(true);
        const [events, setEvents] = useState<Event[]>([]);
        const [open, setOpen] = useState(false);
        const [add, setAdd] = useState(false);
        const ref = useRef<HTMLInputElement>(null);

        useEffect(() => {
            const getHolidays = async () => {
                setLoading(true);
                try {
                    const url =
                        `/api/holidays?year=${date.getFullYear()}` +
                        (user ? `&country=${user.country}` : "");
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.error) {
                        setLoading(false);
                        return toast.error(data.error);
                    }
                    const holidays = data.filter(
                        (holiday: Holiday) =>
                            new Date(holiday.date).getMonth() ===
                            date.getMonth()
                    );
                    setHolidays(holidays);
                    setLoading(false);
                } catch {
                    setLoading(false);
                }
            };
            getHolidays();
        }, [date, user]);

        useEffect(() => {
            const getEvents = async () => {
                setLoading(true);
                try {
                    const res = await fetch("/api/events");
                    const data = await res.json();
                    if (data.error) {
                        const events = JSON.parse(
                            localStorage.getItem("events") || "[]"
                        );
                        setEvents(events);
                        return;
                    } else {
                        setEvents(data);
                    }
                    setLoading(false);
                } catch {
                    setLoading(false);
                }
            };
            getEvents();
        }, []);

        const upload = () => {
            if (ref.current) {
                ref.current.click();
            }
        };

        const randomId = () => {
            return Math.random().toString(36).substr(2, 9);
        };

        const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            const validTypes = ["image/png", "image/jpeg", "image/webp"];
            if (file) {
                if (!validTypes.includes(file.type))
                    return toast.error("Invalid file type");
                let headers = {} as Record<string, string>;
                const formData = new FormData();
                formData.append("image", file);
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (data.error) return toast.error(data.error);

                if (data.authenticated) {
                    if (events.length > 0) {
                        return setEvents([...events, data]);
                    }
                    setEvents([data]);
                }

                if (!data.authenticated) {
                    const events = data.map((e: Event) => {
                        e._id = randomId();
                        return e;
                    });
                    if (events.length > 0) {
                        return setEvents([...events, data]);
                    }
                    setEvents([data]);
                    const oldEvents = JSON.parse(
                        localStorage.getItem("events") || "[]"
                    );
                    localStorage.setItem(
                        "events",
                        JSON.stringify([...oldEvents, ...events])
                    );
                }
            }
        };

        const deleteEvent = async (id: string) => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetch(`/api/events/${id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = await res.json();
                    if (data.error) return toast.error(data.error);
                    const newEvents = events.filter((e) => e._id !== id);
                    setEvents(newEvents);
                } catch {
                    const newEvents = events.filter((e) => e._id !== id);
                    setEvents(newEvents);
                    localStorage.setItem("events", JSON.stringify(newEvents));
                }
            }
        };

        const monthlyEvents = events.filter((e) => {
            const d = new Date(e.date);
            return (
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear()
            );
        });

        return (
            <div
                className={`flex max-w-64 w-full h-screen flex-col max-lg:fixed z-20 max-lg:bg-gray-100 dark:max-lg:bg-gray-900 p-4 ease-in-out duration-300 lg:translate-x-0 ${
                    hidden ? "-translate-x-64" : "translate-x-0"
                }`}
            >
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-medium text-gray-800 dark:text-gray-100 text-center">
                        Calendar
                    </span>
                    <ThemeToggle />
                </div>
                <button
                    onClick={() => setHidden(!hidden)}
                    className="lg:hidden absolute top-1/2 right-0 translate-x-full py-2 bg-gray-100 dark:bg-gray-900 rounded-tr-full rounded-br-full text-gray-800 dark:text-white"
                >
                    {hidden ? <ChevronRight /> : <ChevronLeft />}
                </button>
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-300 dark:border-gray-700"></div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full w-full mt-2">
                        <div className="w-full flex flex-col h-1/2">
                            <div className="w-full flex justify-between">
                                <span className="text-2xl font-medium text-gray-900 dark:text-gray-100 text-center">
                                    Events
                                </span>
                                <button
                                    onClick={upload}
                                    className="hover:border-gray-900 dark:hover:border-gray-100 transition-colors dark:text-gray-100 text-gray-900 border-2 border-gray-600 dark:border-gray-400 rounded-full px-4 py-1"
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
                            <div className="flex-grow overflow-y-scroll my-2">
                                {monthlyEvents.length === 0 ? (
                                    <p className="text-gray-900 dark:text-gray-100 text-center">
                                        No events for this month
                                    </p>
                                ) : (
                                    monthlyEvents.map((event, i) => (
                                        <div key={i} className="py-2">
                                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {event.event}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {event.date.includes("T")
                                                    ? event.date.split("T")[0]
                                                    : event.date}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button
                                className=" hover:border-gray-900 dark:hover:border-gray-100 transition-colors text-gray-900 dark:text-gray-100 border-2 border-gray-600 dark:border-gray-400 rounded-full px-4 py-1"
                                onClick={() => setOpen(true)}
                            >
                                View All Events
                            </button>
                        </div>
                        <div className="w-full flex flex-col h-1/2 mt-2">
                            <div className="w-full flex justify-between">
                                <span className="text-2xl font-medium text-gray-900 dark:text-gray-100 text-center">
                                    Holidays
                                </span>
                            </div>
                            <div className="flex-grow overflow-y-scroll mb-8">
                                {holidays.map((holiday, i) => (
                                    <div key={i} className="py-2">
                                        <p className="text-lg font-mediumtext-gray-900 dark:text-gray-100">
                                            {holiday.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {holiday.date}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <Modal
                    title="All Events"
                    open={open}
                    onClose={() => setOpen(false)}
                >
                    <div className="w-full items-center overflow-y-scroll h-96">
                        {events.length === 0 ? (
                            <p className="text-gray-100 text-center">
                                No events to display
                            </p>
                        ) : (
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-300 dark:bg-gray-700">
                                    <tr>
                                        <th>Date</th>
                                        <th>Event</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event, i) => (
                                        <tr key={i}>
                                            <td className="text-center">
                                                {event.date.includes("T")
                                                    ? event.date.split("T")[0]
                                                    : event.date}
                                            </td>
                                            <td className="text-center">
                                                {event.event}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="text-red-500"
                                                    onClick={() =>
                                                        deleteEvent(event._id!)
                                                    }
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <button
                        className="w-full  hover:border-gray-900 dark:hover:border-gray-100 transition-colors text-gray-900 dark:text-gray-100 border-2 border-gray-600 dark:border-gray-400 rounded-full px-4 py-1"
                        onClick={() => setAdd(true)}
                    >
                        Add Event
                    </button>
                </Modal>
                <AddEventModal
                    open={add}
                    onClose={() => setAdd(false)}
                    setEvents={setEvents}
                />
            </div>
        );
    }
);

export default Holidays;
