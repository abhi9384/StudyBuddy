import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 2 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: '#6C63FF',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          StudyBuddy
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {user && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#6C63FF',
                mr: 2 
              }}
            >
              Hello, {user.email}
            </Typography>
          )}
          <Button 
            color="primary" 
            onClick={() => navigate('/')}
          >
            Upload
          </Button>
          <Button 
            color="primary" 
            onClick={() => navigate('/view-qa')}
          >
            View Q&A
          </Button>
          <Button 
            color="primary" 
            onClick={() => navigate('/take-quiz')}
          >
            Take a Quiz
          </Button>
          {user ? (
            <Button 
              color="secondary" 
              variant="contained"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          ) : (
            <Button 
              color="secondary" 
              variant="contained"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
