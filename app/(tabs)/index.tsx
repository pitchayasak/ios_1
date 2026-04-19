import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Modal, Pressable, Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import {
  useStore, dateKey, addDays, isSameDay, formatLongDate,
  dayCompletion, isTaskDone, Task, TaskEntry,
} from '@/context/store';
import { PillIcon, RunIcon, MoneyIcon, Checkmark } from '@/components/tracker/icons';

const ACCENT = '#F4B740';
const BG = '#000';
const CARD = 'rgba(28,28,30,0.92)';

// ─── CalendarPicker ───────────────────────────────────────────
function CalendarPickerSheet({ selected, onPick, onClose }: {
  selected: Date; onPick: (d: Date) => void; onClose: () => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const { state } = useStore();

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startOffset = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoNext = month.getFullYear() < today.getFullYear()
    || (month.getFullYear() === today.getFullYear() && month.getMonth() < today.getMonth());

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={e => e.stopPropagation()}>
          <View style={styles.grabber} />
          {/* Header */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.sheetCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Select day</Text>
            <TouchableOpacity onPress={() => onPick(new Date())}>
              <Text style={styles.sheetAction}>Today</Text>
            </TouchableOpacity>
          </View>
          {/* Month nav */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              style={styles.navBtn}>
              <Svg width="9" height="14" viewBox="0 0 10 16">
                <Path d="M8 1L1 8l7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={() => canGoNext && setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              style={[styles.navBtn, !canGoNext && { opacity: 0.25 }]} disabled={!canGoNext}>
              <Svg width="9" height="14" viewBox="0 0 10 16">
                <Path d="M2 1l7 7-7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
          {/* Weekday headers */}
          <View style={styles.weekdaysRow}>
            {weekdays.map((w, i) => <Text key={i} style={styles.weekday}>{w}</Text>)}
          </View>
          {/* Calendar grid */}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.calRow}>
              {row.map((d, ci) => {
                if (!d) return <View key={ci} style={styles.calCell} />;
                const isSel = isSameDay(d, selected);
                const isToday = isSameDay(d, today);
                const isFuture = d > today;
                const comp = dayCompletion(state.tasks, state.log[dateKey(d)]);
                return (
                  <TouchableOpacity key={ci} disabled={isFuture} onPress={() => onPick(d)}
                    style={[
                      styles.calCell,
                      isSel && { backgroundColor: ACCENT },
                      !isSel && comp > 0 && { backgroundColor: `rgba(244,183,64,${0.08 + comp * 0.18})` },
                      isToday && !isSel && { borderWidth: 1.5, borderColor: 'rgba(244,183,64,0.6)' },
                    ]}>
                    <Text style={[
                      styles.calCellText,
                      isSel && { color: '#000' },
                      isFuture && { color: 'rgba(255,255,255,0.18)' },
                      (isSel || isToday) && { fontWeight: '700' },
                    ]}>{d.getDate()}</Text>
                    {!isSel && comp >= 0.999 && (
                      <View style={styles.calDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          {/* Legend */}
          <View style={styles.calLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: 'rgba(244,183,64,0.3)' }]} />
              <Text style={styles.legendLabel}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: ACCENT }]} />
              <Text style={styles.legendLabel}>All done</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { borderWidth: 1.5, borderColor: 'rgba(244,183,64,0.6)' }]} />
              <Text style={styles.legendLabel}>Today</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── DateNav ──────────────────────────────────────────────────
function DateNav({ date, setDate }: { date: Date; setDate: (d: Date) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const today = new Date();
  const canGoForward = !isSameDay(date, today);
  const { state } = useStore();

  return (
    <View style={styles.dateNav}>
      <TouchableOpacity onPress={() => setPickerOpen(true)} style={styles.calIconBtn}>
        <Svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <Rect x="2.5" y="4" width="15" height="13.5" rx="2.5" stroke="#fff" strokeWidth="1.6" />
          <Path d="M2.5 8h15" stroke="#fff" strokeWidth="1.6" />
          <Path d="M6.5 2.5v3M13.5 2.5v3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <Circle cx="10" cy="12.5" r="1.3" fill={ACCENT} />
        </Svg>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setDate(addDays(date, -1))} style={styles.dateLabelBtn}>
        <Text style={styles.dateLabelMain}>{formatLongDate(date)}</Text>
        <Text style={styles.dateLabelSub}>
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => canGoForward && setDate(addDays(date, 1))}
        disabled={!canGoForward} style={[styles.navIconBtn, !canGoForward && { opacity: 0.25 }]}>
        <Svg width="10" height="16" viewBox="0 0 10 16">
          <Path d="M2 1l7 7-7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      {pickerOpen && (
        <CalendarPickerSheet
          selected={date}
          onPick={d => { setDate(d); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </View>
  );
}

// ─── ProgressStrip ────────────────────────────────────────────
function ProgressStrip({ tasks, entries }: { tasks: Task[]; entries: any }) {
  let done = 0;
  tasks.forEach(t => {
    const e = entries[t.id];
    if (isTaskDone(t, e)) done++;
  });
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;
  return (
    <View style={styles.progress}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Today's Progress</Text>
        <Text style={styles.progressCount}>{done}/{tasks.length}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>
    </View>
  );
}

// ─── GlowToggle ───────────────────────────────────────────────
function GlowToggle({ label, active, onPress, color, icon }: {
  label: string; active: boolean; onPress: () => void; color: string; icon: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[
      styles.glowBtn,
      active && {
        backgroundColor: color + '20',
        borderColor: color + '90',
        shadowColor: color,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      },
      !active && { borderColor: 'rgba(255,255,255,0.06)' },
    ]}>
      <Text style={[styles.glowIcon, !active && { opacity: 0.55 }]}>{icon}</Text>
      <Text style={[styles.glowLabel, active ? { color: '#fff' } : { color: 'rgba(255,255,255,0.55)' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── ChoiceChip ───────────────────────────────────────────────
function ChoiceChip({ label, active, onPress, color }: {
  label: string; active: boolean; onPress: () => void; color: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[
      styles.chip,
      active
        ? { backgroundColor: color, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 9, shadowOffset: { width: 0, height: 0 } }
        : { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' },
    ]}>
      <Text style={[styles.chipText, active ? { color: '#000' } : { color: 'rgba(255,255,255,0.85)' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── CompletionDot ────────────────────────────────────────────
function CompletionDot({ task, entry }: { task: Task; entry: TaskEntry | undefined }) {
  const done = isTaskDone(task, entry);
  const partial = task.type === 'pill' && !done && !!((entry as any)?.morning || (entry as any)?.evening);
  return (
    <View style={[
      styles.dot,
      done && { backgroundColor: task.color, borderWidth: 0, shadowColor: task.color, shadowOpacity: 0.4, shadowRadius: 7, shadowOffset: { width: 0, height: 0 } },
      !done && { borderWidth: 1.5, borderColor: partial ? task.color : 'rgba(255,255,255,0.15)' },
    ]}>
      {done && <Checkmark />}
    </View>
  );
}

// ─── ExerciseBody ─────────────────────────────────────────────
function ExerciseBody({ task, entry, onChange }: { task: Task; entry: any; onChange: (e: any) => void }) {
  const opts = task.mode === 'duration' ? [15, 20, 30, 40, 45, 50, 60] : [500, 1000, 1500, 2000];
  const unit = task.mode === 'duration' ? 'min' : 'm';
  const current = task.mode === 'duration' ? entry?.duration : entry?.distance;
  return (
    <View style={styles.chipRow}>
      {opts.map(opt => {
        const label = task.mode === 'distance' && opt >= 1000 ? `${opt / 1000}k ${unit}` : `${opt} ${unit}`;
        return (
          <ChoiceChip key={opt} label={label} active={current === opt} color={task.color}
            onPress={() => onChange(current === opt ? null : (task.mode === 'duration' ? { duration: opt } : { distance: opt }))} />
        );
      })}
    </View>
  );
}

// ─── TransferBody ─────────────────────────────────────────────
function TransferBody({ task, entry, onChange }: { task: Task; entry: any; onChange: (e: any) => void }) {
  const opts = [7500, 20000];
  const current = entry?.amount;
  const color = task.color;
  return (
    <View style={styles.glowRow}>
      {opts.map(opt => {
        const active = current === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => onChange(active ? null : { amount: opt })}
            style={[
              styles.transferBtn,
              active
                ? { backgroundColor: color + '20', borderColor: color + '90', shadowColor: color, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
                : { borderColor: 'rgba(255,255,255,0.06)' },
            ]}>
            <Text style={[styles.transferAmount, active ? { color: '#fff' } : { color: 'rgba(255,255,255,0.7)' }]}>
              ฿ {opt.toLocaleString('en-US')}
            </Text>
            <Text style={[styles.transferUnit, active ? { color: 'rgba(255,255,255,0.7)' } : { color: 'rgba(255,255,255,0.4)' }]}>THB</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── SpendBody ────────────────────────────────────────────────
function SpendBody({ task, entry, onChange }: { task: Task; entry: any; onChange: (e: any) => void }) {
  const color = task.color;
  const [raw, setRaw] = useState(() => {
    const v = entry?.amount;
    return v === undefined || v === null ? '' : String(v);
  });

  React.useEffect(() => {
    const v = entry?.amount;
    const next = v === undefined || v === null ? '' : String(v);
    if (next !== raw) setRaw(next);
  }, [entry?.amount]);

  const sanitize = (s: string) => {
    let v = s.replace(/[^0-9.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot >= 0) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    let [intPart, decPart] = v.split('.');
    if (intPart && intPart.length > 1) intPart = intPart.replace(/^0+/, '') || '0';
    if (intPart && intPart.length > 6) intPart = intPart.slice(0, 6);
    if (decPart !== undefined) decPart = decPart.slice(0, 2);
    return decPart !== undefined ? `${intPart}.${decPart}` : (intPart || '');
  };

  const commit = (v: string) => {
    if (v === '' || v === '.') onChange(null);
    else onChange({ amount: parseFloat(v) });
  };

  const has = raw !== '' && raw !== '.';

  return (
    <View style={[
      styles.spendBox,
      has
        ? { backgroundColor: color + '14', borderColor: color + '70', shadowColor: color, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
        : { borderColor: 'rgba(255,255,255,0.06)' },
    ]}>
      <Text style={[styles.spendCurrency, { color: has ? color : 'rgba(255,255,255,0.3)' }]}>฿</Text>
      <TextInput
        value={raw}
        onChangeText={s => { const v = sanitize(s); setRaw(v); commit(v); }}
        onBlur={() => { if (raw.endsWith('.')) { const s = raw.slice(0, -1); setRaw(s); commit(s); } }}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor="rgba(255,255,255,0.3)"
        style={styles.spendInput}
      />
      <Text style={styles.spendUnit}>THB</Text>
    </View>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────
function TaskCard({ task, entry, onChange }: { task: Task; entry: TaskEntry | undefined; onChange: (e: any) => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {task.type === 'pill' ? <PillIcon color={task.color} />
          : task.type === 'exercise' ? <RunIcon color={task.color} icon={task.icon || 'run'} />
          : <MoneyIcon color={task.color} kind={task.type === 'transfer' ? 'transfer' : 'spend'} />}
        <View style={styles.cardTitle}>
          <Text style={styles.cardType}>
            {task.type === 'pill' ? 'MEDICATION'
              : task.type === 'exercise' ? (task.mode === 'distance' ? 'DISTANCE' : 'DURATION')
              : task.type === 'transfer' ? 'MONEY TRANSFER · THB'
              : 'MONEY SPEND · THB'}
          </Text>
          <Text style={styles.cardName} numberOfLines={1}>{task.name}</Text>
        </View>
        <CompletionDot task={task} entry={entry} />
      </View>
      {task.type === 'pill' ? (
        <View style={styles.glowRow}>
          <GlowToggle label="Morning" icon="☀" active={!!(entry as any)?.morning} color={task.color}
            onPress={() => onChange({ ...(entry || {}), morning: !(entry as any)?.morning })} />
          <GlowToggle label="Evening" icon="☾" active={!!(entry as any)?.evening} color={task.color}
            onPress={() => onChange({ ...(entry || {}), evening: !(entry as any)?.evening })} />
        </View>
      ) : task.type === 'exercise' ? (
        <ExerciseBody task={task} entry={entry} onChange={onChange} />
      ) : task.type === 'transfer' ? (
        <TransferBody task={task} entry={entry} onChange={onChange} />
      ) : (
        <SpendBody task={task} entry={entry} onChange={onChange} />
      )}
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────
export default function HomeScreen() {
  const { state, setState } = useStore();
  const [date, setDate] = useState(new Date());
  const key = dateKey(date);
  const entries = state.log[key] || {};

  const updateEntry = (taskId: string, entry: any) => {
    setState(s => {
      const log = { ...s.log };
      const day = { ...(log[key] || {}) };
      if (entry === null || (entry && Object.keys(entry).length === 0)) {
        delete day[taskId];
      } else {
        day[taskId] = entry;
      }
      if (Object.keys(day).length) log[key] = day;
      else delete log[key];
      return { ...s, log };
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <DateNav date={date} setDate={setDate} />
          <ProgressStrip tasks={state.tasks} entries={entries} />
          <View style={styles.cards}>
            {state.tasks.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>✦</Text>
                <Text style={styles.emptyTitle}>No tasks yet</Text>
                <Text style={styles.emptySub}>Go to the Tasks tab to add one.</Text>
              </View>
            ) : state.tasks.map(t => (
              <TaskCard key={t.id} task={t} entry={entries[t.id]} onChange={e => updateEntry(t.id, e)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  cards: { paddingHorizontal: 16, paddingTop: 4 },

  // Date nav
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 },
  calIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  navIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  dateLabelBtn: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  dateLabelMain: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  dateLabelSub: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '500', marginTop: 2, letterSpacing: 0.2 },

  // Progress
  progress: { paddingHorizontal: 20, paddingBottom: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  progressLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  progressCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  progressTrack: { height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: ACCENT },

  // Card
  card: { backgroundColor: CARD, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 18, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardTitle: { flex: 1, minWidth: 0 },
  cardType: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
  cardName: { color: '#fff', fontSize: 19, fontWeight: '600', letterSpacing: -0.3, marginTop: 2 },

  // Completion dot
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  // Glow toggle
  glowRow: { flexDirection: 'row', gap: 10 },
  glowBtn: { flex: 1, height: 62, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4, elevation: 0 },
  glowIcon: { fontSize: 22 },
  glowLabel: { fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },

  // Choice chip
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 0, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  chipText: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1 },

  // Transfer
  transferBtn: { flex: 1, height: 62, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  transferAmount: { fontSize: 19, fontWeight: '700', letterSpacing: -0.3, fontVariant: ['tabular-nums'] },
  transferUnit: { fontSize: 10, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },

  // Spend
  spendBox: { borderRadius: 16, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  spendCurrency: { fontSize: 22, fontWeight: '600', fontVariant: ['tabular-nums'] },
  spendInput: { flex: 1, color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.5, padding: 0 },
  spendUnit: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },

  // Empty state
  empty: { marginTop: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 28, marginBottom: 16, color: '#fff' },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  // Calendar picker sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 34 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginVertical: 8 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  sheetCancel: { color: 'rgba(255,255,255,0.65)', fontSize: 16 },
  sheetTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sheetAction: { color: ACCENT, fontSize: 16, fontWeight: '600' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 12 },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  monthLabel: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  weekdaysRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 6 },
  weekday: { flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  calRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 4, marginBottom: 4 },
  calCell: { flex: 1, aspectRatio: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  calCellText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  calDot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2, backgroundColor: ACCENT },
  calLegend: { flexDirection: 'row', justifyContent: 'center', gap: 14, padding: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
});
