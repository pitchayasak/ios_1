import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const ACCENT = '#F4B740';
const INACTIVE = 'rgba(255,255,255,0.55)';

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const c = active ? ACCENT : INACTIVE;
  const s = 26;
  if (name === 'home') {
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Path d="M3 11L13 3l10 8v11a1 1 0 01-1 1h-5v-7h-8v7H4a1 1 0 01-1-1V11z"
          stroke={c} strokeWidth="1.8" strokeLinejoin="round"
          fill={active ? c + '22' : 'none'} />
      </Svg>
    );
  }
  if (name === 'history') {
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Rect x="3" y="5" width="20" height="17" rx="3" stroke={c} strokeWidth="1.8" fill={active ? c + '22' : 'none'} />
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
        <Rect x="4" y="4" width="18" height="18" rx="4" stroke={c} strokeWidth="1.8" fill={active ? c + '22' : 'none'} />
        <Path d="M9 13l3 3 5-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'settings') {
    return (
      <Svg width={s} height={s} viewBox="0 0 26 26" fill="none">
        <Circle cx="13" cy="13" r="3" stroke={c} strokeWidth="1.8" fill={active ? c + '22' : 'none'} />
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
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} active={focused} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(22,22,24,0.95)',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 0.5,
    height: 84,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tabBg: {
    flex: 1,
    backgroundColor: 'rgba(22,22,24,0.95)',
  },
  label: {
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.1,
  },
});
