const admin = require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const readline = require('readline');

// WARNING: You must have 'ring-us-4265b-firebase-adminsdk-fbsvc-216b7b32ae.json' 
// saved in the root directory for this to work.
const serviceAccount = require('../ring-us-4265b-firebase-adminsdk-fbsvc-216b7b32ae.json'); 
initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

/**
 * Creates a shared alarm in the 'sharedAlarms' collection, matching the structure of useSharedAlarms.ts
 */
async function createSharedAlarm(ownerUid, ownerName, friendUids, friendNames, alarmConfig) {
    const participants = [ownerUid, ...friendUids];
    const participantNames = [ownerName, ...friendNames];

    const alarmRef = db.collection('sharedAlarms').doc();
    const alarmPayload = {
        ownerId: ownerUid,
        ownerName: ownerName,
        hour: alarmConfig.hour,
        minute: alarmConfig.minute,
        label: alarmConfig.label,
        enabled: true,
        days: alarmConfig.days || [],
        participants: participants,
        participantNames: participantNames,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await alarmRef.set(alarmPayload);
    console.log(`[Success] Shared alarm created! ID: ${alarmRef.id} | Time: ${alarmConfig.hour}:${String(alarmConfig.minute).padStart(2, '0')} | Participants: ${participants.length}`);
}

async function runTestScript(userEmail, alarmsToCreate = 30000, startHour = 8, startMinute = 0) {
    console.log(`\n--- Starting Shared Alarm Test Script ---`);
    console.log(`Looking up user account for email: ${userEmail}...`);

    let userRecord;
    try {
        userRecord = await admin.auth().getUserByEmail(userEmail);
    } catch (e) {
        console.error(`\n[Error] Could not find user by email ${userEmail}. Error: ${e.message}`);
        return;
    }

    const ownerUid = userRecord.uid;
    const ownerName = userRecord.displayName || 'Test User';
    
    console.log(`Found User: ${ownerName} (${ownerUid})`);
    
    // Fetch the user's document to get their friends list
    const userDoc = await db.collection('users').doc(ownerUid).get();
    if (!userDoc.exists) {
        console.error(`[Error] User document not found in 'users' collection for UID ${ownerUid}`);
        return;
    }
    
    const userData = userDoc.data();
    const friendUids = userData.friends || [];
    
    if (friendUids.length === 0) {
        console.warn("\n[Warning] This user has no friends linked. Alarms will be created but only the owner will be a participant.");
    } else {
        console.log(`Found ${friendUids.length} linked friends.`);
    }

    // Fetch friend names (Optional but keeps data clean like the real app)
    const friendNames = [];
    for (const fUid of friendUids) {
        const fDoc = await db.collection('users').doc(fUid).get();
        if (fDoc.exists) {
            friendNames.push(fDoc.data().displayName || 'Unknown Friend');
        } else {
            friendNames.push('Unknown Friend');
        }
    }

    console.log(`\n--- Generating ${alarmsToCreate} shared alarms starting at ${startHour}:${String(startMinute).padStart(2, '0')} ---`);

    let currentHour = startHour;
    let currentMinute = startMinute;

    for (let i = 0; i < alarmsToCreate; i++) {
        const alarmConfig = {
            hour: currentHour,
            minute: currentMinute,
            label: `Test Sync Alarm ${i + 1} (${currentHour}:${String(currentMinute).padStart(2, '0')})`,
            days: [] // One-time alarm
        };

        await createSharedAlarm(ownerUid, ownerName, friendUids, friendNames, alarmConfig);

        // Increment by 30 minutes
        currentMinute += 30;
        if (currentMinute >= 60) {
            currentMinute -= 60;
            currentHour = (currentHour + 1) % 24;
        }
    }

    console.log('\n--- Test Script Finished Successfully ---');
    console.log('Check your app UI (Alarms page), the shared alarms should now appear in the list.');
}

// Simple CLI prompt to get user email
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Welcome to the Alarm Creation Test Script");
console.log("This will create 10 shared alarms linked to your account and sync them with all your friends.");

rl.question("\nEnter your account email address (the one you are logged in with): ", (email) => {
    if (!email || email.trim() === '') {
        console.log("Email cannot be empty.");
        rl.close();
        process.exit(1);
    }
    
    runTestScript(email.trim()).then(() => {
        rl.close();
        process.exit(0);
    }).catch(err => {
        console.error('\n!!! TEST SCRIPT FAILED !!!', err.message);
        rl.close();
        process.exit(1);
    });
});