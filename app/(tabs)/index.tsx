import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Modal, Pressable,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import {
  useStore, dateKey, addDays, isSameDay, formatLongDate,
  dayCompletion, isTaskDone, Task, TaskEntry, logKey, T,
} from '@/context/store';
import { PillIcon, RunIcon, MoneyIcon, Checkmark } from '@/components/tracker/icons';

// ─── Shared task card components (also used by monthly.tsx) ──
export function GlowToggle({ label, active, onPress, color, icon, svgIcon }: {
  label?: string; active: boolean; onPress: () => void; color: string; icon?: string; svgIcon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[
      styles.glowBtn,
      active
        ? { backgroundColor: color + '1A', borderColor: color + 'AA', shadowColor: color, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 4 }
        : { borderColor: T.cardBorder },
    ]}>
      {svgIcon
        ? <View style={!active ? { opacity: 0.45 } : undefined}>{svgIcon}</View>
        : <Text style={[styles.glowIcon, !active && { opacity: 0.45 }]}>{icon}</Text>
      }
      {label != null && <Text style={[styles.glowLabel, { color: active ? '#fff' : T.textSub }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

export function ChoiceChip({ label, active, onPress, color }: {
  label: string; active: boolean; onPress: () => void; color: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[
      styles.chip,
      active
        ? { backgroundColor: color, shadowColor: color, shadowOpacity: 0.55, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, borderColor: 'transparent' }
        : { backgroundColor: T.accentSurf, borderColor: T.cardBorder },
    ]}>
      <Text style={[styles.chipText, { color: active ? '#000' : T.textSub }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CompletionDot({ task, entry }: { task: Task; entry: TaskEntry | undefined }) {
  const done = isTaskDone(task, entry);
  const partial = task.type === 'pill' && !done && !!((entry as any)?.morning || (entry as any)?.evening);
  return (
    <View style={[
      styles.dot,
      done
        ? { backgroundColor: task.color, borderWidth: 0, shadowColor: task.color, shadowOpacity: 0.55, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }
        : { borderWidth: 1.5, borderColor: partial ? task.color : T.cardBorder },
    ]}>
      {done && <Checkmark />}
    </View>
  );
}

export function ExerciseBody({ task, entry, onChange }: { task: Task; entry: any; onChange: (e: any) => void }) {
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

export function TransferBody({ task, entry, onChange }: { task: Task; entry: any; onChange: (e: any) => void }) {
  const opts = [7500, 20000];
  const current = entry?.amount;
  const c = task.color;
  return (
    <View style={styles.glowRow}>
      {opts.map(opt => {
        const active = current === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => onChange(active ? null : { amount: opt })}
            style={[
              styles.transferBtn,
              active
                ? { backgroundColor: c + '1A', borderColor: c + 'AA', shadowColor: c, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } }
                : { borderColor: T.cardBorder },
            ]}>
            <Text style={[styles.transferAmount, { color: active ? '#fff' : T.textSub }]}>฿ {opt.toLocaleString('en-US')}</Text>
            <Text style={[styles.transferUnit, { color: active ? T.accentDim : T.textFaint }]}>THB</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function SpendBody({ task, entry, onChange }: { task: Task; entry: any; onChange: (e: any) => void }) {
  const c = task.color;
  const [raw, setRaw] = useState(() => {
    const v = entry?.amount; return v === undefined || v === null ? '' : String(v);
  });
  React.useEffect(() => {
    const v = entry?.amount;
    const next = v === undefined || v === null ? '' : String(v);
    if (next !== raw) setRaw(next);
  }, [entry?.amount]);

  const sanitize = (s: string) => {
    let v = s.replace(/[^0-9.]/g, '');
    const dot = v.indexOf('.');
    if (dot >= 0) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
    let [int, dec] = v.split('.');
    if (int && int.length > 1) int = int.replace(/^0+/, '') || '0';
    if (int && int.length > 6) int = int.slice(0, 6);
    if (dec !== undefined) dec = dec.slice(0, 2);
    return dec !== undefined ? `${int}.${dec}` : (int || '');
  };
  const commit = (v: string) => { if (v === '' || v === '.') onChange(null); else onChange({ amount: parseFloat(v) }); };
  const has = raw !== '' && raw !== '.';

  return (
    <View style={[
      styles.spendBox,
      has
        ? { backgroundColor: c + '12', borderColor: c + '80', shadowColor: c, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
        : { borderColor: T.cardBorder },
    ]}>
      <Text style={[styles.spendCurrency, { color: has ? c : T.textFaint }]}>฿</Text>
      <TextInput
        value={raw}
        onChangeText={s => { const v = sanitize(s); setRaw(v); commit(v); }}
        onBlur={() => { if (raw.endsWith('.')) { const s = raw.slice(0, -1); setRaw(s); commit(s); } }}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={T.textFaint}
        style={styles.spendInput}
      />
      <Text style={styles.spendUnit}>THB</Text>
    </View>
  );
}

export function TaskCard({ task, entry, onChange }: {
  task: Task; entry: TaskEntry | undefined; onChange: (e: any) => void;
}) {
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
              : task.type === 'transfer' ? 'MONEY TRANSFER · THB' : 'MONEY SPEND · THB'}
          </Text>
          <Text style={styles.cardName} numberOfLines={1}>{task.name}</Text>
        </View>
        <CompletionDot task={task} entry={entry} />
      </View>
      {task.type === 'pill' ? (
        <View style={styles.glowRow}>
          <GlowToggle label="Morning" active={!!(entry as any)?.morning} color={task.color}
            onPress={() => onChange({ ...(entry || {}), morning: !(entry as any)?.morning })} />
          <GlowToggle label="Evening" active={!!(entry as any)?.evening} color={task.color}
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

// ─── Calendar picker ─────────────────────────────────────────
function CalendarPickerSheet({ selected, onPick, onClose }: {
  selected: Date; onPick: (d: Date) => void; onClose: () => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const { state } = useStore();

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay  = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoNext = month.getFullYear() < today.getFullYear()
    || (month.getFullYear() === today.getFullYear() && month.getMonth() < today.getMonth());

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dailyTasks = state.tasks.filter(t => t.frequency === 'daily');

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={onClose}><Text style={styles.sheetCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.sheetTitle}>Select day</Text>
            <TouchableOpacity onPress={() => onPick(new Date())}><Text style={styles.sheetAction}>Today</Text></TouchableOpacity>
          </View>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={styles.navBtn}>
              <Svg width="9" height="14" viewBox="0 0 10 16"><Path d="M8 1L1 8l7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
            <TouchableOpacity onPress={() => canGoNext && setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              style={[styles.navBtn, !canGoNext && { opacity: 0.25 }]} disabled={!canGoNext}>
              <Svg width="9" height="14" viewBox="0 0 10 16"><Path d="M2 1l7 7-7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
            </TouchableOpacity>
          </View>
          <View style={styles.weekdaysRow}>
            {weekdays.map((w, i) => <Text key={i} style={styles.weekday}>{w}</Text>)}
          </View>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.calRow}>
              {row.map((d, ci) => {
                if (!d) return <View key={ci} style={styles.calCell} />;
                const isSel = isSameDay(d, selected);
                const isToday = isSameDay(d, today);
                const isFuture = d > today;
                const comp = dayCompletion(dailyTasks, state.log[dateKey(d)]);
                return (
                  <TouchableOpacity key={ci} disabled={isFuture} onPress={() => onPick(d)}
                    style={[
                      styles.calCell,
                      isSel && { backgroundColor: T.accent },
                      !isSel && comp > 0 && { backgroundColor: `rgba(244,183,64,${0.08 + comp * 0.18})` },
                      isToday && !isSel && { borderWidth: 1.5, borderColor: T.accentDim },
                    ]}>
                    <Text style={[styles.calText, isSel && { color: '#000' }, isFuture && { color: T.textFaint }, (isSel || isToday) && { fontWeight: '700' }]}>
                      {d.getDate()}
                    </Text>
                    {!isSel && comp >= 0.999 && <View style={styles.calDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <View style={styles.calLegend}>
            {[['rgba(244,183,64,0.3)', 'Partial'], [T.accent, 'All done']].map(([bg, label]) => (
              <View key={label} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: bg }]} />
                <Text style={styles.legendLabel}>{label}</Text>
              </View>
            ))}
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { borderWidth: 1.5, borderColor: T.accentDim }]} />
              <Text style={styles.legendLabel}>Today</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── DateNav ─────────────────────────────────────────────────
function DateNav({ date, setDate }: { date: Date; setDate: (d: Date) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const today = new Date();
  const canFwd = !isSameDay(date, today);

  return (
    <View style={styles.dateNav}>
      <TouchableOpacity onPress={() => setPickerOpen(true)} style={styles.iconBtn}>
        <Svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <Rect x="2.5" y="4" width="15" height="13.5" rx="2.5" stroke={T.text} strokeWidth="1.6" />
          <Path d="M2.5 8h15" stroke={T.text} strokeWidth="1.6" />
          <Path d="M6.5 2.5v3M13.5 2.5v3" stroke={T.text} strokeWidth="1.6" strokeLinecap="round" />
          <Circle cx="10" cy="12.5" r="1.3" fill={T.accent} />
        </Svg>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setDate(addDays(date, -1))} style={styles.dateLabelBtn}>
        <Text style={styles.dateMain}>{formatLongDate(date)}</Text>
        <Text style={styles.dateSub}>
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => canFwd && setDate(addDays(date, 1))} disabled={!canFwd}
        style={[styles.iconBtn, !canFwd && { opacity: 0.25 }]}>
        <Svg width="10" height="16" viewBox="0 0 10 16"><Path d="M2 1l7 7-7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
      </TouchableOpacity>
      {pickerOpen && (
        <CalendarPickerSheet selected={date} onPick={d => { setDate(d); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />
      )}
    </View>
  );
}

// ─── ProgressStrip ────────────────────────────────────────────
function ProgressStrip({ tasks, entries }: { tasks: Task[]; entries: any }) {
  let done = 0;
  tasks.forEach(t => { if (isTaskDone(t, entries[t.id])) done++; });
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;
  return (
    <View style={styles.progress}>
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Daily Progress</Text>
        <Text style={styles.progressCount}>{done}/{tasks.length}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>
    </View>
  );
}

// ─── Daily Screen ─────────────────────────────────────────────
export default function DailyScreen() {
  const { state, setState } = useStore();
  const [date, setDate] = useState(new Date());
  const key = dateKey(date);
  const dailyTasks = state.tasks.filter(t => t.frequency === 'daily');
  const entries = state.log[key] || {};

  const updateEntry = (taskId: string, entry: any) => {
    setState(s => {
      const log = { ...s.log };
      const day = { ...(log[key] || {}) };
      if (entry === null || (entry && Object.keys(entry).length === 0)) delete day[taskId];
      else day[taskId] = entry;
      if (Object.keys(day).length) log[key] = day;
      else delete log[key];
      return { ...s, log };
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <DateNav date={date} setDate={setDate} />
          <ProgressStrip tasks={dailyTasks} entries={entries} />
          <View style={styles.cards}>
            {dailyTasks.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>✦</Text>
                <Text style={styles.emptyTitle}>No daily tasks</Text>
                <Text style={styles.emptySub}>Add a daily task in the Tasks tab.</Text>
              </View>
            ) : dailyTasks.map(t => (
              <TaskCard key={t.id} task={t} entry={entries[t.id]} onChange={e => updateEntry(t.id, e)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Shared styles (also exported for monthly.tsx) ────────────
export const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },
  cards: { paddingHorizontal: 16, paddingTop: 4 },

  // Date nav
  dateNav:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 },
  iconBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: T.accentSurf, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center', justifyContent: 'center' },
  dateLabelBtn: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  dateMain:    { color: T.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  dateSub:     { color: T.accentDim, fontSize: 11, fontWeight: '600', marginTop: 2, letterSpacing: 0.4 },

  // Progress
  progress:     { paddingHorizontal: 20, paddingBottom: 14 },
  progressRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  progressLabel: { color: T.accentDim, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  progressCount: { color: T.accent, fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 5, borderRadius: 99, backgroundColor: T.accentSurf, overflow: 'hidden', borderWidth: 0.5, borderColor: T.cardBorder },
  progressFill:  { height: '100%', borderRadius: 99, backgroundColor: T.accent, shadowColor: T.accent, shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },

  // Card
  card:       { backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 22, padding: 18, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardTitle:  { flex: 1, minWidth: 0 },
  cardType:   { color: T.accentDim, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardName:   { color: T.text, fontSize: 19, fontWeight: '600', letterSpacing: -0.3, marginTop: 2 },

  // Dot
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  // Glow
  glowRow:   { flexDirection: 'row', gap: 10 },
  glowBtn:   { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  glowIcon:  { fontSize: 22 },
  glowLabel: { fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },

  // Chips
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:     { paddingHorizontal: 14, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },

  // Transfer
  transferBtn:    { flex: 1, height: 62, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  transferAmount: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  transferUnit:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },

  // Spend
  spendBox:      { borderRadius: 16, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  spendCurrency: { fontSize: 22, fontWeight: '600' },
  spendInput:    { flex: 1, color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.5, padding: 0 },
  spendUnit:     { color: T.accentDim, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },

  // Empty
  empty:      { marginTop: 60, alignItems: 'center' },
  emptyIcon:  { fontSize: 28, marginBottom: 16, color: T.accentDim },
  emptyTitle: { color: T.text, fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub:   { color: T.textSub, fontSize: 14 },

  // Calendar picker sheet
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#0D0D0D', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: T.cardBorder, paddingBottom: 34 },
  grabber:    { width: 40, height: 4, borderRadius: 2, backgroundColor: T.cardBorder, alignSelf: 'center', marginVertical: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  sheetCancel: { color: T.textSub, fontSize: 16 },
  sheetTitle:  { color: T.text, fontSize: 16, fontWeight: '700' },
  sheetAction: { color: T.accent, fontSize: 16, fontWeight: '700' },
  monthNav:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 12 },
  navBtn:      { width: 34, height: 34, borderRadius: 17, backgroundColor: T.accentSurf, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center', justifyContent: 'center' },
  monthLabel:  { color: T.text, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  weekdaysRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 6 },
  weekday:     { flex: 1, textAlign: 'center', color: T.accentDim, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  calRow:      { flexDirection: 'row', paddingHorizontal: 12, gap: 3, marginBottom: 3 },
  calCell:     { flex: 1, aspectRatio: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  calText:     { color: T.text, fontSize: 15, fontWeight: '500' },
  calDot:      { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: T.accent },
  calLegend:   { flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 16 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel:  { color: T.textSub, fontSize: 11 },
});
