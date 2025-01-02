import { useState } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";

type Event = {
    date: string;
    event: string;
    _id?: string;
};

export default function AddEventModal({
    open,
    onClose,
    setEvents,
}: {
    open: boolean;
    onClose: () => void;
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}) {
    const [event, setEvent] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetch("/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ event, date }),
            });
            if (res.status === 201) {
                onClose();
                const { event } = await res.json();
                setEvents((events) => [...events, event]);
            } else if (res.status === 401) {
                const events = JSON.parse(
                    localStorage.getItem("events") || "[]"
                );
                const _id = Math.random().toString(36).substr(2, 9);
                const newEvent = { event, date, _id };
                localStorage.setItem(
                    "events",
                    JSON.stringify([...events, newEvent])
                );
                setEvents((events) => [...events, newEvent]);
            } else {
                toast.error("An error occurred while adding the event");
            }
        } catch {
            toast.error("An error occurred while adding the event");
        }
    };
    return (
        <Modal title="Add Event" open={open} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="text"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    placeholder="Event"
                    className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Date"
                    className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                />
                <button
                    type="submit"
                    className="hover:border-gray-100 transition-colors text-gray-100 border-2 border-gray-400 rounded-full px-4 py-1"
                >
                    Add Event
                </button>
            </form>
        </Modal>
    );
}
