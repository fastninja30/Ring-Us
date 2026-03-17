import {
    AppBar,
    Badge,
    Drawer,
    IconButton,
    List,
    ListItem,
    Toolbar,
    Typography,
<<<<<<< HEAD
    useMediaQuery,
    useTheme
=======
    IconButton,
    useMediaQuery,
    useTheme,
>>>>>>> origin/mobile-styling
} from "@mui/material";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { FaHome } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
<<<<<<< HEAD
import { IoMdAlarm, IoMdLogOut, IoMdPeople } from "react-icons/io";
import { auth } from "../firebaseConfig";
import { useFriends } from "../contexts/FriendsContext";
=======
import { IoMdAlarm, IoMdLogOut, IoMdMenu } from "react-icons/io";
import { auth } from "../firebaseConfig";
import { GrCircleQuestion } from "react-icons/gr";

const drawerWidth = 240;
>>>>>>> origin/mobile-styling

export function Navbar() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { pendingRequestCount } = useFriends();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleDrawer = (open: boolean) => {
        setDrawerOpen(open);
    };

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/');
    };

<<<<<<< HEAD
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
=======
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{ overflow: 'auto' }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    RingUs
                </Typography>
            </Toolbar>
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={NavLink} to="/home" onClick={() => isMobile && setMobileOpen(false)} sx={{ color: 'inherit' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}><FaHome /></ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={NavLink} to="/alarm" onClick={() => isMobile && setMobileOpen(false)} sx={{ color: 'inherit' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}><IoMdAlarm /></ListItemIcon>
                        <ListItemText primary="Alarms" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={NavLink} to="/book-list" onClick={() => isMobile && setMobileOpen(false)} sx={{ color: 'inherit' }}>
                        <ListItemText inset primary="Book list" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={NavLink} to="/about" onClick={() => isMobile && setMobileOpen(false)} sx={{ color: 'inherit' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}><GrCircleQuestion /></ListItemIcon>
                        <ListItemText primary="About" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={NavLink} to="/clock" onClick={() => isMobile && setMobileOpen(false)} sx={{ color: 'inherit' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}><FaRegClock /></ListItemIcon>
                        <ListItemText primary="Clock" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={NavLink} to="/settings" onClick={() => isMobile && setMobileOpen(false)} sx={{ color: 'inherit' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}><FaGear /></ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleSignOut} sx={{ color: 'inherit' }}>
                        <ListItemIcon sx={{ color: 'inherit' }}><IoMdLogOut /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
>>>>>>> origin/mobile-styling
    );

    return (
        <>
            {isMobile && (
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1300 }}
                >
                    <IoMdMenu />
                </IconButton>
            )}
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { 
                        width: drawerWidth, 
                        boxSizing: 'border-box', 
                        backgroundColor: '#ff7300', 
                        color: '#F4F3F2',
                        position: isMobile ? 'relative' : 'fixed',
                        height: isMobile ? '100%' : '100vh',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}
