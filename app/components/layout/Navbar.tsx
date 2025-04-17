'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const pages = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Upload CV', href: '/upload' },
  { name: 'Credits', href: '/credits' },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [credits, setCredits] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoggedIn(true);
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setIsLoggedIn(false);
    }
    setLoading(status === 'loading');
  }, [status]);

  const fetchUserData = async () => {
    try {
      if (!session?.accessToken) return;
      
      try {
        const balanceResponse = await fetch('/api/py/credits/balance', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          },
          cache: 'no-store'
        });
        
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setCredits(balanceData.balance);
        } else {
          console.error('Failed to fetch credit balance:', balanceResponse.status);
        }
      } catch (error) {
        console.error('Error fetching credit balance:', error);
      }
      
      try {
        const notifResponse = await fetch('/api/py/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          },
          cache: 'no-store'
        });
        
        if (notifResponse.ok) {
          const count = await notifResponse.json();
          setUnreadCount(count);
        } else {
          console.error('Failed to fetch notification count:', notifResponse.status);
        }
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

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const navigateTo = (href: string) => {
    router.push(href);
    handleCloseNavMenu();
  };

  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  if (loading) {
    return null;
  }

  return (
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
            {isLoggedIn && (
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
            {isLoggedIn && pages.map((page) => (
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
            {isLoggedIn ? (
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
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {session?.user?.name?.charAt(0) || 'U'}
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
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
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
  );
}