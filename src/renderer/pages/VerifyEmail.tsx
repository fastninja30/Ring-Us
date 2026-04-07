import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification, signOut } from 'firebase/auth';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { IoMdMail } from 'react-icons/io';
import { auth } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export function VerifyEmail() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!user) return;
    setSending(true);
    setError('');
    setMessage('');
    try {
      await sendEmailVerification(user);
      setMessage('Verification email sent! Check your inbox.');
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError(
          'Too many requests. Please wait a few minutes before trying again.',
        );
      } else {
        setError(err.message || 'Failed to send verification email.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    await user.reload();
    if (user.emailVerified) {
      navigate('/home');
    } else {
      setError(
        'Email not yet verified. Please check your inbox and click the verification link.',
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(200.96deg, #0a0a0a -29.09%, #1a1a1a 129.35%)'
          : 'linear-gradient(200.96deg, #f8f9fa -29.09%, #e9ecef 129.35%)',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: 460,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            fontSize: { xs: 48, sm: 64 },
            color: 'primary.main',
            mb: 0.5,
            display: 'inline-flex',
          }}
        >
          <IoMdMail />
        </Box>

        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}
        >
          Verify Your Email
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          We sent a verification link to{' '}
          <strong style={{ color: theme.palette.primary.main }}>{user?.email}</strong>
          .Please check your inbox and click the link to verify your account.
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleCheckVerification}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            mb: 2,
          }}
        >
          I&apos;ve Verified My Email
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleResend}
          disabled={sending}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            mb: 2,
          }}
        >
          {sending ? (
            <CircularProgress size={24} sx={{ color: '#ff7300' }} />
          ) : (
            'Resend Verification Email'
          )}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={handleSignOut}
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
}
