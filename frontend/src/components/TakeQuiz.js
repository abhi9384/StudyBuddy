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
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { motion, AnimatePresence } from 'framer-motion';

function TakeQuiz() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

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
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setFeedback(null);
    setIsCorrect(null);
    
    if (!topic) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/quiz/${topic}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Error loading questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    setLoading(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const response = await fetch('http://localhost:8000/api/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          expected_answer: currentQuestion.answer,
          user_answer: userAnswer
        }),
      });

      if (!response.ok) throw new Error('Failed to check answer');
      const data = await response.json();
      setFeedback(data.feedback);
      setIsCorrect(data.is_correct);
    } catch (error) {
      console.error('Error checking answer:', error);
      toast.error('Error checking answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      setIsCorrect(null);
    } else {
      toast.success('You have completed all questions!');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

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
        Take a Quiz
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
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : currentQuestion ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {currentQuestion.question}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Your Answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  sx={{ my: 2 }}
                  disabled={feedback !== null}
                />
                {!feedback ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box sx={{ mt: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {isCorrect ? (
                          <CheckCircleIcon color="success" fontSize="large" />
                        ) : (
                          <CancelIcon color="error" fontSize="large" />
                        )}
                        <Typography variant="h6" color={isCorrect ? 'success.main' : 'error.main'}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </Typography>
                      </Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Expected Answer:
                        </Typography>
                        <Typography>{currentQuestion.answer}</Typography>
                      </Alert>
                      <Alert severity={isCorrect ? 'success' : 'warning'}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Feedback:
                        </Typography>
                        <Typography>{feedback}</Typography>
                      </Alert>
                      {currentQuestionIndex < questions.length - 1 && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNextQuestion}
                          sx={{ mt: 3 }}
                        >
                          Next Question
                        </Button>
                      )}
                    </Box>
                  </motion.div>
                )}
              </Box>
            </motion.div>
          </AnimatePresence>
        ) : selectedTopic && (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No questions available for this topic
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default TakeQuiz;
