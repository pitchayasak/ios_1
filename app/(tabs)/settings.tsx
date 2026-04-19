import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Pressable,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useStore, T } from '@/context/store';

// ─── Wipe confirm modal ───────────────────────────────────────
function WipeModal({ visible, onConfirm, onCancel }: {
  visible: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={e => e.stopPropagation()}>
          <View style={styles.warnIcon}>
            <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <Path d="M12 3L2 20h20L12 3z" stroke="#FF453A" strokeWidth="1.8" strokeLinejoin="round" />
              <Path d="M12 10v5" stroke="#FF453A" strokeWidth="2" strokeLinecap="round" />
              <Circle cx="12" cy="17.5" r="0.8" fill="#FF453A" />
            </Svg>
          </View>
          <Text style={styles.dialogTitle}>Wipe all data?</Text>
          <Text style={styles.dialogBody}>
            All tasks and history will be permanently deleted. The app will be left empty. This cannot be undone.
          </Text>
          <TouchableOpacity onPress={onConfirm} style={styles.wipeConfirmBtn}>
            <Text style={styles.wipeConfirmText}>Yes, wipe everything</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Seed confirm modal ───────────────────────────────────────
function SeedModal({ visible, onConfirm, onCancel }: {
  visible: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={e => e.stopPropagation()}>
          <View style={styles.seedIcon}>
            <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
                stroke={T.accent} strokeWidth="1.6" fill="none" strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.dialogTitle}>Load sample data?</Text>
          <Text style={styles.dialogBody}>
            Your current tasks and history will be replaced with seed data. This cannot be undone.
          </Text>
          <TouchableOpacity onPress={onConfirm} style={styles.seedConfirmBtn}>
            <Text style={styles.seedConfirmText}>Yes, load sample data</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Settings screen ──────────────────────────────────────────
export default function SettingsScreen() {
  const { resetStore, clearStore } = useStore();
  const [wipeVisible, setWipeVisible] = useState(false);
  const [seedVisible, setSeedVisible] = useState(false);

  const handleWipe = () => { clearStore(); setWipeVisible(false); };
  const handleSeed = () => { resetStore(); setSeedVisible(false); };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Settings</Text>
        </View>

        {/* Data section */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionLabel}>Data</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Local storage</Text>
                <Text style={styles.rowSub}>Tasks and history are saved on this device only.</Text>
              </View>
              <View style={styles.statusDot} />
            </View>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionLabel, { color: '#FF453A' }]}>Danger zone</Text>
          <View style={styles.card}>
            {/* Wipe row */}
            <TouchableOpacity onPress={() => setWipeVisible(true)} style={styles.actionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wipeTitle}>Wipe all data</Text>
                <Text style={styles.wipeSub}>Delete all tasks and history. Leaves the app empty.</Text>
              </View>
              <Svg width="8" height="14" viewBox="0 0 8 14">
                <Path d="M1 1l6 6-6 6" stroke="rgba(255,69,58,0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.rowDivider} />

            {/* Seed row */}
            <TouchableOpacity onPress={() => setSeedVisible(true)} style={styles.actionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.seedTitle}>Generate sample data</Text>
                <Text style={styles.seedSub}>Replace current data with seed tasks and history.</Text>
              </View>
              <Svg width="8" height="14" viewBox="0 0 8 14">
                <Path d="M1 1l6 6-6 6" stroke={T.accentDim} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Placeholder note */}
        <View style={styles.placeholder}>
          <View style={styles.placeholderIcon}>
            <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="3.2" stroke={T.accentDim} strokeWidth="1.6" />
              <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
                stroke={T.accentDim} strokeWidth="1.6" strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.placeholderText}>Notifications, iCloud sync and units coming soon.</Text>
        </View>
      </SafeAreaView>

      <WipeModal
        visible={wipeVisible}
        onConfirm={handleWipe}
        onCancel={() => setWipeVisible(false)}
      />
      <SeedModal
        visible={seedVisible}
        onConfirm={handleSeed}
        onCancel={() => setSeedVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  heading: { color: T.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },

  sectionGroup:  { paddingHorizontal: 16, marginBottom: 28 },
  sectionLabel:  { color: T.accentDim, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  card:          { backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.cardBorder, overflow: 'hidden' },

  cardRow:   { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowTitle:  { color: T.text, fontSize: 15, fontWeight: '600', marginBottom: 3 },
  rowSub:    { color: T.textSub, fontSize: 13 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#30D158' },

  actionRow:  { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowDivider: { height: 1, backgroundColor: T.divider, marginHorizontal: 16 },

  wipeTitle: { color: '#FF453A', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  wipeSub:   { color: 'rgba(255,69,58,0.6)', fontSize: 13 },

  seedTitle: { color: T.accent, fontSize: 15, fontWeight: '600', marginBottom: 3 },
  seedSub:   { color: T.accentDim, fontSize: 13 },

  placeholder:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 120, paddingHorizontal: 40 },
  placeholderIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: T.accentSurf, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  placeholderText: { color: T.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Modals
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' },
  dialog:  { backgroundColor: '#111', borderRadius: 24, padding: 24, marginHorizontal: 32, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center' },

  warnIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,69,58,0.1)', borderWidth: 1, borderColor: 'rgba(255,69,58,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  seedIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: T.accentFaint, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  dialogTitle: { color: T.text, fontSize: 18, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  dialogBody:  { color: T.textSub, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 24 },

  wipeConfirmBtn:  { width: '100%', height: 50, borderRadius: 14, backgroundColor: 'rgba(255,69,58,0.15)', borderWidth: 1, borderColor: 'rgba(255,69,58,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  wipeConfirmText: { color: '#FF453A', fontSize: 15, fontWeight: '700' },

  seedConfirmBtn:  { width: '100%', height: 50, borderRadius: 14, backgroundColor: T.accentFaint, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  seedConfirmText: { color: T.accent, fontSize: 15, fontWeight: '700' },

  cancelBtn:  { width: '100%', height: 50, borderRadius: 14, backgroundColor: T.accentSurf, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: T.text, fontSize: 15, fontWeight: '600' },
});
