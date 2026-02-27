import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

export function Clock() {
    const [time, setTime] = useState(new Date());
    const [is24Hour, setIs24Hour] = useState(() => {
        const saved = localStorage.getItem('settings-is24Hour');
        return saved === 'true';
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'settings-is24Hour') {
                setIs24Hour(event.newValue === 'true');
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(timer);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
            <Typography variant="h1">
                {time.toLocaleTimeString('en-US', { hour12: !is24Hour, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
            <Typography variant="h5" color="text.secondary" >
                {time.toLocaleDateString()}
            </Typography>
            
        </Box>
    );
}