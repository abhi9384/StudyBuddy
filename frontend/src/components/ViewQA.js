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

function ViewQA() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/topics');
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
      const response = await fetch(`http://localhost:8000/api/qa/${topic}`);
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
              <Box 
                key={index} 
                sx={{ 
                  mb: 4,
                  p: 3,
                  backgroundColor: 'rgba(108, 99, 255, 0.04)',
                  borderRadius: 2
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#6C63FF',
                    mb: 1
                  }}
                >
                  Q{index + 1}: {qa.question}
                </Typography>
                <Typography sx={{ color: '#333' }}>
                  A: {qa.answer}
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
