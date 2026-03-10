import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { UserProfile, FriendRequest } from '../types';

const FRIEND_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateFriendCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += FRIEND_CODE_CHARS.charAt(Math.floor(Math.random() * FRIEND_CODE_CHARS.length));
  }
  return code;
}

interface FriendInfo {
  uid: string;
  displayName: string;
}

interface FriendsContextType {
  userProfile: UserProfile | null;
  friends: FriendInfo[];
  pendingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  pendingRequestCount: number;
  loading: boolean;
  sendFriendRequest: (code: string) => Promise<string>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendUid: string) => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType>({
  userProfile: null,
  friends: [],
  pendingRequests: [],
  outgoingRequests: [],
  pendingRequestCount: 0,
  loading: true,
  sendFriendRequest: async () => '',
  acceptFriendRequest: async () => {},
  declineFriendRequest: async () => {},
  removeFriend: async () => {},
});

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load or create user profile
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setFriends([]);
      setPendingRequests([]);
      setOutgoingRequests([]);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setUserProfile({ id: user.uid, ...profileSnap.data() } as unknown as UserProfile);
        } else {
          // Auto-create profile for existing users
          let friendCode = generateFriendCode();
          // Check uniqueness
          const codeQuery = query(collection(db, 'users'), where('friendCode', '==', friendCode));
          const codeSnap = await getDocs(codeQuery);
          if (!codeSnap.empty) {
            friendCode = generateFriendCode(); // retry once
          }

          const newProfile: Omit<UserProfile, 'id'> = {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            friendCode,
            friends: [],
            createdAt: serverTimestamp() as any,
          };
          await setDoc(profileRef, newProfile);
          setUserProfile({ ...newProfile, createdAt: new Date() } as unknown as UserProfile);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Listen to profile changes (friends array updates)
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as UserProfile);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load friends details when profile.friends changes
  useEffect(() => {
    if (!userProfile?.friends?.length) {
      setFriends([]);
      return;
    }

    const loadFriends = async () => {
      const friendInfos: FriendInfo[] = [];
      for (const friendUid of userProfile.friends) {
        try {
          const friendDoc = await getDoc(doc(db, 'users', friendUid));
          if (friendDoc.exists()) {
            const data = friendDoc.data();
            friendInfos.push({
              uid: friendUid,
              displayName: data.displayName || 'Unknown',
            });
          }
        } catch {
          // Skip friends whose profiles can't be loaded
        }
      }
      setFriends(friendInfos);
    };

    loadFriends();
  }, [userProfile?.friends]);

  // Listen to incoming pending friend requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', user.uid),
      where('status', '==', 'pending'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FriendRequest[];
      setPendingRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to outgoing pending friend requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', user.uid),
      where('status', '==', 'pending'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FriendRequest[];
      setOutgoingRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  const sendFriendRequest = useCallback(async (code: string): Promise<string> => {
    if (!user || !userProfile) throw new Error('Not authenticated');

    const trimmedCode = code.trim().toUpperCase();

    // Look up user by friend code
    const q = query(collection(db, 'users'), where('friendCode', '==', trimmedCode));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error('No user found with that friend code.');
    }

    const targetDoc = snap.docs[0];
    const targetUid = targetDoc.id;
    const targetData = targetDoc.data();

    if (targetUid === user.uid) {
      throw new Error("You can't add yourself as a friend.");
    }

    // Check if already friends
    if (userProfile.friends?.includes(targetUid)) {
      throw new Error('You are already friends with this user.');
    }

    // Check for existing pending request
    const existingQuery = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', user.uid),
      where('toUid', '==', targetUid),
      where('status', '==', 'pending'),
    );
    const existingSnap = await getDocs(existingQuery);
    if (!existingSnap.empty) {
      throw new Error('Friend request already sent.');
    }

    // Check for incoming request from that user (auto-accept)
    const reverseQuery = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', targetUid),
      where('toUid', '==', user.uid),
      where('status', '==', 'pending'),
    );
    const reverseSnap = await getDocs(reverseQuery);
    if (!reverseSnap.empty) {
      // Auto-accept the existing incoming request
      await acceptFriendRequest(reverseSnap.docs[0].id);
      return targetData.displayName || 'User';
    }

    await addDoc(collection(db, 'friendRequests'), {
      fromUid: user.uid,
      toUid: targetUid,
      fromName: user.displayName || '',
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return targetData.displayName || 'User';
  }, [user, userProfile]);

  const acceptFriendRequest = useCallback(async (requestId: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    const requestRef = doc(db, 'friendRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) throw new Error('Request not found.');

    const requestData = requestSnap.data();
    const otherUid = requestData.fromUid === user.uid ? requestData.toUid : requestData.fromUid;

    const batch = writeBatch(db);

    // Update request status
    batch.update(requestRef, { status: 'accepted' });

    // Add each user to the other's friends array
    batch.update(doc(db, 'users', user.uid), {
      friends: arrayUnion(otherUid),
    });
    batch.update(doc(db, 'users', otherUid), {
      friends: arrayUnion(user.uid),
    });

    await batch.commit();
  }, [user]);

  const declineFriendRequest = useCallback(async (requestId: string): Promise<void> => {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'declined' });
  }, []);

  const removeFriend = useCallback(async (friendUid: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', user.uid), {
      friends: arrayRemove(friendUid),
    });
    batch.update(doc(db, 'users', friendUid), {
      friends: arrayRemove(user.uid),
    });
    await batch.commit();
  }, [user]);

  return (
    <FriendsContext.Provider
      value={{
        userProfile,
        friends,
        pendingRequests,
        outgoingRequests,
        pendingRequestCount: pendingRequests.length,
        loading,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  return useContext(FriendsContext);
}