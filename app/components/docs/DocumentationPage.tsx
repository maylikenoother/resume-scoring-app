'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  CreditCard as CreditCardIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import Navbar from '@/app/components/layout/Navbar';

// Architecture diagram as SVG
const ArchitectureDiagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 450">
    <rect x="50" y="50" width="600" height="350" fill="#f0f0f0" stroke="#333" strokeWidth="2" />
    
    <text x="350" y="80" textAnchor="middle" fontWeight="bold">CV Review App Architecture</text>
    
    {/* User */}
    <circle cx="100" cy="200" r="40" fill="#4CAF50" />
    <text x="100" y="200" textAnchor="middle" fill="white">User</text>

    {/* Frontend */}
    <rect x="200" y="100" width="150" height="80" fill="#2196F3" rx="10" />
    <text x="275" y="140" textAnchor="middle" fill="white">Next.js Frontend</text>
    
    {/* API Proxy */}
    <rect x="200" y="200" width="150" height="60" fill="#03A9F4" rx="10" />
    <text x="275" y="230" textAnchor="middle" fill="white">API Proxy</text>
    
    {/* Backend */}
    <rect x="400" y="150" width="150" height="80" fill="#FF9800" rx="10" />
    <text x="475" y="190" textAnchor="middle" fill="white">FastAPI Backend</text>
    
    {/* Database */}
    <rect x="400" y="270" width="150" height="60" fill="#795548" rx="10" />
    <text x="475" y="305" textAnchor="middle" fill="white">SQLite/PostgreSQL</text>

    {/* AI Service */}
    <rect x="600" y="100" width="150" height="60" fill="#9C27B0" rx="10" opacity="0.9" />
    <text x="675" y="135" textAnchor="middle" fill="white">Hugging Face AI</text>
    
    {/* Cloud Storage */}
    <rect x="600" y="200" width="150" height="60" fill="#607D8B" rx="10" opacity="0.9" />
    <text x="675" y="235" textAnchor="middle" fill="white">Cloudinary Storage</text>
    
    {/* Arrows */}
    <path d="M140 200 L200 140" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M140 200 L200 220" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M275 180 L275 200" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M350 230 L400 190" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M475 230 L475 270" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M550 175 L600 130" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M550 200 L600 220" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
      </marker>
    </defs>
  </svg>
);

export default function DocumentationPage() {
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

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
          <Box sx={{ width: '100%', overflow: 'auto' }}>
            <ArchitectureDiagram />
          </Box>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            The application follows a modern cloud-native microservices architecture, 
            combining Next.js frontend, FastAPI backend, and multiple integrated services.
            The system uses a credit-based model for AI-powered CV reviews with secure JWT authentication.
          </Typography>
        </Paper>

        {/* Key Features Accordion */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Accordion 
              expanded={expanded === 'panel1'} 
              onChange={handleAccordionChange('panel1')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <CloudUploadIcon sx={{ mr: 2 }} />
                <Typography>CV Upload & Analysis</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Users can upload CVs in various formats (PDF, DOCX, TXT) for AI-powered analysis.
                  The system leverages Hugging Face's AI to provide professional, detailed feedback on structure, content, and improvements.
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
                      secondary="Comprehensive CV review using Google Flan-T5 large language model" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Review Workflow" 
                      secondary="Background processing with status tracking and notifications" 
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion 
              expanded={expanded === 'panel2'} 
              onChange={handleAccordionChange('panel2')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <SecurityIcon sx={{ mr: 2 }} />
                <Typography>Authentication & Security</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion 
              expanded={expanded === 'panel3'} 
              onChange={handleAccordionChange('panel3')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3-content"
                id="panel3-header"
              >
                <PsychologyIcon sx={{ mr: 2 }} />
                <Typography>AI-Powered Insights</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Advanced AI analysis provides professional, actionable feedback 
                  on CV structure, content, and potential improvements using the 
                  Hugging Face Inference API.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="AI Model" 
                      secondary="Google Flan-T5 Large Language Model" 
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
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion 
              expanded={expanded === 'panel4'} 
              onChange={handleAccordionChange('panel4')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel4-content"
                id="panel4-header"
              >
                <CreditCardIcon sx={{ mr: 2 }} />
                <Typography>Credit System</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion 
              expanded={expanded === 'panel5'} 
              onChange={handleAccordionChange('panel5')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel5-content"
                id="panel5-header"
              >
                <StorageIcon sx={{ mr: 2 }} />
                <Typography>Cloud Storage</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Secure cloud storage for uploaded CV documents using Cloudinary, 
                  with flexible file management and access control.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Storage Provider" 
                      secondary="Cloudinary cloud service" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="File Management" 
                      secondary="Automatic upload, secure access with ownership validation" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Content Delivery" 
                      secondary="Fast CDN-based file access" 
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion 
              expanded={expanded === 'panel6'} 
              onChange={handleAccordionChange('panel6')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel6-content"
                id="panel6-header"
              >
                <NotificationsIcon sx={{ mr: 2 }} />
                <Typography>Notification System</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
              </AccordionDetails>
            </Accordion>
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
                secondary="FastAPI (Python) with Async SQLAlchemy and Alembic migrations" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CloudUploadIcon /></ListItemIcon>
              <ListItemText 
                primary="Frontend Framework" 
                secondary="Next.js 15 with TypeScript and Material UI components" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><PsychologyIcon /></ListItemIcon>
              <ListItemText 
                primary="AI Integration" 
                secondary="Hugging Face Inference API with Google Flan-T5" 
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