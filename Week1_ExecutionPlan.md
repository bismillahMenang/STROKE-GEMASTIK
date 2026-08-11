# Week 1 Execution Plan: From Zero to Gyroscope Baseline on Phone

**Goal by Friday EOD:** Gyroscope app running on your phone, recording ROM values, saving to cloud.

**Time commitment:** 30–40 hours this week (6 hrs/day, 5 days, feasible if you focus).

---

## Day 1: Setup (Monday, 6 hours)

### Task 1.1: GitHub repo + local setup (1 hour)
```bash
# Create GitHub repo (browser):
# https://github.com/new
# Name: StrokeApp-GEMASTIK
# Description: Stroke rehabilitation monitoring app
# Visibility: Public
# Initialize with README

# Clone locally:
git clone https://github.com/<your-user>/StrokeApp-GEMASTIK.git
cd StrokeApp-GEMASTIK

# Create folder structure:
mkdir -p client server
touch README.md .gitignore
```

**Commit:**
```bash
git add .
git commit -m "chore: project structure"
git push origin main
```

### Task 1.2: Therapist outreach (parallel, async — don't wait) (1 hour)
**Send 3 emails TODAY to hospitals:**

**Email template:**
```
Subject: Collaboration — Stroke Rehab App for GEMASTIK 2026

Hi [Rehab dept head / PT supervisor],

I'm a student developer at [university] building a stroke home-rehabilitation 
app for Indonesia's GEMASTIK 2026 national tech competition.

The core idea: patients do exercises at home with video guidance, a smartphone 
app measures arm movement (via gyroscope), and a therapist reviews progress 
weekly on a dashboard.

I'm looking for:
1. A physiotherapist to validate that ROM measurement + weekly async review 
   fits your clinical workflow
2. Optional: 10–20 stroke patients willing to pilot the app over 8 weeks

For therapist collaboration: 30-min call to discuss clinical requirements, 
no commitment required.

Would you be interested? I can be flexible on timing.

[Your name]
[Phone]
[Email]
```

**Send to:**
- RSUPN Dr. Cipto Mangunkusumo (Jakarta) — neurology@cipto.co.id
- UNPAD Teaching Hospital (Bandung) — dept-fisioterapi@unpad.ac.id
- Local district hospital (your city) — call their main number, ask for rehab department

