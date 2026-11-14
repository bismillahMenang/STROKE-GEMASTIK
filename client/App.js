import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthScreen from './screens/AuthScreen';
import { syncPendingSessions, TOKEN_KEY } from './api/client';
import ExerciseSelect from './screens/ExerciseSelect';
import ExerciseSession from './screens/ExerciseSession';
import ProgressDashboard from './screens/ProgressDashboard';
import TherapistNotesScreen from './screens/TherapistNotesScreen';
import OnboardingScreen, { ONBOARDED_KEY } from './screens/OnboardingScreen';
import GyroTestScreen from './screens/GyroTestScreen';
import { ThemeProvider } from './theme/ThemeContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}

function Root() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(TOKEN_KEY), AsyncStorage.getItem(ONBOARDED_KEY)])
      .then(([storedToken, storedOnboarded]) => {
        setToken(storedToken);
        setOnboarded(storedOnboarded === '1');
      })
      .catch((error) => console.error('Failed to restore app state:', error))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <View><Text>Memuat RehabTrack...</Text></View>;
  if (!token) return <AuthScreen initialMessage={authMessage} onAuthenticated={(nextToken) => { setAuthMessage(''); setToken(nextToken); }} />;
  if (!onboarded) return <OnboardingScreen onDone={() => setOnboarded(true)} />;
  return <AuthenticatedApp onExpired={() => { AsyncStorage.removeItem(TOKEN_KEY); setAuthMessage('Sesi berakhir, silakan masuk kembali.'); setToken(null); }} />;
}

function OnboardingReplay({ navigation }) {
  return <OnboardingScreen onDone={() => navigation.goBack()} />;
}

function AuthenticatedApp({ onExpired }) {
  useEffect(() => {
    let active = true;
    async function sync() {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken) return;
      try {
        await syncPendingSessions(storedToken);
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
        <Tab.Screen name="Notes" component={TherapistNotesScreen} options={{ tabBarLabel: 'Catatan' }} />
        <Tab.Screen name="ExerciseSession" component={ExerciseSession} options={{ tabBarButton: () => null }} />
        <Tab.Screen name="Onboarding" component={OnboardingReplay} options={{ tabBarButton: () => null }} />
        <Tab.Screen name="GyroTest" component={GyroTestScreen} options={{ tabBarButton: () => null }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}