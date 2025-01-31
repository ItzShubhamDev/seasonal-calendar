import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
        >
            {theme === "dark" ? <Sun /> : <Moon />}
        </button>
    );
};

export default ThemeToggle;
