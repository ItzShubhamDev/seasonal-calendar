import { useEffect, useState } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { fetch } from "../functions";
import { Settings } from "lucide-react";

type City = {
    name: string;
    latitude: string;
    longitude: string;
    country: string;
};

type User = {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
};

export default function UpdateUser({
    user,
    setUser,
}: {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}) {
    const [internalUser, setInternalUser] = useState(user);
    const [spinning, setSpinning] = useState(false);
    const [open, setOpen] = useState(false);
    const [city, setCity] = useState<City>();
    const [cityName, setCityName] = useState("");
    const [region, setRegion] = useState("");
    const [country, setCountry] = useState("");
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        if (!user || user.city === "") return;
        setCountry(user.country || "");
        setRegion(user.region || "");
        setCityName(user.city || "");
    }, [user]);

    useEffect(() => {
        const getCountries = async () => {
            const res = await fetch("/cities");
            if (res.status === 200) {
                const data = await res.json();
                setCountries(data.data);
            }
        };
        getCountries();
    }, []);

    useEffect(() => {
        const getRegions = async () => {
            if (country === "") return;
            const res = await fetch(`/cities?country=${country}`);
            if (res.status === 200) {
                const data = await res.json();
                setRegions(data.data);
                if (!data.data.includes(region)) setRegion(data.data[0]);
            }
        };
        getRegions();
    }, [country, region]);

    useEffect(() => {
        const getCities = async () => {
            if (country === "" || region === "") return;
            const res = await fetch(
                `/cities?country=${country}&region=${region}`
            );
            if (res.status === 200) {
                const data = (await res.json()) as { data: City[] };
                setCities(data.data);
                if (!data.data.find((city) => city.name === cityName))
                    setCityName(data.data[0].name);
            }
        };
        getCities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [country, region]);

    useEffect(() => {
        if (cityName === "" || cities.length === 0) return;
        setCity(cities.find((city) => city.name === cityName));
    }, [cityName, cities]);

    useEffect(() => {
        if (!city) return;
        setInternalUser((user) => ({
            ...user,
            city: city?.name || "",
            region,
            country,
            latitude: Number(city?.latitude),
            longitude: Number(city?.longitude),
        }));
    }, [country, region, city]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUser(internalUser);
        try {
            const res = await fetch("/auth/user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(internalUser),
            });
            if (res.status === 200) {
                setOpen(false);
                setSpinning(false);
                const { data } = await res.json();
                localStorage.setItem("token", data.token);
                toast.success("User updated successfully");
            } else {
                toast.error("An error occurred while updating the user");
            }
        } catch {
            toast.error("An error occurred while updating the user");
        }
    };

    const handleClick = () => {
        setSpinning(true);
        setOpen(true);
    };
    return (
        <>
            <Modal
                title="Update User"
                open={open}
                onClose={() => {
                    setOpen(false);
                    setSpinning(false);
                }}
            >
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <select
                            className="w-1/3 p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                            value={internalUser.country}
                            onChange={(e) => setCountry(e.target.value)}
                        >
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        <select
                            className="w-1/3 p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                            value={internalUser.region}
                            onChange={(e) => setRegion(e.target.value)}
                        >
                            {regions.map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>
                        <select
                            className="w-1/3 p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                            value={internalUser.city}
                            onChange={(e) =>
                                setCityName(e.target.value as string)
                            }
                        >
                            {cities.map((city) => (
                                <option key={city.name} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="number"
                        className="w-full p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                        placeholder="Latitude"
                        step={0.0001}
                        value={internalUser.latitude}
                        onChange={(e) =>
                            setInternalUser((user) => ({
                                ...user,
                                latitude: Number(e.target.value),
                            }))
                        }
                    />
                    <input
                        type="number"
                        className="w-full p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                        placeholder="Longitude"
                        step={0.0001}
                        value={internalUser.longitude}
                        onChange={(e) =>
                            setInternalUser((user) => ({
                                ...user,
                                longitude: Number(e.target.value),
                            }))
                        }
                    />
                    <button
                        type="submit"
                        className="w-full  hover:border-gray-900 dark:hover:border-gray-100 transition-colors text-gray-900 dark:text-gray-100 border-2 border-gray-600 dark:border-gray-400 rounded-full px-4 py-1"
                    >
                        Update User
                    </button>
                </form>
            </Modal>
            <button
                className={`fixed z-100 bottom-0 right-0 p-3 hover:rotate-90 duration-700 ${
                    spinning ? "!rotate-180" : ""
                }`}
                onClick={handleClick}
            >
                <Settings className="h-8 w-8 text-gray-800 dark:text-white" />
            </button>
        </>
    );
}
