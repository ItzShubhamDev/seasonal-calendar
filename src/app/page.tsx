"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Calendar from "@/components/Calendar";
import Holidays, { Holiday } from "@/components/Holidays";
import Weather from "@/components/Weather";
import Clock from "@/components/Clock";
import LoginModal from "@/components/LoginModal";
import { LogIn, X } from "lucide-react";
import UpdateUser from "@/components/UpdateUser";
import Quote from "@/components/Quote";
import Photo from "@/components/PhotoOfTheDay";

type User = {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
};

function App() {
    const [date, setDate] = useState(new Date());
    const [alert, setAlert] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const ref = useRef<string | null>(null);
    const session = useSession();

    const user = useMemo(() => {
        return session.status === "authenticated"
            ? (session.data.user as User)
            : null;
    }, [session.status, session.data]);

    useEffect(() => {
        if (ref.current === session.status) return;
        ref.current = session.status;
    }, [session]);

    return (
        <div className="lg:flex bg-gray-200 dark:bg-gray-800">
            <Holidays
                date={date}
                user={user}
                holidays={holidays}
                setHolidays={setHolidays}
            />
            <div className="min-h-screen flex flex-col flex-grow p-5 lg:p-0 space-y-5 lg:space-y-0">
                <div className="h-full w-full lg:flex items-center lg:p-5 lg:pl-0 space-y-5 lg:space-y-0 lg:space-x-5 lg:flex-grow">
                    <Weather user={user} />
                    <Clock />
                </div>
                <div className="flex max-xl:flex-col lg:mr-4 xl:mr-0">
                    <Calendar
                        date={date}
                        setDate={setDate}
                        holidays={holidays}
                    />
                    <div className="max-xl:w-full xl:min-w-72 xl:max-w-80 xl:mx-4 max-xl:mt-4 flex flex-col sm:flex-row xl:flex-col sm:space-x-4 xl:space-x-0 max-sm:space-y-6 xl:space-y-6">
                        <Quote />
                        <Photo />
                    </div>
                </div>
            </div>
            <div
                className={`fixed z-100 bottom-0 inset-x-0 p-5 ease-out duration-500 ${
                    alert ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <div className="bg-orange-500 flex p-2 rounded-lg text-white text-center justify-between">
                    <span>{alert}</span>
                    <div className="flex">
                        <button
                            onClick={() => {
                                setAlert(null);
                                setOpen(true);
                            }}
                            className="ml-2"
                        >
                            <LogIn />
                        </button>
                        <button onClick={() => setAlert(null)} className="ml-2">
                            <X />
                        </button>
                    </div>
                </div>
            </div>
            <LoginModal open={open} onClose={() => setOpen(false)} />
            {user && <UpdateUser user={user} />}
        </div>
    );
}

export default App;
