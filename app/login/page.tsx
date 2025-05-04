'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
 Box,
 Container,
 Paper,
 Typography,
 TextField,
 Button,
 Alert,
 CircularProgress
} from '@mui/material';
import { apiClient } from '@/app/utils/api-client';
import { setAuthToken, setUserData, isAuthenticated } from '@/app/utils/auth';

export default function LoginPage() {
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [formData, setFormData] = useState({
   email: '',
   password: '',
 });

 useEffect(() => {
   if (isAuthenticated()) {
     router.push('/dashboard');
   }
 }, [router]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
   setFormData((prev) => ({
     ...prev,
     [name]: value,
   }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError('');
   setLoading(true);

   if (!formData.email.trim() || !formData.password.trim()) {
     setError('Email and password are required');
     setLoading(false);
     return;
   }

   try {
     const data = await apiClient.login(formData.email, formData.password);

     setAuthToken(data.access_token);
     
     setUserData({
       id: data.user_id,
       email: data.email,
       full_name: data.full_name,
     });

     window.location.href = '/dashboard';
   } catch (err: any) {
     console.error('Login error:', err);

     if (err.status) {
       console.error(`Status code: ${err.status}`);
     }
     
     const errorMessage = err.message || 
       'Login failed. Please check your credentials and try again.';
     
     setError(errorMessage);
   } finally {
     setLoading(false);
   }
 };

 return (
   <Container maxWidth="sm">
     <Box sx={{ mt: 8, mb: 4 }}>
       <Typography variant="h4" component="h1" align="center" gutterBottom>
         CV Review App
       </Typography>
       <Typography variant="h5" align="center" color="text.secondary" gutterBottom>
         Sign In
       </Typography>

       <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4 }}>
         {error && (
           <Alert severity="error" sx={{ mb: 3 }}>
             {error}
           </Alert>
         )}

         <form onSubmit={handleSubmit}>
           <TextField
             label="Email"
             name="email"
             type="email"
             fullWidth
             margin="normal"
             variant="outlined"
             value={formData.email}
             onChange={handleChange}
             required
             autoFocus
             error={!!error}
           />

           <TextField
             label="Password"
             name="password"
             type="password"
             fullWidth
             margin="normal"
             variant="outlined"
             value={formData.password}
             onChange={handleChange}
             required
             error={!!error}
           />

           <Button
             type="submit"
             fullWidth
             variant="contained"
             color="primary"
             size="large"
             sx={{ mt: 3, mb: 2 }}
             disabled={loading}
           >
             {loading ? <CircularProgress size={24} /> : 'Sign In'}
           </Button>
         </form>

         <Box sx={{ mt: 2, textAlign: 'center' }}>
           <Typography variant="body2">
             Don't have an account?{' '}
             <Link href="/register" style={{ color: 'primary.main', textDecoration: 'none' }}>
               Register
             </Link>
           </Typography>
         </Box>
       </Paper>
     </Box>
   </Container>
 );
}