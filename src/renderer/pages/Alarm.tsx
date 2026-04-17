import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  MutableRefObject,
} from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import {
  IoMdAdd,
  IoMdTrash,
  IoMdAlarm,
  IoMdNotifications,
  IoMdPeople,
  IoMdCreate,
} from 'react-icons/io';
import { AlarmData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../contexts/FriendsContext';
import { useSharedAlarms } from '../hooks/useSharedAlarms';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(hour: number, minute: number, is24Hour: boolean): string {
  if (is24Hour) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

function loadAlarms(): AlarmData[] {
  try {
    const saved = localStorage.getItem('ringus-alarms');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveAlarms(alarms: AlarmData[]) {
  localStorage.setItem('ringus-alarms', JSON.stringify(alarms));
}

// Generate an alarm tone using Web Audio API
function playAlarmSound(
  audioContextRef: MutableRefObject<AudioContext | null>,
) {
  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    const playBeep = (startTime: number, freq: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    };

    const now = ctx.currentTime;
    for (let i = 0; i < 3; i += 1) {
      playBeep(now + i * 0.6, 880);
      playBeep(now + i * 0.6 + 0.3, 1100);
    }
  } catch {
    // Audio not available
  }
}

// Union type for rendering both alarm types in a single list
interface DisplayAlarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  days: number[];
  isShared: boolean;
  ownerId?: string;
  ownerName?: string;
  participantNames?: string[];
}

export function Alarm() {
  const { user } = useAuth();
  const { friends } = useFriends();
  const {
    sharedAlarms,
    createSharedAlarm,
    toggleSharedAlarm,
    deleteSharedAlarm,
    leaveSharedAlarm,
    updateSharedAlarm,
  } = useSharedAlarms();

  const [alarms, setAlarms] = useState<AlarmData[]>(loadAlarms);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showClearAllPrompt, setShowClearAllPrompt] = useState(false);
  const [showClearInactivePrompt, setShowClearInactivePrompt] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<DisplayAlarm | null>(null);
  const [firingAlarm, setFiringAlarm] = useState<DisplayAlarm | null>(null);
  const [newHour, setNewHour] = useState('08');
  const [newMinute, setNewMinute] = useState('00');
  const [newPeriod, setNewPeriod] = useState('AM');
  const [newLabel, setNewLabel] = useState('');
  const [newDays, setNewDays] = useState<number[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deleteAlarmsLoading, setDeleteAlarmsLoading] = useState(false);
  const [deleteAlarmsMessage, setDeleteAlarmsMessage] = useState('');
  const firedAlarmsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const theme = useTheme();

  const is24Hour = localStorage.getItem('settings-is24Hour') === 'true';

  // Merge local and shared alarms into a single sorted list
  const allAlarms: DisplayAlarm[] = useMemo(() => {
    const local: DisplayAlarm[] = alarms.map((a) => ({
      ...a,
      isShared: false,
    }));
    const shared: DisplayAlarm[] = sharedAlarms.map((a) => ({
      id: a.id,
      hour: a.hour,
      minute: a.minute,
      label: a.label,
      enabled: a.enabled,
      days: a.days,
      isShared: true,
      ownerId: a.ownerId,
      ownerName: a.ownerName,
      participantNames: a.participantNames,
    }));
    return [...local, ...shared].sort(
      (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
    );
  }, [alarms, sharedAlarms]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to storage events to keep alarms synced across components
  useEffect(() => {
    const handleStorageChange = () => {
      setAlarms(loadAlarms());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check alarms every second (both local and shared)
  const checkAlarms = useCallback(() => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    const timeKey = `${currentHour}:${currentMinute}`;

    allAlarms.forEach((alarm) => {
      if (!alarm.enabled) return;

      const alarmFiredKey = `${alarm.id}-${timeKey}`;
      if (firedAlarmsRef.current.has(alarmFiredKey)) return;

      if (alarm.hour === currentHour && alarm.minute === currentMinute) {
        const shouldFire =
          alarm.days.length === 0 || alarm.days.includes(currentDay);
        if (!shouldFire) return;

        firedAlarmsRef.current.add(alarmFiredKey);
        setFiringAlarm(alarm);

        // Play alarm sound
        playAlarmSound(audioContextRef);

        // Send native notification
        if (Notification.permission === 'granted') {
          const body = alarm.isShared
            ? `Shared alarm - ${alarm.label || formatTime(alarm.hour, alarm.minute, is24Hour)}`
            : alarm.label ||
              `Alarm - ${formatTime(alarm.hour, alarm.minute, is24Hour)}`;
          const notification = new Notification('Ring-Us Alarm', {
            body,
            requireInteraction: true,
          });
        }

        // Disable one-time local alarms after firing
        if (!alarm.isShared && alarm.days.length === 0) {
          setAlarms((prev) => {
            const updated = prev.map((a) =>
              a.id === alarm.id ? { ...a, enabled: false } : a,
            );
            saveAlarms(updated);
            return updated;
          });
        }
      }
    });
  }, [currentTime, allAlarms, is24Hour]);

  useEffect(() => {
    checkAlarms();
  }, [checkAlarms]);

  // Clean up fired alarms set periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      firedAlarmsRef.current.clear();
    }, 120000);
    return () => clearInterval(cleanup);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleAddAlarm = async () => {
    let hour = parseInt(newHour, 10);
    const minute = parseInt(newMinute, 10);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return;
    }

    if (!is24Hour) {
      if (newPeriod === 'PM' && hour !== 12) {
        hour += 12;
      } else if (newPeriod === 'AM' && hour === 12) {
        hour = 0;
      }
    }

    if (selectedFriends.length > 0) {
      // Create shared alarm in Firestore
      const friendNames = selectedFriends.map(
        (uid) => friends.find((f) => f.uid === uid)?.displayName || '',
      );
      await createSharedAlarm(
        { hour, minute, label: newLabel || '', days: [...newDays] },
        selectedFriends,
        friendNames,
      );
    } else {
      // Create local alarm
      const newAlarm: AlarmData = {
        id: Date.now().toString(),
        hour,
        minute,
        label: newLabel || '',
        enabled: true,
        days: [...newDays],
      };

      const updated = [...alarms, newAlarm].sort(
        (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
      );
      setAlarms(updated);
      saveAlarms(updated);
    }

    setNewHour('08');
    setNewMinute('00');
    setNewLabel('');
    setNewDays([]);
    setSelectedFriends([]);
    setShowAddDialog(false);
  };

  const handleUpdateAlarm = async () => {
    if (!editingAlarm) return;

    let hour = parseInt(newHour, 10);
    const minute = parseInt(newMinute, 10);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return;
    }

    if (!is24Hour) {
      if (newPeriod === 'PM' && hour !== 12) {
        hour += 12;
      } else if (newPeriod === 'AM' && hour === 12) {
        hour = 0;
      }
    }

    if (editingAlarm.isShared) {
      await updateSharedAlarm(editingAlarm.id, {
        hour,
        minute,
        label: newLabel,
        days: [...newDays],
      });
    } else {
      const updatedAlarms = alarms.map((a) =>
        a.id === editingAlarm.id
          ? { ...a, hour, minute, label: newLabel, days: [...newDays] }
          : a,
      );
      setAlarms(updatedAlarms);
      saveAlarms(updatedAlarms);
    }

    setEditingAlarm(null);
    setNewHour('08');
    setNewMinute('00');
    setNewLabel('');
    setNewDays([]);
  };

  useEffect(() => {
    if (editingAlarm) {
      const displayHour = is24Hour
        ? editingAlarm.hour
        : editingAlarm.hour % 12 || 12;
      setNewHour(String(displayHour).padStart(2, '0'));
      setNewMinute(String(editingAlarm.minute).padStart(2, '0'));
      setNewLabel(editingAlarm.label);
      setNewDays(editingAlarm.days);
      setNewPeriod(editingAlarm.hour >= 12 ? 'PM' : 'AM');
    } else {
      setNewHour('08');
      setNewMinute('00');
      setNewLabel('');
      setNewDays([]);
      setNewPeriod('AM');
    }
  }, [editingAlarm, is24Hour]);

  const handleShowEditDialog = (alarm: DisplayAlarm) => {
    setEditingAlarm(alarm);
  };

  const handleDeleteAlarm = (alarm: DisplayAlarm) => {
    if (alarm.isShared) {
      if (alarm.ownerId === user?.uid) {
        deleteSharedAlarm(alarm.id);
      } else {
        leaveSharedAlarm(alarm.id);
      }
    } else {
      const updated = alarms.filter((a) => a.id !== alarm.id);
      setAlarms(updated);
      saveAlarms(updated);
    }
  };

  const handleDeleteAllAlarms = async () => {
    setShowClearAllPrompt(false);
    setDeleteAlarmsLoading(true);
    setDeleteAlarmsMessage('');
    try {
      localStorage.removeItem('ringus-alarms');
      setAlarms([]);
      window.dispatchEvent(new Event('storage'));

      for (const alarm of sharedAlarms) {
        if (alarm.ownerId === user?.uid) {
          await deleteSharedAlarm(alarm.id);
        } else {
          await leaveSharedAlarm(alarm.id);
        }
      }
      setDeleteAlarmsMessage('All alarms deleted successfully.');
    } catch (err: any) {
      setDeleteAlarmsMessage(err.message || 'Failed to delete all alarms.');
    } finally {
      setDeleteAlarmsLoading(false);
      setTimeout(() => setDeleteAlarmsMessage(''), 3000);
    }
  };

  const handleDeleteInactiveAlarms = async () => {
    setShowClearInactivePrompt(false);
    setDeleteAlarmsLoading(true);
    setDeleteAlarmsMessage('');
    try {
      const activeAlarms = alarms.filter((a) => a.enabled);
      setAlarms(activeAlarms);
      saveAlarms(activeAlarms);
      window.dispatchEvent(new Event('storage'));

      for (const alarm of sharedAlarms) {
        if (!alarm.enabled) {
          if (alarm.ownerId === user?.uid) {
            await deleteSharedAlarm(alarm.id);
          } else {
            await leaveSharedAlarm(alarm.id);
          }
        }
      }
      setDeleteAlarmsMessage('Inactive alarms deleted successfully.');
    } catch (err: any) {
      setDeleteAlarmsMessage(err.message || 'Failed to delete inactive alarms.');
    } finally {
      setDeleteAlarmsLoading(false);
      setTimeout(() => setDeleteAlarmsMessage(''), 3000);
    }
  };

  const handleToggleAlarm = (alarm: DisplayAlarm) => {
    if (alarm.isShared) {
      toggleSharedAlarm(alarm.id, !alarm.enabled);
    } else {
      const updated = alarms.map((a) =>
        a.id === alarm.id ? { ...a, enabled: !a.enabled } : a,
      );
      setAlarms(updated);
      saveAlarms(updated);
    }
  };

  const handleDismissAlarm = () => {
    setFiringAlarm(null);
  };

  const handleSnooze = () => {
    if (!firingAlarm) return;
    // Snooze for 5 minutes: create a one-time local alarm 5 min from now
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const snoozeAlarm: AlarmData = {
      id: Date.now().toString(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      label: `${firingAlarm.label || 'Alarm'} (Snoozed)`,
      enabled: true,
      days: [],
    };
    const updated = [...alarms, snoozeAlarm].sort(
      (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
    );
    setAlarms(updated);
    saveAlarms(updated);
    setFiringAlarm(null);
  };

  const handleToggleDay = (day: number) => {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleToggleFriend = (uid: string) => {
    setSelectedFriends((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    );
  };

  // Get other participants' names for display (excluding current user)
  const getOtherParticipants = (alarm: DisplayAlarm): string => {
    if (!alarm.participantNames) return '';
    const others = alarm.participantNames.filter((_, i) => {
      const sharedAlarm = sharedAlarms.find((sa) => sa.id === alarm.id);
      return sharedAlarm && sharedAlarm.participants[i] !== user?.uid;
    });
    return others.join(', ');
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
      {/* Current time display */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 4 } }}>
        <Typography
          variant="h2"
          sx={{ fontWeight: 300, fontSize: { xs: '2.5rem', sm: '3rem' } }}
        >
          {currentTime.toLocaleTimeString('en-US', {
            hour12: !is24Hour,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </Box>

      {/* Header with add button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <IoMdAlarm /> Alarms
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<IoMdTrash />}
            onClick={() => setShowClearInactivePrompt(true)}
            disabled={deleteAlarmsLoading}
            size="small"
          >
            Clear Inactive
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<IoMdTrash />}
            onClick={() => setShowClearAllPrompt(true)}
            disabled={deleteAlarmsLoading}
            size="small"
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            startIcon={<IoMdAdd />}
            onClick={() => setShowAddDialog(true)}
            size="small"
          >
            Add Alarm
          </Button>
        </Box>
      </Box>

      {deleteAlarmsMessage && (
        <Alert severity={deleteAlarmsMessage.includes('Failed') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {deleteAlarmsMessage}
        </Alert>
      )}

      {/* Alarm list */}
      {allAlarms.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
          }}
        >
          <IoMdAlarm style={{ fontSize: 48, color: '#666', marginBottom: 8 }} />
          <Typography color="text.secondary">
            No alarms set. Tap &quot;Add Alarm&quot; to create one.
          </Typography>
        </Paper>
      ) : (
        <Paper
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
          }}
        >
          <List>
            {allAlarms.map((alarm, index) => (
              <Box key={`${alarm.isShared ? 'shared' : 'local'}-${alarm.id}`}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 300,
                          color: alarm.enabled
                            ? 'text.primary'
                            : 'text.disabled',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                        }}
                      >
                        {formatTime(alarm.hour, alarm.minute, is24Hour)}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {alarm.label && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: alarm.enabled
                                ? 'text.secondary'
                                : 'text.disabled',
                            }}
                          >
                            {alarm.label}
                          </Typography>
                        )}
                        {alarm.isShared && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: alarm.enabled
                                ? 'primary.main'
                                : 'text.disabled',
                              fontSize: '0.75rem',
                            }}
                          >
                            {alarm.ownerId === user?.uid
                              ? `with ${getOtherParticipants(alarm)}`
                              : `by ${alarm.ownerName}`}
                          </Typography>
                        )}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            mt: 0.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          {alarm.isShared && (
                            <Chip
                              icon={<IoMdPeople style={{ fontSize: 14 }} />}
                              label="Shared"
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                color: alarm.enabled
                                  ? 'primary.main'
                                  : 'text.disabled',
                                borderColor: alarm.enabled
                                  ? 'primary.main'
                                  : 'text.disabled',
                              }}
                              variant="outlined"
                            />
                          )}
                          {alarm.days.length === 0 ? (
                            <Chip
                              label="One-time"
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                color: alarm.enabled
                                  ? 'primary.main'
                                  : 'text.disabled',
                                borderColor: alarm.enabled
                                  ? 'primary.main'
                                  : 'text.disabled',
                              }}
                              variant="outlined"
                            />
                          ) : (
                            alarm.days.sort().map((day) => (
                              <Chip
                                key={day}
                                label={DAY_LABELS[day]}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  color: alarm.enabled
                                    ? 'primary.main'
                                    : 'text.disabled',
                                  borderColor: alarm.enabled
                                    ? 'primary.main'
                                    : 'text.disabled',
                                }}
                                variant="outlined"
                              />
                            ))
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: { xs: 1, sm: 0 },
                      ml: { sm: 'auto' },
                      flexShrink: 0,
                    }}
                  >
                    <Switch
                      checked={alarm.enabled}
                      onChange={() => handleToggleAlarm(alarm)}
                    />
                    {((alarm.isShared && alarm.ownerId === user?.uid) ||
                      !alarm.isShared) && (
                      <IconButton
                        onClick={() => handleShowEditDialog(alarm)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <IoMdCreate />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleDeleteAlarm(alarm)}
                      sx={{ color: 'error.main' }}
                    >
                      <IoMdTrash />
                    </IconButton>
                  </Box>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* Add Alarm Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
            minWidth: { xs: '90%', sm: 350 },
          },
        }}
      >
        <DialogTitle>Set New Alarm</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              my: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              value={newHour}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '').slice(0, 2);
                if (!is24Hour && parseInt(val, 10) > 12) {
                  val = '12';
                }
                setNewHour(val);
              }}
              inputProps={{
                style: { textAlign: 'center', fontSize: '2rem', width: '50px' },
                maxLength: 2,
              }}
              variant="outlined"
              size="small"
              placeholder="HH"
            />
            <Typography variant="h3" sx={{ fontWeight: 300 }}>
              :
            </Typography>
            <TextField
              value={newMinute}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setNewMinute(val);
              }}
              inputProps={{
                style: { textAlign: 'center', fontSize: '2rem', width: '50px' },
                maxLength: 2,
              }}
              variant="outlined"
              size="small"
              placeholder="MM"
            />
            {!is24Hour && (
              <Select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                sx={{ fontSize: '1rem', ml: 1 }}
              >
                <MenuItem value="AM">AM</MenuItem>
                <MenuItem value="PM">PM</MenuItem>
              </Select>
            )}
          </Box>

          {/* Label */}
          <TextField
            fullWidth
            label="Label (optional)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Day selector */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Repeat (leave empty for one-time alarm)
          </Typography>
          <FormGroup row>
            {DAY_LABELS.map((label, index) => (
              <FormControlLabel
                key={label}
                control={
                  <Checkbox
                    checked={newDays.includes(index)}
                    onChange={() => handleToggleDay(index)}
                    sx={{
                      '&.Mui-checked': { color: 'primary.main' },
                      padding: '4px',
                    }}
                    size="small"
                  />
                }
                label={label}
                sx={{ mr: 0.5 }}
              />
            ))}
          </FormGroup>

          {/* Share with Friends */}
          {friends.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Share with Friends (optional)
              </Typography>
              <FormGroup>
                {friends.map((friend) => (
                  <FormControlLabel
                    key={friend.uid}
                    control={
                      <Checkbox
                        checked={selectedFriends.includes(friend.uid)}
                        onChange={() => handleToggleFriend(friend.uid)}
                        sx={{
                          '&.Mui-checked': { color: 'primary.main' },
                          padding: '4px',
                        }}
                        size="small"
                      />
                    }
                    label={friend.displayName}
                  />
                ))}
              </FormGroup>
              {selectedFriends.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: 'primary.main', mt: 0.5, display: 'block' }}
                >
                  This alarm will sync with selected friends.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            onClick={() => setShowAddDialog(false)}
            sx={{ color: 'text.secondary', width: { xs: '100%', sm: 'auto' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddAlarm}
            variant="contained"
            sx={{
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Alarm Dialog */}
      <Dialog
        open={editingAlarm !== null}
        onClose={() => setEditingAlarm(null)}
        PaperProps={{
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
            minWidth: { xs: '90%', sm: 350 },
          },
        }}
      >
        <DialogTitle>Edit Alarm</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              my: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              value={newHour}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '').slice(0, 2);
                if (!is24Hour && parseInt(val, 10) > 12) {
                  val = '12';
                }
                setNewHour(val);
              }}
              inputProps={{
                style: { textAlign: 'center', fontSize: '2rem', width: '50px' },
                maxLength: 2,
              }}
              variant="outlined"
              size="small"
              placeholder="HH"
            />
            <Typography variant="h3" sx={{ fontWeight: 300 }}>
              :
            </Typography>
            <TextField
              value={newMinute}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setNewMinute(val);
              }}
              inputProps={{
                style: { textAlign: 'center', fontSize: '2rem', width: '50px' },
                maxLength: 2,
              }}
              variant="outlined"
              size="small"
              placeholder="MM"
            />
            {!is24Hour && (
              <Select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                sx={{ fontSize: '1rem', ml: 1 }}
              >
                <MenuItem value="AM">AM</MenuItem>
                <MenuItem value="PM">PM</MenuItem>
              </Select>
            )}
          </Box>

          {/* Label */}
          <TextField
            fullWidth
            label="Label (optional)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Day selector */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Repeat (leave empty for one-time alarm)
          </Typography>
          <FormGroup row>
            {DAY_LABELS.map((label, index) => (
              <FormControlLabel
                key={label}
                control={
                  <Checkbox
                    checked={newDays.includes(index)}
                    onChange={() => handleToggleDay(index)}
                    sx={{
                      '&.Mui-checked': { color: 'primary.main' },
                      padding: '4px',
                    }}
                    size="small"
                  />
                }
                label={label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            onClick={() => setEditingAlarm(null)}
            sx={{ color: 'text.secondary', width: { xs: '100%', sm: 'auto' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAlarm}
            variant="contained"
            sx={{
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={showClearAllPrompt}
        onClose={() => setShowClearAllPrompt(false)}
        PaperProps={{
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
          },
        }}
      >
        <DialogTitle>Clear All Alarms?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all alarms? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearAllPrompt(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAllAlarms} color="error" variant="contained">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Inactive Confirmation Dialog */}
      <Dialog
        open={showClearInactivePrompt}
        onClose={() => setShowClearInactivePrompt(false)}
        PaperProps={{
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
          },
        }}
      >
        <DialogTitle>Clear Inactive Alarms?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all inactive alarms? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearInactivePrompt(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteInactiveAlarms} color="error" variant="contained">
            Delete Inactive
          </Button>
        </DialogActions>
      </Dialog>

      {/* Firing Alarm Dialog */}
      <Dialog
        open={firingAlarm !== null}
        onClose={handleDismissAlarm}
        PaperProps={{
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
            minWidth: { xs: '90%', sm: 350 },
            textAlign: 'center',
          },
        }}
      >
        <DialogContent sx={{ pt: 4 }}>
          <Box
            component={IoMdNotifications}
            sx={{
              fontSize: { xs: 48, sm: 64 },
              color: 'primary.main',
              animation: 'shake 0.5s ease-in-out infinite',
            }}
          />
          <Typography variant="h3" sx={{ mt: 2, fontWeight: 300 }}>
            {firingAlarm &&
              formatTime(firingAlarm.hour, firingAlarm.minute, is24Hour)}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            {firingAlarm?.label || 'Alarm'}
          </Typography>
          {firingAlarm?.isShared && (
            <Chip
              icon={<IoMdPeople style={{ fontSize: 14 }} />}
              label="Shared alarm"
              size="small"
              sx={{
                mt: 1,
                color: 'primary.main',
                borderColor: 'primary.main',
              }}
              variant="outlined"
            />
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            pb: 3,
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            onClick={handleSnooze}
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Snooze (5 min)
          </Button>
          <Button
            onClick={handleDismissAlarm}
            variant="contained"
            size="large"
            sx={{
              px: 4,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS animation for alarm icon */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
      `}</style>
    </Box>
  );
}
