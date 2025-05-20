// src/App.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import theme from './Styles/Theme';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';

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
            border: '1px solid white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '800px',
            height: '600px',
          }}
        >
          <Router>
            <AppRoutes />
          </Router>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
