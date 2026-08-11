import { useEffect, useRef, useState } from 'react';
import { Gyroscope } from 'expo-sensors';
import { SENSOR_INTERVAL_MS } from '../utils/constants';

export function GyroSensor({ active, onReading, onError }) {
  const callbackRef = useRef(onReading);
  const errorRef = useRef(onError);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    callbackRef.current = onReading;
  }, [onReading]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let subscription;

    async function start() {
      if (!active) return;
      try {
        const sensorAvailable = await Gyroscope.isAvailableAsync();
        if (!sensorAvailable) {
          setAvailable(false);
          errorRef.current?.(new Error('Gyroscope tidak tersedia di perangkat ini.'));
          return;
        }

        Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);
        subscription = Gyroscope.addListener((reading) => callbackRef.current?.(reading));
      } catch (error) {
        console.error('Gyroscope initialization failed:', error);
        errorRef.current?.(error);
      }
    }

    start();
    return () => {
      subscription?.remove();
    };
  }, [active]);

  if (!available) return null;
  return null;
}

export default GyroSensor;
