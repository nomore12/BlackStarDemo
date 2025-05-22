// src/App.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import theme from './styles/Theme';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import { PageTransitionProvider } from './contexts/PageTransitionContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />{' '}
      <div
        id="game-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100vh',
        }}
      >
        <div
          style={{
            border: '1px solid #626060',
            backgroundColor: '#282d29',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '800px',
            height: '600px',
            position: 'relative',
          }}
        >
          <Router>
            <PageTransitionProvider>
              <AppRoutes />
            </PageTransitionProvider>
          </Router>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
