'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import Navbar from './components/layout/Navbar';

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return (
    <Box>
      <Navbar />
      
      {/* Hero Section */}
      <Paper 
        sx={{
          position: 'relative',
          backgroundColor: 'primary.dark',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Improve Your CV with AI
            </Typography>
            <Typography variant="h5" paragraph>
              Get professional feedback on your CV in minutes with our AI-powered review service.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                sx={{ mr: 2, bgcolor: 'white', color: 'primary.dark' }}
                onClick={() => router.push(isSignedIn ? '/upload' : '/register')}
                startIcon={<CloudUploadIcon />}
              >
                {isSignedIn ? 'Upload CV' : 'Get Started'}
              </Button>
              
              {!isSignedIn && (
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ color: 'white', borderColor: 'white' }}
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          How It Works
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SpeedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Fast Analysis
                </Typography>
                <Typography variant="body1">
                  Upload your CV and receive AI-generated feedback in minutes, not days.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <PsychologyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Professional Insights
                </Typography>
                <Typography variant="body1">
                  Get detailed feedback on structure, content, skills, and specific improvements.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Secure & Private
                </Typography>
                <Typography variant="body1">
                  Your CV and personal information are kept secure and never shared with third parties.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'primary.light', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" color="white" gutterBottom>
                Ready to improve your job prospects?
              </Typography>
              <Typography variant="body1" color="white">
                Upload your CV today and get professional feedback to stand out from the competition.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                sx={{ bgcolor: 'white', color: 'primary.main' }}
                onClick={() => router.push(isSignedIn ? '/upload' : '/register')}
              >
                {isSignedIn ? 'Upload CV' : 'Sign Up Now'}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} CV Review App. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}