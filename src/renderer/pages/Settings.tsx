import React, { useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export function Settings() {
  const [is24Hour, setIs24Hour] = useState(false);

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

  return (
    <div>
      <h1>Settings</h1>
      <FormControlLabel
        control={<Switch checked={is24Hour} onChange={handleToggle} />}
        label="24-Hour Format"
      />
    </div>
  );
}