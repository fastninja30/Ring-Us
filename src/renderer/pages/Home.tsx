import { Box, Typography, Paper } from '@mui/material';
import { FaBell } from 'react-icons/fa';

export function Home() {
    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#ff7300' }}>
                RingUs
            </Typography>
            <Paper sx={{ p: 3, background: 'rgba(30, 30, 30, 0.7)', textAlign: 'center' }}>
                <FaBell style={{ fontSize: 64, color: '#ff7300', marginBottom: 16 }} />
                <Typography variant="h5" sx={{ mb: 2, color: '#F4F3F2' }}>
                    Welcome to RingUs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Your collaborative alarm solution. Navigate to Alarms to get started.
                </Typography>
            </Paper>
        </Box>
    );
}
