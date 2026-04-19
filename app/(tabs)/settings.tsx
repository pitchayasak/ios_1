import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.iconBox}>
            <Svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="3.2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" />
              <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
                stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.sub}>Notifications, iCloud sync, units and theme will live here.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  sub: { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 6, maxWidth: 260 },
});
