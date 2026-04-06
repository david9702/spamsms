import { StyleSheet, View } from 'react-native';
import { palette } from '../theme/tokens';

export function DecorativeBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={styles.topBlob} />
      <View style={styles.bottomBlob} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBlob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#A8E6DF',
    opacity: 0.45,
    top: -120,
    right: -80,
  },
  bottomBlob: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: palette.accentSoft,
    opacity: 0.9,
    bottom: -90,
    left: -60,
  },
});
