import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { toast } from 'react-toastify';

function AnswerQuestion() {
  const [studyText, setStudyText] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetAnswer = async () => {
    if (!studyText.trim()) {
      toast.error('Please enter your study material');
      return;
    }

    if (!question.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', studyText);
      formData.append('question', question);

      const response = await fetch('http://localhost:8000/api/answer-question', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      toast.error('Error getting answer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#6C63FF', fontWeight: 'bold' }}>
        Answer my Question
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          Paste your study material and ask a question about it.
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

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="contained"
          onClick={handleGetAnswer}
          disabled={loading}
        >
          {loading ? 'Getting Answer...' : 'Answer'}
        </Button>
      </Paper>

      {answer && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#6C63FF' }}>
            Answer:
          </Typography>
          
          <Box sx={{ whiteSpace: 'pre-wrap' }}>
            <Typography variant="body1">
              {answer}
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default AnswerQuestion;
