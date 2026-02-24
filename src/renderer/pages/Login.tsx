import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { IoMdEye, IoMdEyeOff, IoMdMail, IoMdLock } from 'react-icons/io';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to home page
    navigate('/home');
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(200.96deg, #0f0f0f -29.09%, #0f0f0f 51.77%, #0f0f0f 129.35%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          background: 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: '#F4F3F2',
              mb: 1,
            }}
          >
            Welcome!
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sign in to continue to Ring-Us
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoMdMail style={{ color: '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoMdLock style={{ color: '#9e9e9e' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                    aria-label={showPassword ? 'hide password' : 'show password'}
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Link
              href="#"
              underline="hover"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                '&:hover': { color: '#F4F3F2' },
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#ff7300',
              '&:hover': {
                backgroundColor: '#e56700',
              },
              mb: 2,
            }}
          >
            Sign In
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/signup"
                underline="hover"
                sx={{
                  color: '#ff7300',
                  fontWeight: 600,
                  '&:hover': { color: '#e56700' },
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}