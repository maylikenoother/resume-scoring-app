'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/utils/api-client';
import { useAuth } from '@/app/components/AuthProvider';
import {
  Box, Container, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Button, CircularProgress, Alert, Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';

interface Notification {
  id: number;
  user_id: number;
  review_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationList() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchNotifications();
      }
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('notifications');
      setNotifications(data.notifications || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'An error occurred while loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.put(`notifications/${notificationId}/read`, {});
      setNotifications(notifications.map(notification =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      const data = await apiClient.put('notifications/read-all', {});
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.review_id) {
      router.push(`/reviews/${notification.review_id}`);
    }
  };

  if (isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} unread`} color="primary" size="small" sx={{ ml: 2 }} />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button startIcon={<MarkEmailReadIcon />} onClick={markAllAsRead} disabled={markingAll}>
            {markingAll ? 'Marking...' : 'Mark All as Read'}
          </Button>
        )}
      </Box>

      <Paper>
        {notifications.length > 0 ? (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: notification.is_read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <NotificationsIcon color={notification.is_read ? 'disabled' : 'primary'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={formatDate(notification.created_at)}
                    primaryTypographyProps={{
                      fontWeight: notification.is_read ? 'normal' : 'medium',
                    }}
                  />
                  {!notification.is_read && (
                    <Chip label="New" color="primary" size="small" sx={{ ml: 1 }} />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              You Don&apos;t have any notifications yet. They will appear here when your CV reviews are processed.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}