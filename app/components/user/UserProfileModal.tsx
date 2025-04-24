'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Backdrop,
  Fade,
  Stack,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      });
    }
  }, [isLoaded, isSignedIn, user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSuccess(false);
    setError('');
    setSaving(true);
    
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      if (formData.email !== user.primaryEmailAddress?.emailAddress) {
        setError('Email changes require verification. Please use the Clerk verification flow to update your email.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your profile.');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      });
    }
    setSuccess(false);
    setError('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Edit Profile
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {!isLoaded ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : !isSignedIn || !user ? (
            <Alert severity="error">You must be signed in to edit your profile.</Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                {user.imageUrl ? (
                  <Avatar 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    sx={{ width: 100, height: 100 }}
                  />
                ) : (
                  <Avatar 
                    sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 40 }}
                  >
                    {user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || '?'}
                  </Avatar>
                )}
              </Box>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Profile updated successfully!
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  type="email"
                  required
                  disabled
                  helperText="Email changes require verification. Please use the Clerk account settings to update your email."
                />
                
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}