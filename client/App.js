import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthScreen from './screens/AuthScreen';
import { syncPendingAssessments, syncPendingSessions, TOKEN_KEY } from './api/client';
import ExerciseSelect from './screens/ExerciseSelect';
import ExerciseSession from './screens/ExerciseSession';
import ProgressDashboard from './screens/ProgressDashboard';
import FaceCheckScreen from './screens/FaceCheckScreen';
import SpeechCheckScreen from './screens/SpeechCheckScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(setToken).catch((error) => console.error('Failed to restore auth:', error)).finally(() => setReady(true));
  }, []);

  if (!ready) return <View><Text>Memuat PulihTrack...</Text></View>;
  if (!token) return <AuthScreen initialMessage={authMessage} onAuthenticated={(nextToken) => { setAuthMessage(''); setToken(nextToken); }} />;
  return <AuthenticatedApp onExpired={() => { AsyncStorage.removeItem(TOKEN_KEY); setAuthMessage('Sesi berakhir, silakan masuk kembali.'); setToken(null); }} />;
}

function AuthenticatedApp({ onExpired }) {
  useEffect(() => {
    let active = true;
    async function sync() {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken) return;
      try {
        await syncPendingSessions(storedToken);
        await syncPendingAssessments(storedToken);
      } catch (error) {
        if (error.response?.status === 401 && active) onExpired();
        else if (active) console.error('Background sync failed:', error.message);
      }
    }
    sync();
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') sync(); });
    return () => { active = false; subscription.remove(); };
  }, [onExpired]);

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Exercises" screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0F9E75', tabBarLabelStyle: { fontSize: 14 } }}>
        <Tab.Screen name="Exercises" component={ExerciseSelect} options={{ tabBarLabel: 'Latihan' }} />
        <Tab.Screen name="Progress" component={ProgressDashboard} options={{ tabBarLabel: 'Progres' }} />
        <Tab.Screen name="ExerciseSession" component={ExerciseSession} options={{ tabBarButton: () => null }} />
        <Tab.Screen name="FaceCheck" component={FaceCheckScreen} options={{ tabBarButton: () => null }} />
        <Tab.Screen name="SpeechCheck" component={SpeechCheckScreen} options={{ tabBarButton: () => null }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