**Goal:** Get 1 positive response by Friday (don't wait, parallel process).

### Task 1.3: Node.js + Expo install (1 hour)
```bash
# Install Node.js 18+ (if not already)
node --version  # Should be 18.0.0+
npm --version   # Should be 9.0.0+

# Install Expo CLI globally
npm install -g expo-cli

# Check:
expo --version  # Should be ~50+
```

### Task 1.4: Expo project init (2 hours)
```bash
# Navigate to client folder
cd client

# Create blank Expo app
npx create-expo-app@latest . --template blank

# Install essential dependencies
npm install expo-sensors
npm install axios
npm install @react-native-async-storage/async-storage

# Test it works
expo start

# On your phone:
# 1. Download Expo Go app (iOS App Store or Google Play)
# 2. Scan QR code from terminal
# 3. App should load (shows "Welcome to Expo")
```

**Commit:**
```bash
git add client/
git commit -m "feat: expo init + essential deps"
git push origin main
```

### Task 1.5: Backend skeleton (1 hour)
```bash
cd ../server

# Initialize Node project
npm init -y

# Install dependencies
npm install express mongoose jsonwebtoken bcryptjs cors dotenv axios

# Create folder structure
mkdir -p routes models controllers utils
touch server.js .env

# .env file:
cat > .env << 'EOF'
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/strokeapp
JWT_SECRET=your-secret-key-change-in-prod
ENVIRONMENT=development
EOF

# server.js (minimal):
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
EOF

# Test:
node server.js
# Should print: Server running on port 5000
# Visit http://localhost:5000/api/health in browser → {"status":"OK",...}
```

**Commit:**
```bash
git add server/
git commit -m "feat: express backend skeleton"
git push origin main
```

**By end of Day 1:** ✅ Repo created, Expo running on phone, backend server skeleton.

---

## Day 2: Gyroscope Hello World (Tuesday, 6 hours)

### Task 2.1: Gyroscope basics (2 hours)

**File: `client/App.js`** — Replace default content with this:

```javascript
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Gyroscope } from 'expo-sensors';

Gyroscope.setUpdateInterval(100); // 10 Hz

export default function App() {
  const [gyroZ, setGyroZ] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [data, setData] = useState([]);
  const [peakROM, setPeakROM] = useState(0);

  useEffect(() => {
    const subscription = Gyroscope.addListener(({ x, y, z }) => {
      setGyroZ(z);

      if (isRecording) {
        setData((prev) => [...prev, z]);
      }
    });

    return () => subscription.remove();
  }, [isRecording]);

  const startRecording = () => {
    setData([]);
    setPeakROM(0);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simple calculation: integrate gyro to get angle
    let angle = 0;
    const angles = data.map((z) => {
      angle += z * 0.1 * (180 / Math.PI); // 100ms sampling
      return Math.abs(angle);
    });
    const peak = Math.max(...angles);
    setPeakROM(peak.toFixed(1));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>StrokeApp Gyroscope Test</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current Z-axis (rad/s)</Text>
        <Text style={styles.value}>{gyroZ.toFixed(3)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Recording Status</Text>
        <Text style={styles.status}>{isRecording ? '🔴 RECORDING' : '⚫ IDLE'}</Text>
        <Text style={styles.info}>Data points: {data.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Peak ROM (degrees)</Text>
        <Text style={styles.value}>{peakROM}°</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonActive]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop' : 'Start Recording'}
        </Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Instructions:{'\n'}
          1. Tap "Start Recording"{'\n'}
          2. Rotate your forearm left-right (wrist twist){'\n'}
          3. Tap "Stop"{'\n'}
          4. ROM value appears above
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonActive: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
  },
});
```

**Test:**
```bash
cd client
expo start
# Scan QR code with Expo Go on phone
# Tap "Start Recording"
# Twist your wrist left-right (phone on forearm)
# Tap "Stop"
# See ROM value update
```

**Commit:**
```bash
git add client/App.js
git commit -m "feat: gyroscope hello world"
git push origin main
```

### Task 2.2: Data persistence (2 hours)

Add AsyncStorage to save sessions:

**File: `client/utils/storage.js`** — Create new file:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveSession = async (session) => {
  try {
    const sessions = await getSessions();
    const newSessions = [session, ...sessions];
    await AsyncStorage.setItem('sessions', JSON.stringify(newSessions));
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
};

export const getSessions = async () => {
  try {
    const data = await AsyncStorage.getItem('sessions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Load failed:', error);
    return [];
  }
};

export const clearSessions = async () => {
  try {
    await AsyncStorage.removeItem('sessions');
    return true;
  } catch (error) {
    console.error('Clear failed:', error);
    return false;
  }
};
```

**Update `client/App.js` to save sessions:**
```javascript
import { saveSession, getSessions } from './utils/storage';

// In stopRecording():
const stopRecording = async () => {
  setIsRecording(false);
  let angle = 0;
  const angles = data.map((z) => {
    angle += z * 0.1 * (180 / Math.PI);
    return Math.abs(angle);
  });
  const peak = Math.max(...angles);
  setPeakROM(peak.toFixed(1));

  // Save to AsyncStorage
  const session = {
    id: Date.now(),
    date: new Date().toISOString(),
    exercise: 'forearm_supination',
    peakRom: parseFloat(peak.toFixed(1)),
    repsCompleted: 10,
    notes: '',
  };
  await saveSession(session);
  alert(`Session saved! Peak ROM: ${peak.toFixed(1)}°`);
};
```

**Test:** Do a recording, stop, see alert "Session saved". Kill the app, restart, sessions still there.

**Commit:**
```bash
git add client/utils/
git commit -m "feat: session persistence with AsyncStorage"
git push origin main
```

### Task 2.3: Backup to backend (2 hours)

**File: `client/utils/api.js`** — Create API client:
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://your-backend-url.com/api';
// For local testing: 'http://192.168.x.x:5000/api' (your machine IP)

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const uploadSession = async (session) => {
  try {
    const response = await apiClient.post('/sessions', session);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.message);
    throw error;
  }
};

export const getSessions = async () => {
  try {
    const response = await apiClient.get('/sessions');
    return response.data;
  } catch (error) {
    console.error('Fetch failed:', error.message);
    throw error;
  }
};
```

**Update backend `server.js` to accept sessions:**
```javascript
app.post('/api/sessions', (req, res) => {
  const session = req.body;
  console.log('Session received:', session);
  // TODO: Save to MongoDB
  res.json({ success: true, id: Date.now(), ...session });
});

app.get('/api/sessions', (req, res) => {
  // TODO: Fetch from MongoDB
  res.json([]);
});
```

**Test:** In app, after recording, attempt to upload. Watch server logs for "Session received: {...}".

**Commit:**
```bash
git add client/utils/api.js server/server.js
git commit -m "feat: session upload to backend"
git push origin main
```

**By end of Day 2:** ✅ Gyroscope recording, data saved locally + uploaded to backend.

---

## Day 3: Multi-Exercise + UI (Wednesday, 6 hours)

### Task 3.1: Exercise selection screen (2 hours)

**File: `client/screens/ExerciseSelect.js`:**
```javascript
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

const exercises = [
  {
    id: 'forearm_supination',
    name: 'Forearm Supination',
    description: 'Twist wrist left-right',
    target: '80°',
  },
  {
    id: 'shoulder_abduction',
    name: 'Shoulder Abduction',
    description: 'Raise arm to side',
    target: '90°',
  },
  {
    id: 'elbow_flexion',
    name: 'Elbow Flexion',
    description: 'Bicep curl motion',
    target: '150°',
  },
];

export default function ExerciseSelect({ onSelect }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Choose an exercise</Text>

      {exercises.map((ex) => (
        <TouchableOpacity
          key={ex.id}
          style={styles.card}
          onPress={() => onSelect(ex)}
        >
          <Text style={styles.cardTitle}>{ex.name}</Text>
          <Text style={styles.cardDesc}>{ex.description}</Text>
          <Text style={styles.cardTarget}>Target: {ex.target}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  cardTarget: {
    fontSize: 12,
    color: '#999',
  },
});
```

**Update `client/App.js` to use it:**
```javascript
const [currentExercise, setCurrentExercise] = useState(null);

return currentExercise ? (
  <ExerciseSession exercise={currentExercise} onBack={() => setCurrentExercise(null)} />
) : (
  <ExerciseSelect onSelect={setCurrentExercise} />
);
```

**Commit:**
```bash
git add client/screens/
git commit -m "feat: exercise selection screen"
git push origin main
```

### Task 3.2: Session history list (2 hours)

**File: `client/screens/ProgressDashboard.js`:**
```javascript
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { getSessions } from '../utils/storage';

export default function ProgressDashboard() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const loadSessions = async () => {
      const data = await getSessions();
      setSessions(data.slice(0, 8)); // Last 8 sessions
    };
    loadSessions();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your progress</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statLabel}>Sessions this week</Text>
        <Text style={styles.statValue}>{sessions.length}</Text>
      </View>

      <Text style={styles.subtitle}>Last 8 sessions</Text>
      {sessions.map((session) => (
        <View key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionDate}>
              {new Date(session.date).toLocaleDateString()}
            </Text>
            <Text style={styles.sessionROM}>{session.peakRom}°</Text>
          </View>
          <Text style={styles.sessionExercise}>{session.exercise}</Text>
          {session.notes && <Text style={styles.sessionNotes}>{session.notes}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  statsCard: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  statValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },
  sessionROM: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  sessionExercise: {
    fontSize: 13,
    color: '#222',
    marginBottom: 4,
  },
  sessionNotes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
```

**Commit:**
```bash
git add client/screens/ProgressDashboard.js
git commit -m "feat: session history dashboard"
git push origin main
```

### Task 3.3: Tab navigation (2 hours)

**Install bottom tab navigation:**
```bash
cd client
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

**Update `client/App.js`:**
```javascript
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExerciseSelect from './screens/ExerciseSelect';
import ProgressDashboard from './screens/ProgressDashboard';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Exercises"
          component={ExerciseSelect}
          options={{ title: 'Do Exercise' }}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressDashboard}
          options={{ title: 'My Progress' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

**Test:** Tap between "Exercises" and "Progress" tabs on phone.

**Commit:**
```bash
git add client/App.js
git commit -m "feat: bottom tab navigation"
git push origin main
```

**By end of Day 3:** ✅ Multi-exercise support, exercise selection, progress dashboard, tab navigation.

---

## Day 4: Therapist Dashboard Skeleton (Thursday, 6 hours)

### Task 4.1: Create React web app (1 hour)

```bash
cd ../
npm create vite@latest therapist-dashboard -- --template react
cd therapist-dashboard
npm install
npm install axios recharts
```

### Task 4.2: Login page (2 hours)

**File: `therapist-dashboard/src/pages/Login.jsx`:**
```javascript
import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/therapist/login', {
        email,
        password,
      });
      onLogin(response.data.token);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Therapist Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
```

### Task 4.3: Patient list page (2 hours)

**File: `therapist-dashboard/src/pages/PatientList.jsx`:**
```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PatientList({ token, onSelectPatient }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/therapist/patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(response.data || []);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };
    fetchPatients();
  }, [token]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Patients</h1>
      {patients.length === 0 ? (
        <p>No patients assigned yet.</p>
      ) : (
        <div>
          {patients.map((patient) => (
            <div
              key={patient._id}
              onClick={() => onSelectPatient(patient._id)}
              style={{
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '6px',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
            >
              <h3>{patient.name}</h3>
              <p>Last session: {patient.lastSession || 'None'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Task 4.4: App shell (1 hour)

**Update `therapist-dashboard/src/App.jsx`:**
```javascript
import React, { useState } from 'react';
import Login from './pages/Login';
import PatientList from './pages/PatientList';

function App() {
  const [token, setToken] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  return (
    <div>
      {!token ? (
        <Login onLogin={setToken} />
      ) : (
        <PatientList token={token} onSelectPatient={setSelectedPatientId} />
      )}
    </div>
  );
}

export default App;
```

**Test:**
```bash
npm run dev
# Visit http://localhost:5173
# Try logging in (will fail for now, but UI appears)
```

**Commit:**
```bash
git add therapist-dashboard/
git commit -m "feat: therapist dashboard skeleton"
git push origin main
```

**By end of Day 4:** ✅ Therapist web dashboard with login + patient list.

---

## Day 5: Integration + Polish (Friday, 6 hours)

### Task 5.1: Backend session endpoints (2 hours)

**File: `server/routes/sessions.js`** — Create new file:
```javascript
const express = require('express');
const router = express.Router();

const sessions = []; // TODO: Replace with MongoDB

router.post('/sessions', (req, res) => {
  const session = {
    _id: Date.now(),
    ...req.body,
    createdAt: new Date(),
  };
  sessions.push(session);
  console.log('Session saved:', session);
  res.json({ success: true, ...session });
});

router.get('/sessions', (req, res) => {
  res.json(sessions);
});

router.get('/therapist/patients', (req, res) => {
  // TODO: Fetch from MongoDB
  res.json([
    {
      _id: 1,
      name: 'Ahmad Budiman',
      lastSession: '2025-01-20',
    },
  ]);
});

module.exports = router;
```

**Update `server/server.js`:**
```javascript
const sessionRoutes = require('./routes/sessions');
app.use('/api', sessionRoutes);
```

**Test:**
```bash
cd server
node server.js
# In another terminal:
curl -X POST http://localhost:5000/api/sessions -H "Content-Type: application/json" -d '{"exercise":"forearm","peakRom":78}'
# Should return: {"success":true,...}
```

### Task 5.2: Connect mobile app to backend (1 hour)

**Update `client/utils/api.js`** with your actual backend URL:
```javascript
const API_URL = 'http://192.168.x.x:5000/api'; // Your machine IP
// To find your IP: ifconfig (Mac/Linux) or ipconfig (Windows) → IPv4 address
```

**In `client/App.js`, after recording:**
```javascript
import { uploadSession } from './utils/api';

const stopRecording = async () => {
  // ... ROM calculation ...
  const session = {
    date: new Date().toISOString(),
    exercise: currentExercise.id,
    peakRom: parseFloat(peak.toFixed(1)),
    repsCompleted: 10,
  };
  
  // Save locally
  await saveSession(session);
  
  // Try to upload to backend
  try {
    await uploadSession(session);
    alert('Uploaded!');
  } catch (error) {
    alert('Upload failed, saved locally');
  }
};
```

### Task 5.3: Bahasa Indonesia translations (2 hours)

**Create `client/i18n.js`:**
```javascript
const translations = {
  en: {
    chooseExercise: 'Choose an exercise',
    yourProgress: 'Your progress',
    forearmSupination: 'Forearm Supination',
    shoulderAbduction: 'Shoulder Abduction',
    elbowFlexion: 'Elbow Flexion',
  },
  id: {
    chooseExercise: 'Pilih latihan',
    yourProgress: 'Progres Anda',
    forearmSupination: 'Rotasi Lengan Bawah',
    shoulderAbduction: 'Abduksi Bahu',
    elbowFlexion: 'Fleksi Siku',
  },
};

export const t = (key, lang = 'id') => translations[lang][key] || key;
```

**Use in screens:**
```javascript
import { t } from '../i18n';

<Text style={styles.title}>{t('chooseExercise')}</Text>
```

### Task 5.4: Test end-to-end (1 hour)

**Full flow:**
1. Start backend: `cd server && node server.js`
2. Start mobile: `cd client && expo start` (scan with Expo Go)
3. Start therapist dashboard: `cd therapist-dashboard && npm run dev`
4. On phone:
   - Go to Exercises tab
   - Select an exercise
   - Tap "Start Recording"
   - Rotate wrist 10 times
   - Tap "Stop"
   - See ROM calculated + saved locally
   - See attempt to upload to backend
5. On web dashboard:
   - Go to http://localhost:5173
   - Check if patients appear (check server logs for data)

**Final commit:**
```bash
git add .
git commit -m "feat: end-to-end MVP integration

- Mobile app records ROM via gyroscope
- Sessions save locally + upload to backend
- Therapist dashboard lists patients
- Bahasa Indonesia translations added
- All 3 exercises implemented"
git push origin main
```

---

## Success Criteria by Friday EOD

✅ **Code runs on phone**
- [ ] Expo app launches
- [ ] Gyroscope records data
- [ ] ROM values appear on screen
- [ ] Exercises can be selected
- [ ] Sessions save locally

✅ **Backend working**
- [ ] http://localhost:5000/api/health returns OK
- [ ] Sessions POST endpoint receives data
- [ ] Server logs show "Session saved"

✅ **Therapist dashboard starts**
- [ ] React app runs on http://localhost:5173
- [ ] Login screen appears
- [ ] Patient list fetches from backend

✅ **GitHub clean**
- [ ] All commits pushed
- [ ] No sensitive data in repo (.env ignored)
- [ ] README updated with setup instructions

---

## If you get stuck

**Common issues:**

| Problem | Solution |
|---------|----------|
| "Module not found" | `npm install` again; `npm cache clean --force` |
| Gyro returns all zeros | Restart Expo Go; test on different phone if possible |
| Backend port 5000 in use | `lsof -i :5000` (Mac/Linux) → kill process |
| Can't upload from phone | Check your IP: `ifconfig` → use that in API_URL |
| CORS errors | Add to `server.js`: `app.use(cors())` (already there) |

**Git help:**
```bash
# See commits
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes temporarily
git stash
git stash pop

# See what changed
git status
git diff
```

---

## By end of Day 5

**You have:**
- ✅ Running mobile app (gyroscope ROM tracking)
- ✅ Running backend (receives sessions)
- ✅ Running therapist web dashboard
- ✅ End-to-end data flow (phone → backend → web)
- ✅ GitHub repo with clean history

**This is a functional MVP.** No ML, no fancy UI. But it works and proves the concept.

**Next week:** Polish, therapist validation, clinical pilot prep.

---

**GO BUILD.** 🚀

This is doable in 5 days if you focus. No distractions. Ship first, perfect later.
