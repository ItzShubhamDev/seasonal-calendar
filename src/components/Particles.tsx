import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

type ParticlesProps = {
    snowflakeCount: number;
    speed: [number, number];
    wind: [number, number];
    radius: [number, number];
    opacity: [number, number];
};

const Particles = ({ season }: { season: string }) => {
    const [props, setProps] = useState<ParticlesProps>({
        snowflakeCount: 100,
        speed: [0.5, 1.5],
        wind: [-0.5, 2],
        radius: [20, 25],
        opacity: [0.5, 0.7],
    });
    const [images, setImages] = useState<CanvasImageSource[]>([]);

    const icons = {
        spring: "/icons/spring.png",
        summer: "/icons/summer.png",
        monsoon: "/icons/monsoon.png",
        autumn: "/icons/autumn.png",
        winter: "/icons/winter.png",
    };

    useEffect(() => {
        const img = document.createElement("img");

        switch (season) {
            case "spring":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 20) + 20,
                }));
                img.src = icons.spring;
                break;
            case "summer":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 10) + 10,
                }));
                img.src = icons.summer;
                break;
            case "monsoon":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 30) + 30,
                }));
                img.src = icons.monsoon;
                break;
            case "autumn":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 20) + 20,
                }));
                img.src = icons.autumn;
                break;
            case "winter":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 30) + 30,
                }));
                img.src = icons.winter;
        }
        img.onload = () => {
            setImages([img]);
        };
    }, [season]);

    return <Snowfall {...props} images={images} />;
};

export default Particles;
