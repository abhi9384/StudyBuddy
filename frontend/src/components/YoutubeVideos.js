import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Card, CardContent, CardMedia, Link } from '@mui/material';
import { toast } from 'react-toastify';

function YoutubeVideos() {
  const [studyText, setStudyText] = useState('');
  const [topics, setTopics] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetVideos = async () => {
    if (!studyText.trim()) {
      toast.error('Please enter your study material');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', studyText);

      const response = await fetch('http://localhost:8000/api/get-youtube-videos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get videos');
      }

      const data = await response.json();
      setTopics(data.topics);
      setVideos(data.videos);
    } catch (error) {
      toast.error('Error getting videos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#6C63FF', fontWeight: 'bold' }}>
        Get YouTube Videos
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          Paste your study material below, and we'll find relevant educational videos for you.
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          placeholder="Paste your study material here..."
          value={studyText}
          onChange={(e) => setStudyText(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="contained"
          onClick={handleGetVideos}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Find Videos'}
        </Button>
      </Paper>

      {topics.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#6C63FF' }}>
            Generated Topics:
          </Typography>
          {topics.map((topic, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              {index + 1}. {topic}
            </Typography>
          ))}
        </Box>
      )}

      {videos.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#6C63FF' }}>
            Relevant Videos:
          </Typography>
          
          {videos.map((video, index) => (
            <Card key={index} sx={{ display: 'flex', mb: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 160, height: 90 }}
                image={video.thumbnail}
                alt={video.title}
              />
              <CardContent sx={{ flex: 1 }}>
                <Link 
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ color: '#6C63FF' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {video.title}
                  </Typography>
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {video.description.length > 150 
                    ? `${video.description.substring(0, 150)}...` 
                    : video.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default YoutubeVideos;
