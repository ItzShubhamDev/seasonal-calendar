import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import AddEventModal from "./AddEventModal";
import { toast } from "react-toastify";

type Holiday = {
    date: string;
    name: string;
    types: string[];
};

type Event = {
    date: string;
    event: string;
    _id?: string;
};

const Holidays = ({ date }: { date: Date }) => {
    const [loading, setLoading] = useState(true);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [hidden, setHidden] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [open, setOpen] = useState(false);
    const [add, setAdd] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/holidays?year=${date.getFullYear()}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setLoading(false);
                    return toast.error(data.error);
                }
                const holidays = data.filter(
                    (holiday: Holiday) =>
                        new Date(holiday.date).getMonth() === date.getMonth()
                );
                setHolidays(holidays);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [date]);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem("token");
        fetch("/events", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    const events = JSON.parse(
                        localStorage.getItem("events") || "[]"
                    );
                    setEvents(events);
                    return;
                } else {
                    setEvents(data.events);
                }
                setLoading(false);
            });
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
            const token = localStorage.getItem("token");
            if (token) {
                headers = {
                    Authorization: `${token}`,
                };
            }
            const formData = new FormData();
            formData.append("image", file);
            const res = await fetch("/upload", {
                method: "POST",
                body: formData,
                headers,
            });
            const data = await res.json();
            if (data.error) return toast.error(data.error);

            if (data.authenticated) {
                if (events.length > 0) {
                    return setEvents([...events, data.events]);
                }
                setEvents([data.events]);
            }

            if (!data.authenticated) {
                const events = data.events.map((e: Event) => {
                    e._id = randomId();
                    return e;
                });
                if (events.length > 0) {
                    return setEvents([...events, data.events]);
                }
                setEvents([data.events]);
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
                const res = await fetch(`/events/${id}`, {
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
                        <div className="flex-grow overflow-y-scroll my-2">
                            {events.filter((e) => {
                                const d = new Date(e.date);
                                return (
                                    d.getMonth() === date.getMonth() &&
                                    d.getFullYear() === date.getFullYear()
                                );
                            }).length === 0 && (
                                <p className="text-gray-100 text-center">
                                    No events for this month
                                </p>
                            )}
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
                                            {event.date.includes("T")
                                                ? event.date.split("T")[0]
                                                : event.date}
                                        </p>
                                    </div>
                                ))}
                        </div>
                        <button
                            className="hover:border-gray-100 transition-colors text-gray-100 border-2 border-gray-400 rounded-full px-4 py-1"
                            onClick={() => setOpen(true)}
                        >
                            View All Events
                        </button>
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
                            <thead className="sticky top-0 bg-gray-700">
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
                    className="w-full hover:border-gray-100 transition-colors text-gray-100 border-2 border-gray-400 rounded-full px-4 py-1"
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
};

export default Holidays;
