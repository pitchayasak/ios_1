import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { T } from '@/context/store';

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const c = active ? T.accent : T.inactive;
  const s = 24;

  if (name === 'index') { // Daily
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Rect x="3" y="4" width="20" height="18" rx="3" stroke={c} strokeWidth="1.8" fill={active ? c + '18' : 'none'} />
        <Path d="M3 9h20" stroke={c} strokeWidth="1.8" />
        <Path d="M8 3v3M18 3v3" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <Circle cx="13" cy="17" r="3" fill={active ? c : 'none'} stroke={active ? 'none' : c} strokeWidth="1.5" />
      </Svg>
    );
  }
  if (name === 'monthly') {
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Rect x="3" y="4" width="20" height="18" rx="3" stroke={c} strokeWidth="1.8" fill={active ? c + '18' : 'none'} />
        <Path d="M3 9h20" stroke={c} strokeWidth="1.8" />
        <Path d="M8 3v3M18 3v3" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <Rect x="6.5" y="12.5" width="3" height="2.5" rx="0.5" fill={c} />
        <Rect x="11.5" y="12.5" width="3" height="2.5" rx="0.5" fill={c} opacity="0.6" />
        <Rect x="16.5" y="12.5" width="3" height="2.5" rx="0.5" fill={c} />
        <Rect x="6.5" y="17" width="3" height="2.5" rx="0.5" fill={c} opacity="0.4" />
        <Rect x="11.5" y="17" width="3" height="2.5" rx="0.5" fill={c} />
        <Rect x="16.5" y="17" width="3" height="2.5" rx="0.5" fill={c} opacity="0.4" />
      </Svg>
    );
  }
  if (name === 'history') {
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Rect x="3" y="5" width="20" height="17" rx="3" stroke={c} strokeWidth="1.8" fill={active ? c + '18' : 'none'} />
        <Path d="M3 10h20" stroke={c} strokeWidth="1.8" />
        <Rect x="7" y="13" width="3" height="3" rx="0.6" fill={c} />
        <Rect x="12" y="13" width="3" height="3" rx="0.6" fill={c} opacity="0.6" />
        <Rect x="17" y="13" width="3" height="3" rx="0.6" fill={c} />
        <Rect x="7" y="17.5" width="3" height="3" rx="0.6" fill={c} opacity="0.3" />
        <Rect x="12" y="17.5" width="3" height="3" rx="0.6" fill={c} />
      </Svg>
    );
  }
  if (name === 'tasks') {
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Rect x="4" y="4" width="18" height="18" rx="4" stroke={c} strokeWidth="1.8" fill={active ? c + '18' : 'none'} />
        <Path d="M9 13l3 3 5-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'settings') {
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Circle cx="13" cy="13" r="3" stroke={c} strokeWidth="1.8" fill={active ? c + '18' : 'none'} />
        <Path d="M13 2.5v2.8M13 20.7v2.8M23.5 13h-2.8M5.3 13H2.5M20.4 5.6l-2 2M7.6 18.4l-2 2M20.4 20.4l-2-2M7.6 7.6l-2-2"
          stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }
  return null;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <View style={styles.tabBg} />,
        tabBarActiveTintColor: T.accent,
        tabBarInactiveTintColor: T.inactive,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} active={focused} />,
      })}
    >
      <Tabs.Screen name="index"    options={{ title: 'Daily' }} />
      <Tabs.Screen name="monthly"  options={{ title: 'Monthly' }} />
      <Tabs.Screen name="history"  options={{ title: 'History' }} />
      <Tabs.Screen name="tasks"    options={{ title: 'Tasks' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#080808',
    borderTopColor: T.cardBorder,
    borderTopWidth: 0.5,
    height: 84,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tabBg: { flex: 1, backgroundColor: '#080808' },
  label:  { fontWeight: '700', fontSize: 10, letterSpacing: 0.2 },
});
