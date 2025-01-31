import { useEffect, useState } from "react";

type Quote = {
    text: string;
    author: string;
};

const Quote = () => {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getQuote = async () => {
            const r = await fetch("/api/quotes");
            const data = await r.json();
            if (data && data.text) {
                if (data.text.length > 300) {
                    await getQuote();
                } else {
                    setQuote(data);
                    setLoading(false);
                }
            }
        };
        getQuote();
    }, []);
    return (
        <>
            {!loading && (
                <div className="bg-gray-300 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-gray-200">
                    <h2 className="text-2xl font-semibold">Quote</h2>
                    <p>{quote?.text}</p>
                    <p className="text-right">- {quote?.author}</p>
                </div>
            )}
        </>
    );
};

export default Quote;
