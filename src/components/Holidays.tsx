import { useEffect, useState } from "react";

type Holiday = {
    date: string;
    name: string;
    types: string[];
};

const Holidays = ({ date }: { date: Date }) => {
    const [loading, setLoading] = useState(true);
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    useEffect(() => {
        setLoading(true);
        setHolidays([]);
        fetch(`/holidays?year=${date.getFullYear()}`)
            .then((res) => res.json())
            .then((data) => {
                const holidays = data.filter(
                    (holiday: Holiday) =>
                        new Date(holiday.date).getMonth() === date.getMonth()
                );
                setHolidays(holidays);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [date]);

    return (
        <div className="w-full h-full flex flex-col">
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-medium text-gray-100 text-center">
                        Holidays
                    </h1>
                    <div className="flex-grow overflow-y-scroll">
                        {holidays.map((holiday, i) => (
                            <div key={i} className="p-4">
                                <p className="text-lg font-medium text-gray-100">
                                    {holiday.name}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {holiday.date}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Holidays;
