import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

import spring from "../images/icons/spring.png";
import summer from "../images/icons/summer.png";
import monsoon from "../images/icons/monsoon.png";
import autumn from "../images/icons/autumn.png";
import winter from "../images/icons/winter.png";

type ParticlesProps = {
    snowflakeCount: number;
    speed: [number, number];
    wind: [number, number];
    radius: [number, number];
    opacity: [number, number];
};

const Particles = ({ season }: { season: string }) => {
    const [props, setProps] = useState<ParticlesProps>({
        snowflakeCount: 150,
        speed: [0.5, 1.5],
        wind: [-0.5, 2],
        radius: [20, 25],
        opacity: [0.5, 0.7],
    });
    const [images, setImages] = useState<CanvasImageSource[]>([]);

    useEffect(() => {
        const img = document.createElement("img");

        switch (season) {
            case "spring":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 20) + 20,
                }));
                img.src = spring;
                break;
            case "summer":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 10) + 10,
                }));
                img.src = summer;
                break;
            case "monsoon":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 30) + 30,
                }));
                img.src = monsoon;
                break;
            case "autumn":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 20) + 20,
                }));
                img.src = autumn;
                break;
            case "winter":
                setProps((prev) => ({
                    ...prev,
                    snowflakeCount: Math.floor(Math.random() * 30) + 30,
                }));
                img.src = winter;
        }
        img.onload = () => {
            setImages([img]);
        };
    }, [season]);

    return <Snowfall {...props} images={images} />;
};

export default Particles;
