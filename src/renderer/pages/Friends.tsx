import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  IoMdCopy,
  IoMdPersonAdd,
  IoMdClose,
  IoMdCheckmark,
} from 'react-icons/io';
import { useFriends } from '../contexts/FriendsContext';

export function Friends() {
  const {
    userProfile,
    friends,
    pendingRequests,
    outgoingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  } = useFriends();

  const [friendCode, setFriendCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSendRequest = async () => {
    if (!friendCode.trim()) return;
    setError('');
    setSuccess('');
    setSending(true);

    try {
      const name = await sendFriendRequest(friendCode);
      setSuccess(`Friend request sent to ${name}!`);
      setFriendCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyCode = () => {
    if (userProfile?.friendCode) {
      navigator.clipboard.writeText(userProfile.friendCode);
      setCopied(true);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (err: any) {
      setError(err.message || 'Failed to accept request.');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
    } catch (err: any) {
      setError(err.message || 'Failed to decline request.');
    }
  };

  const handleRemoveFriend = async (uid: string) => {
    try {
      await removeFriend(uid);
    } catch (err: any) {
      setError(err.message || 'Failed to remove friend.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: '#ff7300' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Friends
      </Typography>

      {/* Your Friend Code */}
      <Paper sx={{ p: 3, mb: 3, background: 'rgba(30, 30, 30, 0.7)' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Your Friend Code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Share this code with friends so they can add you.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: 4,
              color: '#ff7300',
            }}
          >
            {userProfile?.friendCode || '------'}
          </Typography>
          <IconButton onClick={handleCopyCode} sx={{ color: '#ff7300' }}>
            <IoMdCopy />
          </IconButton>
        </Box>
      </Paper>

      {/* Add a Friend */}
      <Paper sx={{ p: 3, mb: 3, background: 'rgba(30, 30, 30, 0.7)' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Add a Friend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your friend&apos;s 6-character code to send them a request.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            value={friendCode}
            onChange={(e) =>
              setFriendCode(e.target.value.toUpperCase().slice(0, 6))
            }
            placeholder="e.g. A7K2M9"
            size="small"
            inputProps={{
              style: {
                fontFamily: 'monospace',
                letterSpacing: 2,
                textTransform: 'uppercase',
              },
              maxLength: 6,
            }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSendRequest}
            disabled={sending || friendCode.length < 6}
            startIcon={
              sending ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : (
                <IoMdPersonAdd />
              )
            }
            sx={{
              backgroundColor: '#ff7300',
              '&:hover': { backgroundColor: '#e56700' },
            }}
          >
            Send Request
          </Button>
        </Box>
      </Paper>

      {/* Pending Requests */}
      {(pendingRequests.length > 0 || outgoingRequests.length > 0) && (
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(30, 30, 30, 0.7)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pending Requests
          </Typography>

          {pendingRequests.length > 0 && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Incoming
              </Typography>
              <List disablePadding>
                {pendingRequests.map((req, index) => (
                  <Box key={req.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText primary={req.fromName || 'Unknown'} />
                      <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleAccept(req.id)}
                          sx={{ color: '#4caf50' }}
                          size="small"
                        >
                          <IoMdCheckmark />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDecline(req.id)}
                          sx={{ color: '#ff4444' }}
                          size="small"
                        >
                          <IoMdClose />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Box>
                ))}
              </List>
            </>
          )}

          {outgoingRequests.length > 0 && (
            <>
              {pendingRequests.length > 0 && <Divider sx={{ my: 1 }} />}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Outgoing
              </Typography>
              <List disablePadding>
                {outgoingRequests.map((req) => (
                  <ListItem key={req.id}>
                    <ListItemText
                      primary={req.fromName || 'Unknown'}
                      secondary="Pending..."
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}

      {/* Friends List */}
      <Paper sx={{ p: 3, background: 'rgba(30, 30, 30, 0.7)' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Friends
        </Typography>
        {friends.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No friends yet. Share your friend code to get started!
          </Typography>
        ) : (
          <List disablePadding>
            {friends.map((friend, index) => (
              <Box key={friend.uid}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText primary={friend.displayName} />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleRemoveFriend(friend.uid)}
                      sx={{ color: '#ff4444' }}
                      size="small"
                    >
                      <IoMdClose />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Friend code copied!"
      />
    </Box>
  );
}
