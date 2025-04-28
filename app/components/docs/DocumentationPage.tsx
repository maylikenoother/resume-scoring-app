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
} from '@mui/icons-material';
import Navbar from '@/app/components/layout/Navbar';

// Mermaid diagram as SVG
const ArchitectureDiagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
    <rect x="50" y="50" width="500" height="300" fill="#f0f0f0" stroke="#333" strokeWidth="2" />
    
    <text x="300" y="80" textAnchor="middle" fontWeight="bold">CV Review App Architecture</text>
    
    {/* User */}
    <circle cx="100" cy="200" r="40" fill="#4CAF50" />
    <text x="100" y="200" textAnchor="middle" fill="white">User</text>
    
    {/* Authentication */}
    <rect x="200" y="100" width="200" height="80" fill="#2196F3" rx="10" />
    <text x="300" y="140" textAnchor="middle" fill="white">Clerk Authentication</text>
    
    {/* Backend */}
    <rect x="200" y="250" width="200" height="80" fill="#FF9800" rx="10" />
    <text x="300" y="290" textAnchor="middle" fill="white">FastAPI Backend</text>
    
    {/* Arrows */}
    <path d="M140 200 L200 140" fill="none" stroke="#333" markerEnd="url(#arrowhead)" />
    <path d="M300 180 L300 250" fill="none" stroke="#333" markerEnd="url(#arrowhead)" />
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
      </marker>
    </defs>
  </svg>
);

export default function DocumentationPage() {
  const [expanded, setExpanded] = useState<string | false>(false);

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
                  The system leverages Hugging Face's AI to provide professional, detailed feedback.
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
                      secondary="Comprehensive CV review using advanced language models" 
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
                  Robust authentication powered by Clerk, ensuring secure user management 
                  and protected access to application features.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Authentication Provider" 
                      secondary="Clerk Authentication" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Security Features" 
                      secondary="JWT-based token authentication, role-based access control" 
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
                  on CV structure, content, and potential improvements.
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
                      secondary="Structure, Skills, Experience, Formatting" 
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
                      secondary="Basic (5), Standard (15), Premium (50)" 
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
                secondary="FastAPI (Python) with Async SQLAlchemy" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CloudUploadIcon /></ListItemIcon>
              <ListItemText 
                primary="Frontend Framework" 
                secondary="Next.js 14 with TypeScript" 
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
                secondary="Clerk Authentication with JWT" 
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
}