import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Results from './pages/Results/Results';
import Settings from './pages/Settings/Settings';
import QuizTaker from './QuizTaker.jsx';
import BrowseQuizzes from './pages/BrowseQuizzes';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import ContentGuidelines from './pages/ContentGuidelines';
import RefundRequests from './pages/RefundRequests';

function App(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/create-quiz" element={<Profile />} />
            <Route path="/browse-quizzes" element={<BrowseQuizzes />} />
            <Route path="/results" element={<Results />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/take-quiz" element={<QuizTaker />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/refund-requests" element={<RefundRequests />} />

            {/* Redirect old routes */}
            <Route path="/leaderboard" element={<Navigate to="/results" replace />} />
            <Route path="/create-quiz" element={<Navigate to="/profile" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
