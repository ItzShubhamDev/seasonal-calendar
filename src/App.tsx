import { useState } from "react";
import Calendar from "./components/Calendar";
import Holidays from "./components/Holidays";
import Weather from "./components/Weather";
import Clock from "./components/Clock";

function App() {
    const [date, setDate] = useState(new Date());

    return (
        <div className="flex bg-gray-800">
            <div className="w-64 h-screen">
                <div className="flex items-center justify-center h-full text-white p-4">
                    <Holidays date={date} />
                </div>
            </div>
            <div className="min-h-screen flex flex-col flex-grow">
                <div className="h-full w-full flex items-center py-5 pr-5 space-x-5 flex-grow">
                    <Weather />
                    <Clock />
                </div>
                <Calendar date={date} setDate={setDate} />
            </div>
        </div>
    );
}

export default App;
