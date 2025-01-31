import { useEffect, useState } from "react";
import Modal from "./Modal";

type PhotoData = {
    copyright: string;
    date: string;
    explanation: string;
    hdurl: string;
    media_type: string;
    service_version: string;
    title: string;
    url: string;
};

const Photo = () => {
    const [photo, setPhoto] = useState<PhotoData | null>(null);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        const getPhoto = async () => {
            const r = await fetch("/apod");
            const data = await r.json();
            setPhoto(data);
        };
        getPhoto();
    }, []);
    return (
        <div className="bg-gray-300 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-gray-200">
            <h2 className="text-2xl font-semibold">
                Astronomy <span className="text-sm">Photo of The Day</span>
            </h2>
            <div className="relative">
                <img
                    src={photo?.url}
                    alt={photo?.title}
                    className="mt-4 rounded-lg aspect-video hover:cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setModal(true)}
                />
                <span className="text-xs absolute bottom-0 right-2">
                    Credits: {photo?.copyright}
                </span>
            </div>
            <Modal
                open={modal}
                onClose={() => setModal(false)}
                title={photo?.title || "Astronomy Photo of The Day"}
            >
                <img
                    src={photo?.hdurl}
                    alt={photo?.title}
                    className="w-full aspect-video"
                />
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-semibold mt-2">
                        {photo?.title}{" "}
                        <span className="text-xs">
                            {photo?.copyright && "by " + photo?.copyright}
                        </span>
                    </h2>
                    <span className="text-xs">{photo?.date}</span>
                </div>
                <p className="text-sm mt-2">{photo?.explanation}</p>
            </Modal>
        </div>
    );
};

export default Photo;
