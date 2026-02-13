import { 
    AppBar, 
    Drawer,
    IconButton,
    List,
    ListItem,
    Toolbar, 
    Typography, 
    useMediaQuery, 
    useTheme 
} from "@mui/material";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { GiAlarmClock } from "react-icons/gi";

export function Navbar() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const toggleDrawer = (open: boolean) => {
        setDrawerOpen(open);
    };

    const menuItems = (
        <>
            <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Typography>Home</Typography>
                </IconButton>
            </NavLink>
            <NavLink to="/book-list" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Typography>Book list</Typography>
                </IconButton>
            </NavLink>
            <NavLink to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Typography>About</Typography>
                </IconButton>
            </NavLink>
        </>
    );

    return(
        <>
            <AppBar position="fixed" sx={{backgroundColor: '#ff7300'}}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1}}>
                        RingUs
                    </Typography>
                    {isMobile ? (
                        <>
                        <IconButton color="inherit" onClick={() => toggleDrawer(true)}>
                            <GiAlarmClock />
                        </IconButton>
                        <Drawer anchor="right" open={drawerOpen} onClick={() => toggleDrawer(false)}>
                            <List>
                                <ListItem>{menuItems}</ListItem>
                            </List>
                        </Drawer>
                        </>
                    ): menuItems}
                </Toolbar>
            </AppBar>
        </>
    );
}