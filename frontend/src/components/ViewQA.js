import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Paper,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

function ViewQA() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTopics();
    }
  }, [user]);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/topics/${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data.topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Error loading topics');
    }
  };

  const handleTopicChange = async (event) => {
    const topic = event.target.value;
    setSelectedTopic(topic);
    if (!topic) {
      setQaData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/qa/${topic}/${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Failed to fetch Q&A');
      const data = await response.json();
      setQaData(data.qa_pairs);
    } catch (error) {
      console.error('Error fetching Q&A:', error);
      toast.error('Error loading Q&A');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#6C63FF' }}>
          Please log in to view your Q&A content.
        </Typography>
      </Container>
    );
  }

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
        Questions and Answers
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          backgroundColor: '#fff',
          borderRadius: 2
        }}
      >
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Select Topic</InputLabel>
          <Select
            value={selectedTopic}
            label="Select Topic"
            onChange={handleTopicChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {topics.map((topic) => (
              <MenuItem key={topic} value={topic}>
                {topic}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {qaData.map((qa, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#6C63FF',
                    fontWeight: 'bold',
                    mb: 1
                  }}
                >
                  Q{index + 1}: {qa.question}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    pl: 3,
                    borderLeft: '3px solid #2EC4B6',
                    ml: 1
                  }}
                >
                  {qa.answer}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ViewQA;
