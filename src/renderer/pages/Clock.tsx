import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';

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
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 'calc(100vh - 100px)',
            p: { xs: 2, sm: 3 }
        }}>
            <Paper sx={{ p: 4, background: 'rgba(30, 30, 30, 0.7)', textAlign: 'center', width: '100%', maxWidth: 400 }}>
                <Typography variant="h2" sx={{ fontWeight: 300, color: '#F4F3F2', fontSize: { xs: '3rem', sm: '4rem' } }}>
                    {time.toLocaleTimeString('en-US', { hour12: !is24Hour, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    {time.toLocaleDateString()}
                </Typography>
            </Paper>
        </Box>
    );
}
