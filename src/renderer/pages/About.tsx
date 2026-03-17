import { Box, Typography, Paper } from '@mui/material';

export function About() {
    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#ff7300' }}>
                About RingUs
            </Typography>
            <Paper sx={{ p: 3, background: 'rgba(30, 30, 30, 0.7)' }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#F4F3F2' }}>
                    Our vision is to make time management into a shared, collaborative activity.
                    This application is mainly an alarm.
                    However, by having the ability to share alarms, this application aims to help groups (whether they are students, remote teams, or families) to stay perfectly in sync.
                    We aim to eliminate the struggles of manual coordination, creating a world where shared accountability is built into every tick of the clock, ensuring that when it's time to act, everyone is ready to move together.
                </Typography>
            </Paper>
        </Box>
    );
}
