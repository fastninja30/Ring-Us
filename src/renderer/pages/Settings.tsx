import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  useTheme as useMuiTheme,
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import {
  IoMdPhonePortrait,
  IoMdCheckmarkCircle,
  IoMdCopy,
} from 'react-icons/io';
import {
  PhoneAuthProvider,
  linkWithCredential,
  RecaptchaVerifier,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../contexts/FriendsContext';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

export function Settings() {
  const { user } = useAuth();
  const { userProfile } = useFriends();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [is24Hour, setIs24Hour] = useState(false);

  // Phone verification
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');

  // Email verification
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    const savedIs24Hour = localStorage.getItem('settings-is24Hour');
    if (savedIs24Hour !== null) {
      setIs24Hour(savedIs24Hour === 'true');
    }
  }, []);

  const handleToggle = () => {
    setIs24Hour((prevIs24Hour) => {
      const newIs24Hour = !prevIs24Hour;
      localStorage.setItem('settings-is24Hour', String(newIs24Hour));
      return newIs24Hour;
    });
  };

  const handleSendPhoneCode = async () => {
    if (!user || !phoneNumber) return;
    setPhoneError('');
    setPhoneSuccess('');
    setPhoneLoading(true);

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
          },
        );
      }

      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber(
        phoneNumber,
        window.recaptchaVerifier,
      );
      setVerificationId(vId);
      setPhoneStep('verify');
      setPhoneSuccess('Verification code sent to your phone!');
    } catch (err: any) {
      if (err.code === 'auth/invalid-phone-number') {
        setPhoneError('Invalid phone number. Use format: +1234567890');
      } else if (err.code === 'auth/too-many-requests') {
        setPhoneError('Too many requests. Please try again later.');
      } else {
        setPhoneError(err.message || 'Failed to send verification code.');
      }
      window.recaptchaVerifier = undefined;
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!user || !verificationId || !verificationCode) return;
    setPhoneError('');
    setPhoneSuccess('');
    setPhoneLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode,
      );
      await linkWithCredential(user, credential);
      setPhoneSuccess('Phone number verified and linked to your account!');
      setPhoneStep('input');
      setPhoneNumber('');
      setVerificationCode('');
      setVerificationId('');
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setPhoneError('Invalid verification code.');
      } else if (err.code === 'auth/credential-already-in-use') {
        setPhoneError(
          'This phone number is already linked to another account.',
        );
      } else {
        setPhoneError(err.message || 'Failed to verify phone number.');
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleResendEmailVerification = async () => {
    if (!user) return;
    setEmailSending(true);
    setEmailMessage('');
    try {
      await sendEmailVerification(user);
      setEmailMessage('Verification email sent!');
    } catch (err: any) {
      setEmailMessage(err.message || 'Failed to send verification email.');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 } }}>
        Settings
      </Typography>

      {/* Theme Settings */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          backgroundColor: muiTheme.palette.background.paper,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Theme
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
            />
          }
          label="Dark Mode"
        />
      </Paper>

      {/* Clock Settings */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          backgroundColor: muiTheme.palette.background.paper,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Clock
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={is24Hour}
              onChange={handleToggle}
            />
          }
          label="24-Hour Format"
        />
      </Paper>

      {/* Account Info */}
      {user && (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            backgroundColor: muiTheme.palette.background.paper,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Account
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">
              {user.displayName || 'Not set'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">{user.email}</Typography>
              {user.emailVerified ? (
                <Chip
                  icon={<IoMdCheckmarkCircle />}
                  label="Verified"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              ) : (
                <Button
                  size="small"
                  onClick={handleResendEmailVerification}
                  disabled={emailSending}
                  sx={{ color: 'primary.main', fontSize: '0.75rem' }}
                >
                  {emailSending ? 'Sending...' : 'Verify Email'}
                </Button>
              )}
            </Box>
            {emailMessage && (
              <Alert severity="info" sx={{ mt: 1 }}>
                {emailMessage}
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Phone
            </Typography>
            {user.phoneNumber ? (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="body1">{user.phoneNumber}</Typography>
                <Chip
                  icon={<IoMdCheckmarkCircle />}
                  label="Verified"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Not linked
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Friend Code
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                  color: 'primary.main',
                }}
              >
                {userProfile?.friendCode || '------'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  if (userProfile?.friendCode) {
                    navigator.clipboard.writeText(userProfile.friendCode);
                  }
                }}
                sx={{ color: '#ff7300' }}
              >
                <IoMdCopy />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Phone Verification */}
      {user && !user.phoneNumber && (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            backgroundColor: muiTheme.palette.background.paper,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            <IoMdPhonePortrait
              style={{ verticalAlign: 'middle', marginRight: 8 }}
            />
            Phone Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Link a phone number to your account for additional security.
          </Typography>

          {phoneError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {phoneError}
            </Alert>
          )}
          {phoneSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {phoneSuccess}
            </Alert>
          )}

          {phoneStep === 'input' ? (
            <>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                helperText="Include country code (e.g., +1 for US)"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoMdPhonePortrait style={{ color: '#9e9e9e' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendPhoneCode}
                disabled={phoneLoading || !phoneNumber}

              >
                {phoneLoading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                sx={{ mb: 2 }}
              />
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleVerifyPhone}
                  disabled={phoneLoading || !verificationCode}
                  sx={{
                    backgroundColor: '#ff7300',
                    '&:hover': { backgroundColor: '#e56700' },
                  }}
                >
                  {phoneLoading ? (
                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                  ) : (
                    'Verify'
                  )}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => {
                    setPhoneStep('input');
                    setVerificationCode('');
                    setVerificationId('');
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
          <div id="recaptcha-container" />
        </Paper>
      )}
    </Box>
  );
}
