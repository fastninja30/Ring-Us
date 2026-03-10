import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { IoMdAdd, IoMdTrash, IoMdAlarm } from 'react-icons/io';

interface AlarmData {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

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

export function Alarm() {
  const [alarms, setAlarms] = useState<AlarmData[]>(loadAlarms);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHour, setNewHour] = useState('08');
  const [newMinute, setNewMinute] = useState('00');
  const [currentTime, setCurrentTime] = useState(new Date());

  const is24Hour = localStorage.getItem('settings-is24Hour') === 'true';

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
      enabled: true,
    };

    const updated = [...alarms, newAlarm].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    setAlarms(updated);
    saveAlarms(updated);

    setNewHour('08');
    setNewMinute('00');
    setShowAddDialog(false);
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    saveAlarms(updated);
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
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        {formatTime(alarm.hour, alarm.minute, is24Hour)}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
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
    </Box>
  );
}