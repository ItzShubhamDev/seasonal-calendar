import { X } from "lucide-react";

export default function Modal({
    title,
    children,
    open,
    onClose,
}: {
    title: string;
    children: React.ReactNode;
    open: boolean;
    onClose: () => void;
}) {
    return (
        <div
            className={`fixed inset-0 w-screen h-screen backdrop-blur flex justify-center items-center duration-500 ease-in-out
        ${open ? "translate-y-0" : "-translate-y-full"}`}
        >
            <div className="flex flex-col max-w-2xl w-full bg-gray-800 text-white p-2 rounded-xl">
                <div className="flex justify-between w-full text-2xl items-center p-2">
                    <h2 className="font-medium text-gray-100">
                        {title}
                    </h2>
                    <button onClick={onClose} className="hover:text-gray-300 transition-colors">
                        <X />
                    </button>
                </div>
                <div className="rounded-lg p-6 shadow-lg w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
