import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ExerciseIcon } from '@/context/store';

// ─── Icon container ──────────────────────────────────────────
function IconBox({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.28 }]}>
      {children}
    </View>
  );
}

// ─── Pill icon ────────────────────────────────────────────────
export function PillIcon({ color = '#F4B740', size = 36 }) {
  const inner = size * 0.6;
  const gid = `pg-${color.replace('#', '')}`;
  return (
    <IconBox size={size}>
      <Svg width={inner} height={inner} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.95" />
            <Stop offset="1" stopColor={color} stopOpacity="0.65" />
          </LinearGradient>
        </Defs>
        <G rotation="-35" origin="12,12">
          <Rect x="3" y="9" width="18" height="6" rx="3" fill={`url(#${gid})`} />
          <Rect x="3" y="9" width="9" height="6" rx="3" fill={color} fillOpacity="0.35" />
          <Line x1="12" y1="9" x2="12" y2="15" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
        </G>
      </Svg>
    </IconBox>
  );
}

// ─── Exercise icon glyph ──────────────────────────────────────
export function ExerciseIconGlyph({ kind, color, size = 22 }: { kind: ExerciseIcon; color: string; size?: number }) {
  const s = size;
  if (kind === 'bicycle') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Circle cx="5.5" cy="17" r="3.3" stroke={color} strokeWidth="1.8" />
        <Circle cx="18.5" cy="17" r="3.3" stroke={color} strokeWidth="1.8" />
        <Circle cx="16" cy="4.5" r="1.5" fill={color} />
        <Path d="M5.5 17l4-6 4 2 3-4.5 2 4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M13 6.5h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }
  if (kind === 'sport') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Circle cx="9" cy="4.5" r="2" fill={color} />
        <Path d="M9 7l-1.5 5 3 1 0.5 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M10.5 12l5-2 4-1" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19.5 9l2.2-0.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        <Path d="M11 15.5l-1.5 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M9.5 20.5h3.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M8 10.5l-3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }
  if (kind === 'drive') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Path d="M1.5 15.5h2l2-3h4.5l1.8-2.5a2 2 0 011.6-0.8h3a2.5 2.5 0 012.2 1.3l1.6 2.9a1.5 1.5 0 01-1.3 2.2h-1.1"
          stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.12" />
        <Path d="M18.5 10l3-0.3M21 9.7v2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <Path d="M11.5 10.5l1.3-1.3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <Circle cx="7" cy="16" r="2.3" stroke={color} strokeWidth="1.8" fill="black" />
        <Circle cx="7" cy="16" r="0.7" fill={color} />
        <Circle cx="17.5" cy="16" r="2.3" stroke={color} strokeWidth="1.8" fill="black" />
        <Circle cx="17.5" cy="16" r="0.7" fill={color} />
        <Path d="M0.8 12.5h2M0.5 14h1.6" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      </Svg>
    );
  }
  // run (default)
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="16" cy="4" r="2" fill={color} />
      <Path d="M16 6.5l-2.5 5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M14.5 8l3.5 2.5 2-1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14.8 9.5l-3 1 0.5 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.5 11.5l-1 4 3.5 2" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13 12l-4 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M9 16l-2.5 0.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M4 7h2.5M3 10h2" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

export function RunIcon({ color = '#6DD3A8', size = 36, icon = 'run' as ExerciseIcon }) {
  return (
    <IconBox size={size}>
      <ExerciseIconGlyph kind={icon} color={color} size={size * 0.6} />
    </IconBox>
  );
}

// ─── Money icons ──────────────────────────────────────────────
export function MoneyIcon({ color = '#6DD3A8', size = 36, kind = 'transfer' }: { color?: string; size?: number; kind?: 'transfer' | 'spend' }) {
  const inner = size * 0.58;
  return (
    <IconBox size={size}>
      {kind === 'transfer' ? (
        <Svg width={inner} height={inner} viewBox="0 0 24 24" fill="none">
          <Path d="M4 8h13m0 0l-3.5-3.5M17 8l-3.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M20 16H7m0 0l3.5-3.5M7 16l3.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        </Svg>
      ) : (
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <Path d="M5 8h14l-1.2 12.2a1.5 1.5 0 01-1.5 1.3H7.7a1.5 1.5 0 01-1.5-1.3L5 8z"
            stroke={color} strokeWidth="1.9" strokeLinejoin="round" />
          <Path d="M8.5 11V7a3.5 3.5 0 017 0v4" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
        </Svg>
      )}
    </IconBox>
  );
}

