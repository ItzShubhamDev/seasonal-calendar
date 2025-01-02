import { useState } from "react";
import Calendar from "./components/Calendar";
import Holidays from "./components/Holidays";
import Weather from "./components/Weather";
import Clock from "./components/Clock";

function App() {
    const [date, setDate] = useState(new Date());

    return (
        <div className="lg:flex bg-gray-800">
            <Holidays date={date} />
            <div className="min-h-screen flex flex-col flex-grow p-5 lg:p-0 space-y-5 lg:space-y-0">
                <div className="h-full w-full lg:flex items-center lg:p-5 lg:pl-0 space-y-5 lg:space-y-0 lg:space-x-5 lg:flex-grow">
                    <Weather />
                    <Clock />
                </div>
                <Calendar date={date} setDate={setDate} />
            </div>
        </div>
    );
}

export default App;
