import { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';

export function Clock() {
    const [time, setTime] = useState(new Date());
    const [is24Hour, setIs24Hour] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
            <FormControlLabel
                control={<Switch checked={is24Hour} onChange={() => setIs24Hour(!is24Hour)} />}
                label="24-Hour Format"
            />
            <Typography variant="h1">
                {time.toLocaleTimeString('en-US', { hour12: !is24Hour, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
            <Typography variant="h5" color="text.secondary" >
                {time.toLocaleDateString()}
            </Typography>
            
        </Box>
    );
}