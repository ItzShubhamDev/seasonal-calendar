import { useState } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";

export default function LoginModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [type, setType] = useState<"login" | "register">("login");

    const login = async () => {
        await signIn("credentials", {
            email,
            password,
        });
    };

    const register = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (res.status === 201) {
                login();
            } else {
                toast.error("An error occurred while registering");
            }
        } catch {
            toast.error("An error occurred while registering");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (type === "login") {
            login();
        } else {
            register();
        }
    };
    return (
        <Modal
            title={type === "login" ? "Login" : "Register"}
            open={open}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                />
                {type === "register" && (
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
                    />
                )}
                <div className="flex justify-between py-2">
                    <button
                        type="button"
                        onClick={() =>
                            setType(type === "login" ? "register" : "login")
                        }
                        className="text-gray-500 hover:underline"
                    >
                        {type === "login"
                            ? "Don't have an account? Register"
                            : "Already have an account? Login"}
                    </button>
                    <button
                        type="submit"
                        className=" hover:border-gray-900 dark:hover:border-gray-100 transition-colors text-gray-900 dark:text-gray-100 border-2 border-gray-600 dark:border-gray-400 rounded-full px-4 py-1"
                    >
                        {type === "login" ? "Login" : "Register"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
