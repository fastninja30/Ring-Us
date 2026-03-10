import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
} from '@mui/material';
import { IoMdAdd, IoMdTrash, IoMdAlarm, IoMdNotifications } from 'react-icons/io';

interface AlarmData {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  days: number[]; // 0=Sun, 1=Mon, ... 6=Sat. Empty = one-time
}

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
function playAlarmSound(audioContextRef: React.MutableRefObject<AudioContext | null>) {
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
    for (let i = 0; i < 3; i++) {
      playBeep(now + i * 0.6, 880);
      playBeep(now + i * 0.6 + 0.3, 1100);
    }
  } catch {
    // Audio not available
  }
}

export function Alarm() {
  const [alarms, setAlarms] = useState<AlarmData[]>(loadAlarms);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [firingAlarm, setFiringAlarm] = useState<AlarmData | null>(null);
  const [newHour, setNewHour] = useState('08');
  const [newMinute, setNewMinute] = useState('00');
  const [newLabel, setNewLabel] = useState('');
  const [newDays, setNewDays] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const firedAlarmsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  const is24Hour = localStorage.getItem('settings-is24Hour') === 'true';

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check alarms every second
  const checkAlarms = useCallback(() => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    const timeKey = `${currentHour}:${currentMinute}`;

    alarms.forEach((alarm) => {
      if (!alarm.enabled) return;

      const alarmFiredKey = `${alarm.id}-${timeKey}`;
      if (firedAlarmsRef.current.has(alarmFiredKey)) return;

      if (alarm.hour === currentHour && alarm.minute === currentMinute) {
        const shouldFire = alarm.days.length === 0 || alarm.days.includes(currentDay);
        if (!shouldFire) return;

        firedAlarmsRef.current.add(alarmFiredKey);
        setFiringAlarm(alarm);

        // Play alarm sound
        playAlarmSound(audioContextRef);

        // Send native notification
        if (Notification.permission === 'granted') {
          new Notification('Ring-Us Alarm', {
            body: alarm.label || `Alarm - ${formatTime(alarm.hour, alarm.minute, is24Hour)}`,
            requireInteraction: true,
          });
        }

        // Disable one-time alarms after firing
        if (alarm.days.length === 0) {
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
  }, [currentTime, alarms, is24Hour]);

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

  const handleAddAlarm = () => {
    const hour = parseInt(newHour, 10);
    const minute = parseInt(newMinute, 10);

    if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return;
    }

    const newAlarm: AlarmData = {
      id: Date.now().toString(),
      hour,
      minute,
      label: newLabel || '',
      enabled: true,
      days: [...newDays],
    };

    const updated = [...alarms, newAlarm].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    setAlarms(updated);
    saveAlarms(updated);

    setNewHour('08');
    setNewMinute('00');
    setNewLabel('');
    setNewDays([]);
    setShowAddDialog(false);
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    saveAlarms(updated);
  };

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) =>
      a.id === id ? { ...a, enabled: !a.enabled } : a,
    );
    setAlarms(updated);
    saveAlarms(updated);
  };

  const handleDismissAlarm = () => {
    setFiringAlarm(null);
  };

  const handleToggleDay = (day: number) => {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      {/* Current time display */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 300 }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IoMdAlarm /> Alarms
        </Typography>
        <Button
          variant="contained"
          startIcon={<IoMdAdd />}
          onClick={() => setShowAddDialog(true)}
          sx={{
            backgroundColor: '#ff7300',
            '&:hover': { backgroundColor: '#e56700' },
          }}
        >
          Add Alarm
        </Button>
      </Box>

      {/* Alarm list */}
      {alarms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(30, 30, 30, 0.7)' }}>
          <IoMdAlarm style={{ fontSize: 48, color: '#666', marginBottom: 8 }} />
          <Typography color="text.secondary">
            No alarms set. Tap "Add Alarm" to create one.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ background: 'rgba(30, 30, 30, 0.7)' }}>
          <List>
            {alarms.map((alarm, index) => (
              <Box key={alarm.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 2 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 300,
                          color: alarm.enabled ? '#F4F3F2' : '#666',
                        }}
                      >
                        {formatTime(alarm.hour, alarm.minute, is24Hour)}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {alarm.label && (
                          <Typography
                            variant="body2"
                            sx={{ color: alarm.enabled ? 'text.secondary' : '#555' }}
                          >
                            {alarm.label}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {alarm.days.length === 0 ? (
                            <Chip
                              label="One-time"
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                color: alarm.enabled ? '#ff7300' : '#555',
                                borderColor: alarm.enabled ? '#ff7300' : '#555',
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
                                  color: alarm.enabled ? '#ff7300' : '#555',
                                  borderColor: alarm.enabled ? '#ff7300' : '#555',
                                }}
                                variant="outlined"
                              />
                            ))
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={alarm.enabled}
                      onChange={() => handleToggleAlarm(alarm.id)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#ff7300' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ff7300',
                        },
                      }}
                    />
                    <IconButton
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      sx={{ color: '#ff4444' }}
                    >
                      <IoMdTrash />
                    </IconButton>
                  </ListItemSecondaryAction>
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
          sx: { background: 'rgba(30, 30, 30, 0.95)', minWidth: 350 },
        }}
      >
        <DialogTitle>Set New Alarm</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, my: 2 }}>
            <TextField
              value={newHour}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setNewHour(val);
              }}
              inputProps={{
                style: { textAlign: 'center', fontSize: '2rem', width: 60 },
                maxLength: 2,
              }}
              variant="outlined"
              size="small"
              placeholder="HH"
            />
            <Typography variant="h3" sx={{ fontWeight: 300 }}>:</Typography>
            <TextField
              value={newMinute}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setNewMinute(val);
              }}
              inputProps={{
                style: { textAlign: 'center', fontSize: '2rem', width: 60 },
                maxLength: 2,
              }}
              variant="outlined"
              size="small"
              placeholder="MM"
            />
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
                      color: '#666',
                      '&.Mui-checked': { color: '#ff7300' },
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddAlarm}
            variant="contained"
            sx={{
              backgroundColor: '#ff7300',
              '&:hover': { backgroundColor: '#e56700' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Firing Alarm Dialog */}
      <Dialog
        open={firingAlarm !== null}
        onClose={handleDismissAlarm}
        PaperProps={{
          sx: {
            background: 'rgba(30, 30, 30, 0.95)',
            minWidth: 350,
            textAlign: 'center',
          },
        }}
      >
        <DialogContent sx={{ pt: 4 }}>
          <IoMdNotifications
            style={{
              fontSize: 64,
              color: '#ff7300',
              animation: 'shake 0.5s ease-in-out infinite',
            }}
          />
          <Typography variant="h3" sx={{ mt: 2, fontWeight: 300 }}>
            {firingAlarm && formatTime(firingAlarm.hour, firingAlarm.minute, is24Hour)}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            {firingAlarm?.label || 'Alarm'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleDismissAlarm}
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#ff7300',
              '&:hover': { backgroundColor: '#e56700' },
              px: 4,
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