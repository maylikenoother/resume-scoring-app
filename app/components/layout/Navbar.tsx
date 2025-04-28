'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { apiClient } from '@/app/utils/api-client';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import UserProfileModal from '../user/UserProfileModal';

const pages = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Upload CV', href: '/upload' },
  { name: 'Credits', href: '/credits' },
];

export default function Navbar() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [credits, setCredits] = useState(0);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn]);

  const fetchUserData = async () => {
    try {
      try {
        const balanceData = await apiClient.get('credits/balance');
        setCredits(balanceData.balance);
      } catch (error) {
        console.error('Error fetching credit balance:', error);
      }
      
      // Fetch notifications
      try {
        const count = await apiClient.get('notifications/unread-count');
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const navigateTo = (href: string) => {
    router.push(href);
    handleCloseNavMenu();
  };

  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  const handleOpenProfileModal = () => {
    setProfileModalOpen(true);
    handleCloseUserMenu();
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              CV REVIEW APP
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              {isSignedIn && (
                <>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                  >
                   <MenuIcon />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorElNav}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    open={Boolean(anchorElNav)}
                    onClose={handleCloseNavMenu}
                    sx={{
                      display: { xs: 'block', md: 'none' },
                    }}
                  >
                    {pages.map((page) => (
                      <MenuItem key={page.name} onClick={() => navigateTo(page.href)}>
                        <Typography textAlign="center">{page.name}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>

            <Typography
              variant="h5"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              CV REVIEW
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {isSignedIn && pages.map((page) => (
                <Button
                  key={page.name}
                  onClick={() => navigateTo(page.href)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              {isSignedIn ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                      Credits: {credits}
                    </Typography>
                    
                    <Tooltip title="Notifications">
                      <IconButton onClick={handleNotificationsClick} sx={{ mr: 1 }} color="inherit">
                        <Badge badgeContent={unreadCount} color="error">
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Open settings">
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar 
                          src={user?.imageUrl}
                          alt={user?.fullName || ''}
                          sx={{ bgcolor: 'secondary.main' }}
                        >
                          {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem onClick={handleOpenProfileModal}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    
                    <Divider />
                    
                    <MenuItem onClick={handleCloseUserMenu}>
                      <SignOutButton>
                        <button style={{ all: 'unset', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                            <span style={{ width: '100%', textAlign: 'center' }}>Logout</span>
                          </Box>
                        </button>
                      </SignOutButton>
                    </MenuItem>

                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} href="/login" sx={{ mr: 1 }}>
                    Login
                  </Button>
                  <Button color="inherit" variant="outlined" component={Link} href="/register">
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <UserProfileModal 
        open={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
    </>
  );
}