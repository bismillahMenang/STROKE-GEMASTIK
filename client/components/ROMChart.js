import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { EXERCISES } from '../utils/constants';
import { useTheme } from '../theme/ThemeContext';

export default function ROMChart({ sessions, exerciseKey }) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const exercise = EXERCISES[exerciseKey];
  const filtered = sessions.filter((session) => session.exercise === exerciseKey).slice(0, 8).reverse();

  if (filtered.length <= 1) {
    return <View style={[styles.empty, { backgroundColor: colors.card }]}><Text style={[styles.emptyText, { color: colors.body }]}>Mulai latihan pertama untuk melihat progres.</Text></View>;
  }

  const labels = filtered.map((session) => new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
  const values = filtered.map((session) => session.peakRom || 0);
  const targets = filtered.map(() => exercise.targetRom);
  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(${colors.accentRgb}, ${opacity})`,
    decimalPlaces: 0,
    labelColor: () => colors.body,
    propsForBackgroundLines: { stroke: colors.line },
  };

  return (
    <LineChart
      bezier
      chartConfig={chartConfig}
      data={{
        labels,
        datasets: [
          { data: values, color: () => colors.accent, strokeWidth: 3 },
          { data: targets, color: () => colors.warn, strokeWidth: 1, withDots: false },
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

const styles = StyleSheet.create({
  chart: { borderRadius: 12, marginVertical: 8 },
  empty: { alignItems: 'center', borderRadius: 12, minHeight: 140, justifyContent: 'center', padding: 20 },
  emptyText: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
});