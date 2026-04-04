import {
  Box,
  Drawer,
  SwipeableDrawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
  useMediaQuery,
  useTheme as useMuiTheme,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FaUserFriends } from 'react-icons/fa';
import { FaGear } from 'react-icons/fa6';
import { IoMdAlarm, IoMdLogOut, IoMdMenu } from 'react-icons/io';
import { GrCircleQuestion } from 'react-icons/gr';
import { FiSun, FiMoon } from 'react-icons/fi';
import { auth } from '../firebaseConfig';
import { useFriends } from '../contexts/FriendsContext';
import { useTheme } from '../contexts/ThemeContext';

const drawerWidth = 240;

export function Navbar() {
  const { pendingRequestCount } = useFriends();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800 }}>
          Ring Us
        </Typography>
      </Toolbar>
      <List>
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
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme} sx={{ color: 'inherit' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              {mode === 'dark' ? <FiSun /> : <FiMoon />}
            </ListItemIcon>
            <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
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
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer - 1, backgroundColor: 'primary.main', color: '#fff' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <IoMdMenu />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800 }}>
              Ring Us
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#ff7300', color: '#F4F3F2' },
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#ff7300', color: '#F4F3F2' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
