import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Calendar from "./components/Calendar";
import Holidays from "./components/Holidays";
import Weather from "./components/Weather";
import Clock from "./components/Clock";
import LoginModal from "./components/LoginModal";
import { LogIn, X } from "lucide-react";
import UpdateUser from "./components/UpdateUser";

function App() {
    const [date, setDate] = useState(new Date());
    const [alert, setAlert] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState({
        city: "",
        region: "",
        country: "",
        latitude: 0,
        longitude: 0,
    });

    useEffect(() => {
        try {
            fetch("/auth/user", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }).then((res) => {
                if (res.status === 401) {
                    setAlert(
                        "You are not logged in. Unauthorized access can cause loss of data."
                    );
                } else if (res.status === 200) {
                    res.json().then((data) => {
                        setUser(data);
                    });
                }
            });
        } catch {
            setAlert(
                "An error occurred while checking your login status. Please try again later."
            );
        }
    }, []);

    return (
        <div className="lg:flex bg-gray-800">
            <Holidays date={date} user={user} />
            <div className="min-h-screen flex flex-col flex-grow p-5 lg:p-0 space-y-5 lg:space-y-0">
                <div className="h-full w-full lg:flex items-center lg:p-5 lg:pl-0 space-y-5 lg:space-y-0 lg:space-x-5 lg:flex-grow">
                    <Weather user={user} />
                    <Clock />
                </div>
                <Calendar date={date} setDate={setDate} />
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
            <UpdateUser user={user} setUser={setUser} />
            <ToastContainer
                pauseOnFocusLoss={false}
                pauseOnHover={false}
                theme="dark"
                toastClassName={"bg-gray-800 text-white"}
            />
        </div>
    );
}

export default App;
