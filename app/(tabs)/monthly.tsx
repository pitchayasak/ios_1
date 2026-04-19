import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  useStore, monthKey, addMonths, isSameMonth, formatMonthLabel,
  isTaskDone, Task, TaskEntry, T,
} from '@/context/store';
import { TaskCard, styles as sharedStyles } from './index';

const ACCENT = T.accent;

// ─── Month navigator ──────────────────────────────────────────
function MonthNav({ month, setMonth }: { month: Date; setMonth: (d: Date) => void }) {
  const today = new Date();
  const isCurrent = isSameMonth(month, today);
  const label = formatMonthLabel(month);

  return (
    <View style={styles.monthNav}>
      <TouchableOpacity onPress={() => setMonth(addMonths(month, -1))} style={styles.navBtn}>
        <Svg width="10" height="16" viewBox="0 0 10 16">
          <Path d="M8 1L1 8l7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <View style={styles.labelWrap}>
        <Text style={styles.monthLabel}>{label}</Text>
        {!isCurrent && (
          <TouchableOpacity onPress={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
            style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>This Month</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => !isCurrent && setMonth(addMonths(month, 1))}
        disabled={isCurrent}
        style={[styles.navBtn, isCurrent && { opacity: 0.25 }]}>
        <Svg width="10" height="16" viewBox="0 0 10 16">
          <Path d="M2 1l7 7-7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

// ─── Progress strip ───────────────────────────────────────────
function ProgressStrip({ tasks, entries }: { tasks: Task[]; entries: any }) {
  let done = 0;
  tasks.forEach(t => { if (isTaskDone(t, entries[t.id])) done++; });
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;
  return (
    <View style={sharedStyles.progress}>
      <View style={sharedStyles.progressRow}>
        <Text style={sharedStyles.progressLabel}>Monthly Progress</Text>
        <Text style={sharedStyles.progressCount}>{done}/{tasks.length}</Text>
      </View>
      <View style={sharedStyles.progressTrack}>
        <View style={[sharedStyles.progressFill, { width: `${pct}%` as any }]} />
      </View>
    </View>
  );
}

// ─── Monthly Screen ───────────────────────────────────────────
export default function MonthlyScreen() {
  const { state, setState } = useStore();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const key = monthKey(month);
  const monthlyTasks = state.tasks.filter(t => t.frequency === 'monthly');
  const entries = state.log[key] || {};

  const updateEntry = (taskId: string, entry: any) => {
    setState(s => {
      const log = { ...s.log };
      const mo = { ...(log[key] || {}) };
      if (entry === null || (entry && Object.keys(entry).length === 0)) delete mo[taskId];
      else mo[taskId] = entry;
      if (Object.keys(mo).length) log[key] = mo;
      else delete log[key];
      return { ...s, log };
    });
  };

  return (
    <View style={sharedStyles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MonthNav month={month} setMonth={setMonth} />
          <ProgressStrip tasks={monthlyTasks} entries={entries} />

          <View style={sharedStyles.cards}>
            {monthlyTasks.length === 0 ? (
              <View style={sharedStyles.empty}>
                <Text style={sharedStyles.emptyIcon}>◈</Text>
                <Text style={sharedStyles.emptyTitle}>No monthly tasks</Text>
                <Text style={sharedStyles.emptySub}>Set a task to Monthly in the Tasks tab.</Text>
              </View>
            ) : monthlyTasks.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                entry={entries[t.id]}
                onChange={e => updateEntry(t.id, e)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: T.accentSurf,
    borderWidth: 1, borderColor: T.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  labelWrap: {
    flex: 1, alignItems: 'center', gap: 6,
  },
  monthLabel: {
    color: T.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.4,
  },
  todayBadge: {
    backgroundColor: T.accentFaint,
    borderWidth: 1, borderColor: T.cardBorder,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3,
  },
  todayBadgeText: {
    color: ACCENT, fontSize: 11, fontWeight: '700', letterSpacing: 0.3,
  },
});
