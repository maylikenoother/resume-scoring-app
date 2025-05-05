'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  CreditCard as CreditCardIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import Navbar from '@/app/components/layout/Navbar';

const ArchitectureDiagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
    <rect x="100" y="50" width="600" height="350" fill="#f0f0f0" stroke="#333" strokeWidth="2" />
    
    <text x="400" y="80" textAnchor="middle" fontWeight="bold" fontSize="20">CV Review App Architecture</text>
    
    {/* User */}
    <circle cx="150" cy="225" r="40" fill="#4CAF50" />
    <text x="150" y="225" textAnchor="middle" fill="white" fontSize="16">User</text>

    {/* Frontend */}
    <rect x="250" y="125" width="150" height="80" fill="#2196F3" rx="10" />
    <text x="325" y="165" textAnchor="middle" fill="white" fontSize="16">Next.js Frontend</text>
    
    {/* API Proxy */}
    <rect x="250" y="225" width="150" height="60" fill="#03A9F4" rx="10" />
    <text x="325" y="255" textAnchor="middle" fill="white" fontSize="16">API Proxy</text>
    
    {/* Backend */}
    <rect x="450" y="175" width="150" height="80" fill="#FF9800" rx="10" />
    <text x="525" y="215" textAnchor="middle" fill="white" fontSize="16">FastAPI Backend</text>
    
    {/* Database */}
    <rect x="450" y="295" width="150" height="60" fill="#795548" rx="10" />
    <text x="525" y="330" textAnchor="middle" fill="white" fontSize="16">SQLite/PostgreSQL</text>

    {/* AI Service */}
    <rect x="570" y="100" width="180" height="60" fill="#9C27B0" rx="10" opacity="0.9" />
    <text x="660" y="135" textAnchor="middle" fill="white" fontSize="16">Google Gemini AI</text>
    
    {/* Arrows */}
    <path d="M190 225 L250 165" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M190 225 L250 245" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M325 205 L325 225" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M400 255 L450 215" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M525 255 L525 295" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M600 175 L600 130" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
      </marker>
    </defs>
  </svg>
);

export default function DocumentationPage() {
  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          CV Review App Documentation
        </Typography>

        {/* Architecture Overview */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            System Architecture
          </Typography>
          <Box sx={{ width: '100%', overflow: 'visible' }}>
            <ArchitectureDiagram />
          </Box>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            The application follows a modern cloud-native microservices architecture, 
            combining Next.js frontend, FastAPI backend, and multiple integrated services.
            The system uses a credit-based model for AI-powered CV reviews with secure JWT authentication.
          </Typography>
        </Paper>

        {/* Key Features - All expanded */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudUploadIcon sx={{ mr: 2 }} />
                <Typography variant="h6">CV Upload & Analysis</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Users can upload CVs in various formats (PDF, DOCX, TXT) for AI-powered analysis.
                The system leverages Google's Gemini AI to provide professional, detailed feedback on structure, content, and improvements.
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Supported Formats" 
                    secondary="PDF, DOCX, TXT, up to 5MB" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="AI Analysis" 
                    secondary="Comprehensive CV review using Google Gemini AI language model" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Review Workflow" 
                    secondary="Background processing with status tracking and notifications" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Authentication & Security</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Robust JWT-based authentication system with secure password hashing, ensuring protected 
                access to application features and user-specific resources.
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Authentication Method" 
                    secondary="JWT tokens with bcrypt password hashing" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Security Features" 
                    secondary="Role-based access control, resource ownership validation" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Cookie-Based Sessions" 
                    secondary="Secure token storage with middleware protection" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PsychologyIcon sx={{ mr: 2 }} />
                <Typography variant="h6">AI-Powered Insights</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Advanced AI analysis provides professional, actionable feedback 
                on CV structure, content, and potential improvements using the 
                Google Gemini API.
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="AI Model" 
                    secondary="Google Gemini 1.5 Flash Large Language Model" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Feedback Areas" 
                    secondary="Structure, Skills, Experience, Formatting, Improvements" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Scoring System" 
                    secondary="Numerical feedback with specific recommendations" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCardIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Credit System</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                A flexible credit-based system controls access to CV review services, 
                allowing users to purchase and manage their review credits.
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Initial Credits" 
                    secondary="5 free credits on registration" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Credit Packages" 
                    secondary="Basic (5 for $4.99), Standard (15 for $9.99), Premium (50 for $24.99)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Transaction Tracking" 
                    secondary="Complete history of purchases and usage" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 2 }} />
                <Typography variant="h6">File Storage</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Secure file storage system for CV documents with ownership validation and efficient access control.
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Database Storage" 
                    secondary="CV files stored directly in the database for security and simplified architecture" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Ownership Validation" 
                    secondary="Secure access with user-based permissions" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="File Conversion" 
                    secondary="Automatic text extraction from multiple document formats" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Notification System</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Real-time notification system keeps users informed about CV review status and account activity.
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Notification Types" 
                    secondary="Review status updates, credit transactions, system messages" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Read Status" 
                    secondary="Tracking of read/unread notifications with management options" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Integrated Display" 
                    secondary="Notifications badge in navigation with detailed listing page" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Technical Details Section */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Technical Implementation Details
          </Typography>
          <Typography variant="body1" paragraph>
            The application is built using a modern, scalable technology stack:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><SecurityIcon /></ListItemIcon>
              <ListItemText 
                primary="Backend Framework" 
                secondary="FastAPI v0.115.0 (Python) with Async SQLAlchemy and Alembic migrations" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CloudUploadIcon /></ListItemIcon>
              <ListItemText 
                primary="Frontend Framework" 
                secondary="Next.js v15.3.1 with TypeScript and Material UI v5.17.1" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><PsychologyIcon /></ListItemIcon>
              <ListItemText 
                primary="AI Integration" 
                secondary="Google Generative AI (Gemini 1.5 Flash model)" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CreditCardIcon /></ListItemIcon>
              <ListItemText 
                primary="Authentication" 
                secondary="JWT-based token system with secure cookie storage" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><StorageIcon /></ListItemIcon>
              <ListItemText 
                primary="Database" 
                secondary="SQLite for development, PostgreSQL for production" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><NotificationsIcon /></ListItemIcon>
              <ListItemText 
                primary="Background Processing" 
                secondary="Asynchronous task handling for CV analysis" 
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
}