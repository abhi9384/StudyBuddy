import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { toast } from 'react-toastify';

function TakeExam() {
  const [studyText, setStudyText] = useState('');
  const [examQuestions, setExamQuestions] = useState('');
  const [answers, setAnswers] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateExam = async () => {
    if (!studyText.trim()) {
      toast.error('Please enter your study material');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', studyText);

      const response = await fetch('http://localhost:8000/api/generate-exam', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate exam');
      }

      const data = await response.json();
      setExamQuestions(data.questions);
      setAnswers(data.answers);
      setShowAnswers(false); // Reset show answers when new exam is generated
    } catch (error) {
      toast.error('Error generating exam: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#6C63FF', fontWeight: 'bold' }}>
        Take an Exam
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          Paste your study material below, and we'll generate a comprehensive exam paper for you.
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
          onClick={handleGenerateExam}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Generating...' : 'Generate Sample Question Paper'}
        </Button>
      </Paper>

      {examQuestions && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#6C63FF' }}>
            Exam Questions
          </Typography>
          
          <Box sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {examQuestions}
          </Box>

          {answers && (
            <Button
              variant="contained"
              onClick={() => setShowAnswers(!showAnswers)}
              color="secondary"
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </Button>
          )}

          {showAnswers && answers && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2EC4B6' }}>
                Answers
              </Typography>
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {answers}
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}

export default TakeExam;
