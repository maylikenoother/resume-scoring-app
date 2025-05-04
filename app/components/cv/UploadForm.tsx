'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AlertTitle,
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon 
} from '@mui/icons-material';

interface UploadFormProps {
  credits: number;
}

export default function UploadForm({ credits }: UploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum file size is 5MB.');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (credits < 1) {
      setError('You do not have enough credits to submit a CV for review.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/py/reviews/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error uploading CV');
      }

      const data = await response.json();
      
      router.push(`/reviews/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Upload Your CV for Review
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Get professional AI-powered feedback on your CV. Each review costs 1 credit.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Best Results Tips</AlertTitle>
          <Typography variant="body2">
            For the most accurate analysis:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="PDF and TXT files work best" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Ensure your CV is text-based, not just images" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <InfoIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Word documents are automatically converted to text" />
            </ListItem>
          </List>
        </Alert>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography>Supported formats: PDF, DOC, DOCX, TXT</Typography>
        <Chip 
          label={`Available Credits: ${credits}`} 
          color={credits > 0 ? "primary" : "error"} 
          variant="outlined"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          p: 5,
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          transition: 'all 0.2s ease',
          mb: 3,
          cursor: 'pointer',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Drag and drop your CV file here, or click to browse
        </Typography>
        
        <Typography variant="body2" color="textSecondary">
          Maximum file size: 5MB
        </Typography>

        {file && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={() => router.push('/dashboard')}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || loading || credits < 1}
          startIcon={loading ? <CircularProgress size={24} /> : null}
        >
          {loading ? 'Uploading...' : 'Upload & Analyze'}
        </Button>
      </Box>

      {credits < 1 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          You need at least 1 credit to submit a CV for review. 
          <Button 
            size="small" 
            sx={{ ml: 1 }}
            onClick={() => router.push('/credits')}
          >
            Purchase Credits
          </Button>
        </Alert>
      )}
    </Box>
  );
}