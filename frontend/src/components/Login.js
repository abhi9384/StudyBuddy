import React from 'react';
import { 
  Container, 
  Button, 
  Typography, 
  Paper,
  Box
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Error signing in with Google');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: '#6C63FF',
            fontWeight: 'bold',
            mb: 4
          }}
        >
          Welcome to StudyBuddy
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ mb: 4, color: '#666' }}
        >
          Sign in to upload study materials and access Q&A
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            size="large"
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 8,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
