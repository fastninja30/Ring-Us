import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FaHome, FaRegClock, FaUserFriends } from 'react-icons/fa';
import { FaGear } from 'react-icons/fa6';
import { IoMdAlarm, IoMdLogOut, IoMdMenu } from 'react-icons/io';
import { GrCircleQuestion } from 'react-icons/gr';
import { auth } from '../firebaseConfig';
import { useFriends } from '../contexts/FriendsContext';

const drawerWidth = 240;

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pendingRequestCount } = useFriends();
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
          <ListItemButton
            component={NavLink}
            to="/home"
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <FaHome />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/alarm"
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <IoMdAlarm />
            </ListItemIcon>
            <ListItemText primary="Alarms" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/clock"
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <FaRegClock />
            </ListItemIcon>
            <ListItemText primary="Clock" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/friends"
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <FaUserFriends />
            </ListItemIcon>
            <ListItemText primary="Friends" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/settings"
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <FaGear />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/about"
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <GrCircleQuestion />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleSignOut} sx={{ color: 'inherit' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <IoMdLogOut />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          disableRipple
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 12,
            left: mobileOpen ? drawerWidth - 28 : 12,
            zIndex: 1300,
            width: 40,
            height: 40,
            p: 1,
            border: 'none',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            transition: theme.transitions.create('left', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shortest,
            }),
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:focus': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: 'none',
            },
          }}
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
