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
import { useState, useRef, useEffect } from 'react';
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

  // Drag state for mobile swipe
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [drawerTranslateX, setDrawerTranslateX] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Touch/Mouse event handlers for drag functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;

    // Only allow dragging from left edge or when drawer is open
    if (startX > 50 && !mobileOpen) return;

    setCurrentX(currentX);
    // Clamp the translation between -drawerWidth and 0
    const newTranslateX = Math.max(-drawerWidth, Math.min(0, deltaX));
    setDrawerTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isMobile) return;
    setIsDragging(false);

    const deltaX = currentX - startX;
    const threshold = drawerWidth * 0.3; // 30% of drawer width

    if (Math.abs(deltaX) > threshold) {
      // If dragged more than threshold, open/close drawer
      if (deltaX > 0 && !mobileOpen) {
        setMobileOpen(true);
      } else if (deltaX < 0 && mobileOpen) {
        setMobileOpen(false);
      }
    }

    setDrawerTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const currentX = e.clientX;
      const deltaX = currentX - startX;

      // Only allow dragging from left edge or when drawer is open
      if (startX > 50 && !mobileOpen) return;

      setCurrentX(currentX);
      // Clamp the translation between -drawerWidth and 0
      const newTranslateX = Math.max(-drawerWidth, Math.min(0, deltaX));
      setDrawerTranslateX(newTranslateX);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const deltaX = currentX - startX;
      const threshold = drawerWidth * 0.3;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && !mobileOpen) {
          setMobileOpen(true);
        } else if (deltaX < 0 && mobileOpen) {
          setMobileOpen(false);
        }
      }

      setDrawerTranslateX(0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Update drawer translate when mobileOpen changes
  useEffect(() => {
    if (!isMobile) return;
    setDrawerTranslateX(0);
  }, [mobileOpen, isMobile]);

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
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1200,
            backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
            transition: isDragging ? 'none' : 'background-color 0.3s ease',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        />
      )}
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
        ref={drawerRef}
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
            transform: isMobile ? `translateX(${drawerTranslateX}px)` : 'none',
            transition: isDragging ? 'none' : theme.transitions.create('transform', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shortest,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
