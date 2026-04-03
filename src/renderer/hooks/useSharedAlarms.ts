import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { SharedAlarmData } from '../types';

export function useSharedAlarms() {
  const { user } = useAuth();
  const [sharedAlarms, setSharedAlarms] = useState<SharedAlarmData[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to shared alarms where current user is a participant
  useEffect(() => {
    if (!user) {
      setSharedAlarms([]);
      setLoading(false);
      if (!user) return () => {};
    }

    const q = query(
      collection(db, 'sharedAlarms'),
      where('participants', 'array-contains', user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alarms = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SharedAlarmData[];
      setSharedAlarms(alarms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createSharedAlarm = useCallback(
    async (
      alarm: { hour: number; minute: number; label: string; days: number[] },
      friendUids: string[],
      friendNames: string[],
    ) => {
      if (!user) throw new Error('Not authenticated');

      const participants = [user.uid, ...friendUids];
      const participantNames = [user.displayName || '', ...friendNames];

      await addDoc(collection(db, 'sharedAlarms'), {
        ownerId: user.uid,
        ownerName: user.displayName || '',
        hour: alarm.hour,
        minute: alarm.minute,
        label: alarm.label,
        enabled: true,
        days: alarm.days,
        participants,
        participantNames,
        createdAt: serverTimestamp(),
      });
    },
    [user],
  );

  const toggleSharedAlarm = useCallback(
    async (alarmId: string, enabled: boolean) => {
      await updateDoc(doc(db, 'sharedAlarms', alarmId), { enabled });
    },
    [],
  );

  const deleteSharedAlarm = useCallback(async (alarmId: string) => {
    await deleteDoc(doc(db, 'sharedAlarms', alarmId));
  }, []);

  const leaveSharedAlarm = useCallback(
    async (alarmId: string) => {
      if (!user) throw new Error('Not authenticated');

      await updateDoc(doc(db, 'sharedAlarms', alarmId), {
        participants: arrayRemove(user.uid),
        participantNames: arrayRemove(user.displayName || ''),
      });
    },
    [user],
  );

  const updateSharedAlarm = useCallback(
    async (
      alarmId: string,
      alarm: { hour: number; minute: number; label: string; days: number[] },
    ) => {
      await updateDoc(doc(db, 'sharedAlarms', alarmId), {
        hour: alarm.hour,
        minute: alarm.minute,
        label: alarm.label,
        days: alarm.days,
      });
    },
    [],
  );

  return {
    sharedAlarms,
    loading,
    createSharedAlarm,
    toggleSharedAlarm,
    deleteSharedAlarm,
    leaveSharedAlarm,
    updateSharedAlarm,
  };
}
