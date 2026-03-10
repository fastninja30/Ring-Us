import {
    AppBar,
    Badge,
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
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { FaHome } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { IoMdAlarm, IoMdLogOut, IoMdPeople } from "react-icons/io";
import { auth } from "../firebaseConfig";
import { useFriends } from "../contexts/FriendsContext";

export function Navbar() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { pendingRequestCount } = useFriends();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const toggleDrawer = (open: boolean) => {
        setDrawerOpen(open);
    };

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/');
    };

    const menuItems = (
        <>
            <NavLink to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Typography><FaHome /></Typography>
                </IconButton>
            </NavLink>
            <NavLink to="/alarm" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Typography><IoMdAlarm /></Typography>
                </IconButton>
            </NavLink>
            <NavLink to="/friends" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Badge badgeContent={pendingRequestCount} color="error">
                        <Typography><IoMdPeople /></Typography>
                    </Badge>
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
            <NavLink to="/clock" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Typography><FaRegClock/></Typography>
                </IconButton>
            </NavLink>
            <NavLink to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                <IconButton>
                    <Typography><FaGear /></Typography>
                </IconButton>
            </NavLink>
            <IconButton onClick={handleSignOut} sx={{ color: 'inherit' }}>
                <Typography><IoMdLogOut /></Typography>
            </IconButton>
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
                            <PiDotsThreeOutlineVerticalFill />
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