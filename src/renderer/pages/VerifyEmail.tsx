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
} from '@mui/material';
import { IoMdMail } from 'react-icons/io';
import { auth } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export function VerifyEmail() {
  const navigate = useNavigate();
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
        background:
          'linear-gradient(200.96deg, #0f0f0f -29.09%, #0f0f0f 51.77%, #0f0f0f 129.35%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 460,
          borderRadius: 3,
          background: 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
        }}
      >
        <IoMdMail
          style={{ fontSize: 64, color: '#ff7300', marginBottom: 16 }}
        />

        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#F4F3F2', mb: 1 }}
        >
          Verify Your Email
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          We sent a verification link to{' '}
          <strong style={{ color: '#ff7300' }}>{user?.email}</strong>
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
            backgroundColor: '#ff7300',
            '&:hover': { backgroundColor: '#e56700' },
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
            borderColor: '#ff7300',
            color: '#ff7300',
            '&:hover': { borderColor: '#e56700', color: '#e56700' },
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
          sx={{ color: 'text.secondary', '&:hover': { color: '#F4F3F2' } }}
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
}
