import { useEffect, useState } from "react";

const Clock = () => {
    const [time, setTime] = useState(new Date());
    const [hours, setHours] = useState(time.getHours());
    const [src, setSrc] = useState("Zzz.png");

    useEffect(() => {
        const interval = setInterval(() => {
            const time = new Date();
            setTime(time);
            setHours(time.getHours());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (hours >= 6 && hours < 8) {
            setSrc("Yawning%20Face.png");
        } else if (hours >= 8 && hours < 12) {
            setSrc("Smiling%20Face.png");
        } else if (hours >= 12 && hours < 18) {
            setSrc("Grinning%20Face.png");
        } else if (hours >= 18 && hours < 22) {
            setSrc("Relieved%20Face.png");
        } else if (hours >= 22 && hours < 24) {
            setSrc("Yawning%20Face.png");
        } else {
            setSrc("Zzz.png");
        }
    }, [hours]);

    return (
        <div className="hidden h-full xl:flex flex-col items-center justify-center space-y-2 w-fit bg-gray-300 dark:bg-gray-700 shadow-lg rounded-lg overflow-hidden p-4 px-8">
            <div className="text-gray-600 dark:text-white font-mono  text-2xl 2xl:text-5xl">
                {time.toTimeString().split(" ")[0]}
            </div>
            <img
                src={`https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/${src}`}
                alt="Emoji"
                width="50"
                height="50"
            />
        </div>
    );
};

export default Clock;
