import React, { useState, useEffect } from 'react';

const CometPlot = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch('https://api.example.com/image-endpoint');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setImageUrl(data.imageUrl); // Adjust based on API response structure
                setLoading(false);
            } catch (err) {
                setError('Failed to load image');
                setLoading(false);
            }
        };

        fetchImage();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <img src={imageUrl} alt="Fetched from API" style={{ maxWidth: '100%' }} />
        </div>
    );
};

export default CometPlot;