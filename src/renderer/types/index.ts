import { Timestamp } from 'firebase/firestore';

export interface AlarmData {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  days: number[]; // 0=Sun, 1=Mon, ... 6=Sat. Empty = one-time
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  friendCode: string;
  friends: string[];
  createdAt: Timestamp;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
}

export interface SharedAlarmData {
  id: string;
  ownerId: string;
  ownerName: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  days: number[];
  participants: string[];
  participantNames: string[];
  createdAt: Timestamp;
}