// ─── Horizon (Morning) pill icon ─────────────────────────────
export function HorizonIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {/* Base sky */}
      <Rect x="0" y="0" width="40" height="40" rx="9" fill="#5A1A12" />
      {/* Atmospheric warmth near horizon */}
      <Circle cx="20" cy="26" r="22" fill="rgba(210,90,15,0.38)" />
      {/* Water */}
      <Rect x="0" y="26" width="40" height="14" fill="#3A1008" />
      {/* Horizon glow line */}
      <Rect x="0" y="25" width="40" height="2" fill="rgba(255,195,80,0.55)" />
      {/* Sun glow */}
      <Circle cx="20" cy="26" r="13" fill="rgba(255,180,40,0.28)" />
      {/* Sun half-circle */}
      <Path d="M9 26 A11 11 0 0 1 31 26 Z" fill="#FFD040" />
      {/* Sun specular highlight */}
      <Path d="M13 23.5 A8 5 0 0 1 27 23.5 Z" fill="rgba(255,255,165,0.45)" />
      {/* Sun pillar in water */}
      <Rect x="18.5" y="26" width="3" height="14" fill="rgba(255,190,60,0.22)" />
      {/* Cloud left */}
      <Circle cx="7"  cy="13"   r="3.5" fill="rgba(255,200,160,0.22)" />
      <Circle cx="11" cy="11.5" r="4"   fill="rgba(255,200,160,0.22)" />
      {/* Cloud right */}
      <Circle cx="30" cy="10"   r="3"   fill="rgba(255,200,160,0.17)" />
      <Circle cx="34" cy="11.5" r="2.5" fill="rgba(255,200,160,0.17)" />
    </Svg>
  );
}

// ─── Night Sky (Evening) pill icon ───────────────────────────
export function NightSkyIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {/* Background */}
      <Rect x="0" y="0" width="40" height="40" rx="9" fill="#0C0A24" />
      {/* Nebula patches */}
      <Circle cx="5"  cy="31" r="10" fill="rgba(70,30,150,0.13)" />
      <Circle cx="35" cy="11" r="7"  fill="rgba(30,60,160,0.09)" />
      {/* Moon halo */}
      <Circle cx="20" cy="18" r="12" fill="rgba(200,158,28,0.13)" />
      {/* Crescent (even-odd: moon circle minus shadow circle) */}
      <Path
        fillRule="evenodd"
        d="M10 18 A10 10 0 1 0 30 18 A10 10 0 1 0 10 18 Z M15 14 A9 9 0 1 0 33 14 A9 9 0 1 0 15 14 Z"
        fill="#EFC830"
      />
      {/* Lit rim highlight */}
      <Path
        d="M10 18 A10 10 0 0 0 20 8 A10 10 0 0 0 10 18 Z"
        fill="rgba(255,255,200,0.22)"
      />
      {/* Stars */}
      <Circle cx="6"  cy="8"  r="1.2" fill="white" fillOpacity="0.90" />
      <Circle cx="35" cy="6"  r="0.85" fill="white" fillOpacity="0.75" />
      <Circle cx="5"  cy="23" r="0.8" fill="white" fillOpacity="0.65" />
      <Circle cx="37" cy="30" r="1.0" fill="white" fillOpacity="0.80" />
      <Circle cx="11" cy="35" r="0.7" fill="white" fillOpacity="0.55" />
      <Circle cx="34" cy="34" r="0.8" fill="white" fillOpacity="0.60" />
      {/* 4-point sparkle on brightest star */}
      <Path d="M6 5.5 L6.5 8 L6 10.5 L5.5 8 Z" fill="white" fillOpacity="0.90" />
      <Path d="M3.5 8 L6 7.5 L8.5 8 L6 8.5 Z"  fill="white" fillOpacity="0.90" />
    </Svg>
  );
}

// ─── Drag handle ──────────────────────────────────────────────
export function DragHandle() {
  return (
    <Svg width="12" height="18" viewBox="0 0 12 18" fill="rgba(255,255,255,0.35)">
      <Circle cx="3" cy="3" r="1.5" />
      <Circle cx="9" cy="3" r="1.5" />
      <Circle cx="3" cy="9" r="1.5" />
      <Circle cx="9" cy="9" r="1.5" />
      <Circle cx="3" cy="15" r="1.5" />
      <Circle cx="9" cy="15" r="1.5" />
    </Svg>
  );
}

// ─── Chevron right ────────────────────────────────────────────
export function ChevronRight({ color = 'rgba(255,255,255,0.3)', size = 8 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size * 1.75} viewBox="0 0 8 14">
      <Path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Checkmark ────────────────────────────────────────────────
export function Checkmark({ color = '#000' }: { color?: string }) {
  return (
    <Svg width="13" height="10" viewBox="0 0 13 10">
      <Path d="M1 5l3.5 3.5L12 1" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
