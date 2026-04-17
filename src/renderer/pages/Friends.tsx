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
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
  const theme = useTheme();

  const [friendCode, setFriendCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<{uid: string, name: string} | null>(null);

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

  const confirmRemoveFriend = (uid: string, name: string) => {
    setFriendToRemove({ uid, name });
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    try {
      await removeFriend(friendToRemove.uid);
    } catch (err: any) {
      setError(err.message || 'Failed to remove friend.');
    } finally {
      setFriendToRemove(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Friends
      </Typography>

      {/* Your Friend Code */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
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
              color: 'primary.main',
            }}
          >
            {userProfile?.friendCode || '------'}
          </Typography>
          <IconButton onClick={handleCopyCode} color="primary">
            <IoMdCopy />
          </IconButton>
        </Box>
      </Paper>

      {/* Add a Friend */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
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
              flexShrink: 0,
            }}
          >
            Send Request
          </Button>
        </Box>
      </Paper>

      {/* Pending Requests */}
      {(pendingRequests.length > 0 || outgoingRequests.length > 0) && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
          }}
        >
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
                          color="success"
                          size="small"
                        >
                          <IoMdCheckmark />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDecline(req.id)}
                          color="error"
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
      <Paper
        sx={{
          p: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
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
                      onClick={() => confirmRemoveFriend(friend.uid, friend.displayName)}
                      color="error"
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

      <Dialog
        open={!!friendToRemove}
        onClose={() => setFriendToRemove(null)}
      >
        <DialogTitle>Remove Friend</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {friendToRemove?.name} from your friends list?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFriendToRemove(null)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemoveFriend} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
