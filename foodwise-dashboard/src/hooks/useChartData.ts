import { useState, useEffect } from 'react';

interface ChartData {
    time?: string;
    sales?: number;
    stock?: number;
    usage?: number;
    name?: string;
    value?: number;
    color?: string;
}

export const useChartData = () => {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Here you would typically fetch data from your API
                // For now, we'll use mock data
                const mockData: ChartData[] = [
                    { time: '8AM', sales: 30 },
                    { time: '10AM', sales: 45 },
                    { time: '12PM', sales: 90 },
                    { time: '2PM', sales: 65 },
                    { time: '4PM', sales: 40 },
                    { time: '6PM', sales: 85 },
                    { time: '8PM', sales: 70 },
                ];

                setData(mockData);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};

export default useChartData;