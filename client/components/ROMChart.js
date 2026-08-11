import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { EXERCISES } from '../utils/constants';

export default function ROMChart({ sessions, exerciseKey }) {
  const { width } = useWindowDimensions();
  const exercise = EXERCISES[exerciseKey];
  const filtered = sessions.filter((session) => session.exercise === exerciseKey).slice(0, 8).reverse();

  if (filtered.length <= 1) {
    return <View style={styles.empty}><Text style={styles.emptyText}>Mulai latihan pertama untuk melihat progres.</Text></View>;
  }

  const labels = filtered.map((session) => new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
  const values = filtered.map((session) => session.peakRom || 0);
  const targets = filtered.map(() => exercise.targetRom);

  return (
    <LineChart
      bezier
      chartConfig={chartConfig}
      data={{
        labels,
        datasets: [
          { data: values, color: () => '#0F9E75', strokeWidth: 3 },
          { data: targets, color: () => '#D85A30', strokeWidth: 1, withDots: false },
        ],
        legend: ['ROM Anda', `Target ${exercise.targetRom}°`],
      }}
      fromZero
      height={230}
      style={styles.chart}
      width={Math.max(280, width - 40)}
      yAxisSuffix="°"
    />
  );
}

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(15, 158, 117, ${opacity})`,
  decimalPlaces: 0,
  labelColor: () => '#5F5E5A',
  propsForBackgroundLines: { stroke: '#D3D1C7' },
};

const styles = StyleSheet.create({
  chart: { borderRadius: 12, marginVertical: 8 },
  empty: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, minHeight: 140, justifyContent: 'center', padding: 20 },
  emptyText: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
