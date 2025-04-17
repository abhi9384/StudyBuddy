import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Upload from './components/Upload';
import ViewQA from './components/ViewQA';
import Login from './components/Login';
import TakeQuiz from './components/TakeQuiz';
import TakeExam from './components/TakeExam';
import YoutubeVideos from './components/YoutubeVideos';
import AnswerQuestion from './components/AnswerQuestion';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF', // Modern purple
    },
    secondary: {
      main: '#2EC4B6', // Trendy teal
    },
    background: {
      default: '#F7F7F9',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Upload />} />
              <Route path="/view-qa" element={<ViewQA />} />
              <Route path="/login" element={<Login />} />
              <Route path="/take-quiz" element={<TakeQuiz />} />
              <Route path="/take-exam" element={<TakeExam />} />
              <Route path="/youtube-videos" element={<YoutubeVideos />} />
              <Route path="/answer-question" element={<AnswerQuestion />} />
            </Routes>
          </div>
        </Router>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
