import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper,
  CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaData, setQaData] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles[0].type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }

    if (!file || !topic) {
      toast.error('Please provide both a file and a topic');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('topic', topic);
    formData.append('user_id', user.uid);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setQaData(data.qa_pairs);
      toast.success('File processed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error processing file');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!qaData) return;

    try {
      const response = await fetch('http://localhost:8000/api/save-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          user_id: user.uid,
          qa_pairs: qaData
        }),
      });

      if (!response.ok) throw new Error('Save failed');

      toast.success('Q&A saved successfully!');
      setQaData(null);
      setFile(null);
      setTopic('');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving Q&A');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          color: '#6C63FF',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4
        }}
      >
        Upload Study Material
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          backgroundColor: '#fff',
          borderRadius: 2
        }}
      >
        <Box {...getRootProps()} 
          sx={{
            border: '2px dashed #6C63FF',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(108, 99, 255, 0.04)'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: '#6C63FF', mb: 2 }} />
          {isDragActive ? (
            <Typography>Drop the PDF here</Typography>
          ) : (
            <Typography>Drag and drop a PDF here, or click to select</Typography>
          )}
          {file && (
            <Typography sx={{ mt: 2, color: 'success.main' }}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          label="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !file || !topic}
          sx={{ mb: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Process File'}
        </Button>

        {qaData && (
          <Box>
            <Typography variant="h6" gutterBottom>Generated Q&A:</Typography>
            {qaData.map((qa, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Q{index + 1}: {qa.question}
                </Typography>
                <Typography>
                  A: {qa.answer}
                </Typography>
              </Box>
            ))}
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleSave}
            >
              Save Q&A
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Upload;
