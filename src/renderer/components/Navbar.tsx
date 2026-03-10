import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { FaHome } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { IoMdAlarm, IoMdLogOut } from "react-icons/io";
import { auth } from "../firebaseConfig";
import { GrCircleQuestion } from "react-icons/gr";


const drawerWidth = 240;

export function Navbar() {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/');
    };
    
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#ff7300', color: '#F4F3F2' },
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    RingUs
                </Typography>
            </Toolbar>
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={NavLink} to="/" sx={{ color: 'inherit' }}>
                            <ListItemIcon sx={{ color: 'inherit' }}><FaHome /></ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={NavLink} to="/book-list" sx={{ color: 'inherit' }}>
                            <ListItemText inset primary="Book list" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={NavLink} to="/about" sx={{ color: 'inherit' }}>
                            <ListItemIcon sx={{ color: 'inherit' }}><GrCircleQuestion /></ListItemIcon>
                            <ListItemText primary="About" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={NavLink} to="/clock" sx={{ color: 'inherit' }}>
                            <ListItemIcon sx={{ color: 'inherit' }}><FaRegClock /></ListItemIcon>
                            <ListItemText primary="Clock" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={NavLink} to="/settings" sx={{ color: 'inherit' }}>
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
        </Drawer>
    );
}