'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  AppBar,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  CreditCard as CreditCardIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Mock data
  const creditBalance = 3;
  const notifications = [
    { id: 1, message: 'Your CV review is complete', isRead: false },
    { id: 2, message: 'Your CV has been submitted for review', isRead: true }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={tabValue === 0} onClick={() => setTabValue(0)}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={tabValue === 1} onClick={() => setTabValue(1)}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText primary="Upload CV" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={tabValue === 2} onClick={() => setTabValue(2)}>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Review History" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CV Review App
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={`Credits: ${creditBalance}`} 
              color={creditBalance > 0 ? "primary" : "error"}
              sx={{ mr: 2 }}
            />
            <IconButton color="inherit">
              <Badge badgeContent={notifications.filter(n => !n.isRead).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          sx={{ 
            bgcolor: 'background.paper',
            color: 'text.primary',
            display: { xs: 'none', sm: 'flex' }
          }}
        >
          <Tab label="Dashboard" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="Upload CV" icon={<UploadIcon />} iconPosition="start" />
          <Tab label="Review History" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, mt: 12 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - 250px)` },
          mt: { xs: 8, sm: 12 }
        }}
      >
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Credit Balance
                  </Typography>
                  <Typography variant="h3" color={creditBalance > 0 ? "primary" : "error"}>
                    {creditBalance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Each CV review costs 1 credit
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Purchase Credits</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Notifications
                  </Typography>
                  <List>
                    {notifications.map((notification) => (
                      <React.Fragment key={notification.id}>
                        <ListItem>
                          <ListItemIcon>
                            <Badge color="error" variant={notification.isRead ? "dot" : "standard"}>
                              <NotificationsIcon />
                            </Badge>
                          </ListItemIcon>
                          <ListItemText 
                            primary={notification.message} 
                            secondary={notification.isRead ? "Read" : "Unread"} 
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<UploadIcon />}
                      onClick={() => setTabValue(1)}
                    >
                      Upload New CV
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<HistoryIcon />}
                      onClick={() => setTabValue(2)}
                    >
                      View Review History
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h4" gutterBottom>
            Upload CV for Review
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" paragraph>
              Upload your CV to get professional AI-powered feedback. Each review costs 1 credit.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Current credit balance: <Chip label={creditBalance} color={creditBalance > 0 ? "primary" : "error"} size="small" />
            </Typography>
            <Box sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 5, 
              textAlign: 'center',
              mb: 3
            }}>
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop your CV file here, or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: PDF, DOCX, TXT (Max size: 5MB)
              </Typography>
              <Button 
                variant="contained" 
                component="label" 
                sx={{ mt: 2 }}
                disabled={creditBalance < 1}
              >
                Browse Files
                <input type="file" hidden />
              </Button>
            </Box>
            {creditBalance < 1 && (
              <Typography variant="body2" color="error">
                You don't have enough credits. Please purchase more credits to submit a CV for review.
              </Typography>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h4" gutterBottom>
            Review History
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resume_John_Smith.pdf
                  </Typography>
                  <Chip label="Completed" color="success" size="small" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Submitted: April 10, 2025
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Review Feedback:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Your CV has a clear structure, but consider using a more modern template. 
                    Improve spacing between sections for better readability and use consistent 
                    formatting for dates and headings.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Your experience is well-described but could be more achievement-focused. 
                    Consider adding quantifiable results to demonstrate impact and tailor your 
                    CV more specifically to the target role/industry.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Download Full Review</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    CV_Technical_2025.pdf
                  </Typography>
                  <Chip label="Processing" color="warning" size="small" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Submitted: April 14, 2025
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Your CV is currently being processed. You will be notified when the review is complete.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
}
