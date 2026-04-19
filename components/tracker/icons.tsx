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

  // Bicycle — two wheels, clean frame
  if (kind === 'bicycle') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Circle cx="5.5"  cy="16.5" r="3.8" stroke={color} strokeWidth="1.8" />
        <Circle cx="18.5" cy="16.5" r="3.8" stroke={color} strokeWidth="1.8" />
        {/* Frame: seat-stay → bottom bracket → chain-stay */}
        <Path d="M5.5 16.5 L10 8.5 L18.5 16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Top tube */}
        <Path d="M10 8.5 L14 8.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        {/* Fork + head tube */}
        <Path d="M14 8.5 L18.5 16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        {/* Seat post + saddle */}
        <Path d="M10 8.5 L10 5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M8 5.5 L12 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Handlebar */}
        <Path d="M15.5 8 L16.5 5.5 L19 5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Crank */}
        <Circle cx="12" cy="16.5" r="1.2" fill={color} />
      </Svg>
    );
  }

  // Play — tennis racket + ball
  if (kind === 'play') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {/* Racket head (circle frame) */}
        <Circle cx="10" cy="9" r="6.5" stroke={color} strokeWidth="1.8" />
        {/* String grid — horizontal (clipped to circle, coords computed) */}
        <Path d="M3.85 7  L16.15 7"  stroke={color} strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />
        <Path d="M3.5  9  L16.5  9"  stroke={color} strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />
        <Path d="M3.85 11 L16.15 11" stroke={color} strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />
        {/* String grid — vertical */}
        <Path d="M7.5  3  L7.5  15"  stroke={color} strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />
        <Path d="M10   2.5 L10  15.5" stroke={color} strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />
        <Path d="M12.5 3  L12.5 15"  stroke={color} strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />
        {/* Throat */}
        <Path d="M8.5 15.5 L8.5 17 L11.5 17 L11.5 15.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Handle */}
        <Path d="M10 17 L10 22" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        {/* Ball */}
        <Circle cx="19" cy="6" r="2.4" stroke={color} strokeWidth="1.6" />
        {/* Ball seam */}
        <Path d="M17.2 4.5 Q19 6 17.2 7.5" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      </Svg>
    );
  }

  // Drive — sports car side profile
  if (kind === 'drive') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {/* Body silhouette */}
        <Path
          d="M1.5 15.5 L3.5 13 L7.5 11.5 L10.5 8.5 L15 7.5 L18 8.5 L20.5 11 L22 13.5 L22 15.5 Z"
          stroke={color} strokeWidth="1.7" strokeLinejoin="round"
          fill={color} fillOpacity="0.12"
        />
        {/* Windshield + window */}
        <Path
          d="M10.5 8.5 L12 7.7 L16 7.7 L18 9.5 L13.5 10.2 Z"
          stroke={color} strokeWidth="1.1" strokeLinejoin="round"
          fill={color} fillOpacity="0.3"
        />
        {/* Front wheel */}
        <Circle cx="6.5"  cy="16.5" r="2.8" stroke={color} strokeWidth="1.7" fill="black" />
        <Circle cx="6.5"  cy="16.5" r="1"   fill={color} />
        {/* Rear wheel */}
        <Circle cx="18.5" cy="16.5" r="2.8" stroke={color} strokeWidth="1.7" fill="black" />
        <Circle cx="18.5" cy="16.5" r="1"   fill={color} />
        {/* Ground shadow line */}
        <Path d="M3 19.5 L22 19.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        {/* Speed lines */}
        <Path d="M0.5 12.5 L2 12.5M0.5 14.5 L1.5 14.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      </Svg>
    );
  }

  // Run (default) — clean running figure
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <Circle cx="15.5" cy="4" r="1.9" fill={color} />
      {/* Body leaning forward */}
      <Path d="M15 6 L13 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* Front arm pumping back */}
      <Path d="M14.5 8.5 L18 7" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      {/* Back arm driving forward */}
      <Path d="M13.5 9.5 L10 11" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      {/* Front leg — stride forward */}
      <Path d="M13 12 L16.5 17 L18.5 21" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Back leg — trailing */}
      <Path d="M13 12 L10.5 15.5 L8 17.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Motion lines */}
      <Path d="M5 9 L2 9M5.5 12 L3 12" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
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
