export type Ip = {
    status: string;
    countryCode: string;
    regionName: string;
    city: string;
    lat: number;
    lon: number;
    region: string;
    message?: string;
};

export type Holiday = {
    date: string;
    name: string;
    types: string[];
};

export type Weather = {
    daily_units: {
        time: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
    };
    current_units: {
        temperature_2m: string;
        apparent_temperature: string;
        weather_code: string;
        relative_humidity_2m: string;
        wind_speed_10m: string;
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
    };
    current: {
        temperature_2m: number;
        apparent_temperature: number;
        weather_code: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
    };
    error?: boolean;
};

export type Event = {
    date: string | null;
    event: string;
}