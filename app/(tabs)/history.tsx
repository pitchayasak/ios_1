import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  useStore, dateKey, monthKey, addDays,
  completionLevel, cellColor, Task, T, logKey,
} from '@/context/store';
import { PillIcon, RunIcon, MoneyIcon } from '@/components/tracker/icons';
import { useRouter } from 'expo-router';

// ─── CalendarGrid ─────────────────────────────────────────────
// For monthly tasks, each cell looks up monthKey(d) — entire month glows.
function CalendarGrid({ task, log, weeks = 18, onCellPress }: {
  task: Task; log: any; weeks?: number; onCellPress?: (d: Date) => void;
}) {
  const today = new Date();
  const endCol = new Date(today);
  endCol.setDate(endCol.getDate() + (6 - endCol.getDay()));

  const columns: { date: Date; level: number }[][] = [];
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;

  for (let col = 0; col < weeks; col++) {
    const weekStart = new Date(endCol);
    weekStart.setDate(weekStart.getDate() - (weeks - 1 - col) * 7 - 6);
    const column: { date: Date; level: number }[] = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + r);
      if (d.getDate() === 1 && d.getMonth() !== lastMonth && d <= today) {
        monthLabels.push({ col, label: d.toLocaleDateString('en-US', { month: 'short' }) });
        lastMonth = d.getMonth();
      }
      const key = logKey(task, d);
      const entry = log[key]?.[task.id];
      const level = d > today ? -1 : completionLevel(task, entry);
      column.push({ date: d, level });
    }
    columns.push(column);
  }

  const CELL = 13, GAP = 3;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={{ flexDirection: 'row', height: 14, marginBottom: 4 }}>
          {monthLabels.map((m, i) => (
            <View key={i} style={{ position: 'absolute', left: m.col * (CELL + GAP) }}>
              <Text style={styles.gridMonthLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: GAP }}>
          {columns.map((col, ci) => (
            <View key={ci} style={{ gap: GAP }}>
              {col.map((cell, ri) => (
                <TouchableOpacity key={ri}
                  disabled={cell.level === -1}
                  onPress={() => cell.level !== -1 && onCellPress?.(cell.date)}
                  style={{
                    width: CELL, height: CELL, borderRadius: 3,
                    backgroundColor: cell.level === -1 ? 'transparent' : cellColor(cell.level, task.color),
                    borderWidth: cell.level === 0 ? 0.5 : 0,
                    borderColor: T.divider,
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Stats ────────────────────────────────────────────────────
function Stats({ task, log }: { task: Task; log: any }) {
  const today = new Date();
  let streak = 0, best = 0, total = 0, cur = 0;

  // Streak + total across last 180 days (daily) or 18 months (monthly)
  const isMo = task.frequency === 'monthly';
  const steps = isMo ? 18 : 180;

  for (let i = steps; i >= 0; i--) {
    const d = isMo ? new Date(today.getFullYear(), today.getMonth() - i, 1) : addDays(today, -i);
    const key = isMo ? monthKey(d) : dateKey(d);
    const entry = log[key]?.[task.id];
    const level = completionLevel(task, entry);
    const done = level >= (task.type === 'pill' ? 4 : 1);
    if (done) { cur++; total++; best = Math.max(best, cur); } else cur = 0;
  }
  streak = 0;
  for (let i = 0; i < steps; i++) {
    const d = isMo ? new Date(today.getFullYear(), today.getMonth() - i, 1) : addDays(today, -i);
    const key = isMo ? monthKey(d) : dateKey(d);
    const entry = log[key]?.[task.id];
    const level = completionLevel(task, entry);
    const done = level >= (task.type === 'pill' ? 4 : 1);
    if (done) streak++;
    else { if (i === 0) continue; break; }
  }

  const unit = isMo ? 'mo' : 'd';
  return (
    <View style={styles.statsRow}>
      <StatCell label="Streak" value={streak} unit={unit} />
      <StatCell label="Best"   value={best}   unit={unit} />
      <StatCell label="Total"  value={total}  unit={unit} />
    </View>
  );
}

function StatCell({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}<Text style={styles.statUnit}> {unit}</Text></Text>
    </View>
  );
}

// ─── FullYearSheet ────────────────────────────────────────────
function FullYearSheet({ task, log, onClose, onGoToDay }: {
  task: Task; log: any; onClose: () => void; onGoToDay: (d: Date) => void;
}) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => thisYear - i);
  const [year, setYear] = useState(thisYear);
  const [pickerOpen, setPickerOpen] = useState(false);
  const today = new Date();
  const isMo = task.frequency === 'monthly';
  const CELL = 11, GAP = 2.5;

  let yearTotal = 0, yearDays = 0, yearSum = 0;
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const day = new Date(year, m, d);
      if (day > today) continue;
      const key = isMo ? `${year}-${String(m + 1).padStart(2, '0')}` : dateKey(day);
      // avoid double-counting monthly tasks (count only first of month)
      if (isMo && d !== 1) continue;
      const e = log[key]?.[task.id];
      if (!e) continue;
      const lv = completionLevel(task, e);
      if (lv >= (task.type === 'pill' ? 4 : 1)) yearTotal++;
      yearDays++;
      if (task.type === 'transfer' || task.type === 'spend') {
        const n = parseFloat((e as any).amount);
        if (isFinite(n)) yearSum += n;
      }
    }
  }

  const months = Array.from({ length: 12 }, (_, m) => {
    const first = new Date(year, m, 1);
    const last  = new Date(year, m + 1, 0);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, m, d));
    return { name: first.toLocaleDateString('en-US', { month: 'short' }), cells };
  });

  return (
    <Modal animationType="slide" onRequestClose={onClose}>
      <View style={[styles.yearSheet, { backgroundColor: T.bg }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.yearHeader}>
            <TouchableOpacity onPress={onClose} style={styles.yearBackBtn}>
              <Svg width="8" height="12" viewBox="0 0 10 16">
                <Path d="M8 1L1 8l7 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.yearBackText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPickerOpen(v => !v)} style={styles.yearPickerBtn}>
              <Text style={styles.yearPickerText}>{year}</Text>
              <Svg width="9" height="6" viewBox="0 0 9 6">
                <Path d="M1 1l3.5 3.5L8 1" stroke={T.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.yearTaskRow}>
            {task.type === 'pill' ? <PillIcon color={task.color} />
              : task.type === 'exercise' ? <RunIcon color={task.color} icon={task.icon || 'run'} />
              : <MoneyIcon color={task.color} kind={task.type === 'transfer' ? 'transfer' : 'spend'} />}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.yearTaskType}>
                {task.frequency === 'monthly' ? 'MONTHLY · ' : 'DAILY · '}
                {task.type === 'pill' ? 'MEDICATION'
                  : task.type === 'exercise' ? (task.mode === 'distance' ? 'DISTANCE' : 'DURATION')
                  : task.type === 'transfer' ? 'TRANSFER · THB' : 'SPEND · THB'}
              </Text>
              <Text style={styles.yearTaskName}>{task.name}</Text>
            </View>
          </View>

          <View style={styles.yearStats}>
            <YearStat label="Done" value={String(yearTotal)} />
            <YearStat label="Logged" value={String(yearDays)} />
            {(task.type === 'transfer' || task.type === 'spend') && (
              <YearStat label="Total" value={`฿${Math.round(yearSum).toLocaleString()}`} />
            )}
          </View>

          {pickerOpen && (
            <View style={styles.yearDropdown}>
              {years.map(y => (
                <TouchableOpacity key={y} onPress={() => { setYear(y); setPickerOpen(false); }}
                  style={[styles.yearDropItem, y === year && { backgroundColor: T.accentFaint }]}>
                  <Text style={[styles.yearDropText, y === year && { color: T.accent, fontWeight: '700' }]}>{y}</Text>
                  {y === year && (
                    <Svg width="12" height="10" viewBox="0 0 13 10">
                      <Path d="M1 5l3.5 3.5L12 1" stroke={T.accent} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ScrollView contentContainerStyle={styles.monthsGrid} showsVerticalScrollIndicator={false}>
            {months.map((mo, mi) => {
              const rows: (Date | null)[][] = [];
              for (let i = 0; i < mo.cells.length; i += 7) rows.push(mo.cells.slice(i, i + 7));
              return (
                <View key={mi} style={styles.monthCard}>
                  <Text style={styles.monthName}>{mo.name}</Text>
                  {rows.map((row, ri) => (
                    <View key={ri} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                      {Array.from({ length: 7 }, (_, ci) => {
                        const d = row[ci] ?? null;
                        if (!d) return <View key={ci} style={{ width: CELL, height: CELL }} />;
                        const future = d > today;
                        const key = isMo ? `${year}-${String(d.getMonth() + 1).padStart(2, '0')}` : dateKey(d);
                        const entry = log[key]?.[task.id];
                        const lv = future ? -1 : completionLevel(task, entry);
                        return (
                          <TouchableOpacity key={ci} disabled={future}
                            onPress={() => !future && onGoToDay(d)}
                            style={{
                              width: CELL, height: CELL, borderRadius: 2.5,
                              backgroundColor: future ? 'transparent' : cellColor(lv, task.color),
                              borderWidth: lv === 0 ? 0.5 : 0, borderColor: T.divider,
                            }}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function YearStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.yearStatLabel}>{label}</Text>
      <Text style={styles.yearStatValue}>{value}</Text>
    </View>
  );
}

// ─── Legend ───────────────────────────────────────────────────
function Legend() {
  return (
    <View style={styles.legend}>
      <Text style={styles.legendText}>Less</Text>
      {[0, 1, 2, 3, 4].map(l => (
        <View key={l} style={{ width: 11, height: 11, borderRadius: 2.5, backgroundColor: cellColor(l, T.accent) }} />
      ))}
      <Text style={styles.legendText}>More</Text>
    </View>
  );
}

// ─── Frequency badge ──────────────────────────────────────────
function FreqBadge({ freq }: { freq: string }) {
  const isMonthly = freq === 'monthly';
  return (
    <View style={[styles.freqBadge, isMonthly && styles.freqBadgeMonthly]}>
      <Text style={[styles.freqBadgeText, isMonthly && { color: T.accent }]}>
        {isMonthly ? 'Monthly' : 'Daily'}
      </Text>
    </View>
  );
}

// ─── TaskHistoryCard ──────────────────────────────────────────
function TaskHistoryCard({ task, log, onOpenFullYear, onGoToDay }: {
  task: Task; log: any; onOpenFullYear: (t: Task) => void; onGoToDay: (d: Date) => void;
}) {
  return (
    <View style={styles.historyCard}>
      <TouchableOpacity onPress={() => onOpenFullYear(task)} style={styles.historyCardHeader}>
        {task.type === 'pill' ? <PillIcon color={task.color} />
          : task.type === 'exercise' ? <RunIcon color={task.color} icon={task.icon || 'run'} />
          : <MoneyIcon color={task.color} kind={task.type === 'transfer' ? 'transfer' : 'spend'} />}
        <View style={{ flex: 1, marginLeft: 12, marginRight: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <Text style={styles.historyCardType}>
              {task.type === 'pill' ? 'Medication'
                : task.type === 'exercise' ? (task.mode === 'distance' ? 'Distance' : 'Duration')
                : task.type === 'transfer' ? 'Transfer · THB' : 'Spend · THB'}
            </Text>
            <FreqBadge freq={task.frequency} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.historyCardName}>{task.name}</Text>
            <Svg width="6" height="10" viewBox="0 0 8 14">
              <Path d="M1 1l6 6-6 6" stroke={T.accentDim} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </View>
      </TouchableOpacity>
      {task.frequency === 'monthly' ? (
        <View style={styles.monthlyNote}>
          <Text style={styles.monthlyNoteText}>
            Monthly — cells show per-month completion across the last 18 weeks.
          </Text>
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: -2 }}>
        <CalendarGrid task={task} log={log} onCellPress={onGoToDay} />
      </ScrollView>
      <Stats task={task} log={log} />
    </View>
  );
}

// ─── History screen ───────────────────────────────────────────
export default function HistoryScreen() {
  const { state } = useStore();
  const [fullYearTask, setFullYearTask] = useState<Task | null>(null);
  const router = useRouter();

  const goToDay = (_d: Date) => { router.push('/'); };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.heading}>Last 18 weeks</Text>
            <Text style={styles.subheading}>Tap a task name for full-year view · tap a day to jump there.</Text>
          </View>
          <Legend />
          <View style={{ paddingHorizontal: 16 }}>
            {state.tasks.length === 0 ? (
              <Text style={styles.empty}>Nothing to show — add a task first.</Text>
            ) : state.tasks.map(t => (
              <TaskHistoryCard key={t.id} task={t} log={state.log}
                onOpenFullYear={setFullYearTask}
                onGoToDay={goToDay} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      {fullYearTask && (
        <FullYearSheet
          task={fullYearTask} log={state.log}
          onClose={() => setFullYearTask(null)}
          onGoToDay={d => { setFullYearTask(null); goToDay(d); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  header:    { padding: 20, paddingBottom: 14 },
  heading:   { color: T.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  subheading: { color: T.textSub, fontSize: 13, marginTop: 3 },

  legend:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingBottom: 14, justifyContent: 'flex-end' },
  legendText: { color: T.accentDim, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700' },

  historyCard:       { backgroundColor: T.card, borderRadius: 22, borderWidth: 1, borderColor: T.cardBorder, padding: 18, marginBottom: 14 },
  historyCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  historyCardType:   { color: T.accentDim, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  historyCardName:   { color: T.text, fontSize: 19, fontWeight: '600', letterSpacing: -0.3, marginTop: 2 },

  freqBadge:        { backgroundColor: T.accentSurf, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: T.cardBorder },
  freqBadgeMonthly: { backgroundColor: T.accentFaint, borderColor: T.accentDim },
  freqBadgeText:    { color: T.textSub, fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },

  monthlyNote:     { backgroundColor: T.accentSurf, borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: T.cardBorder },
  monthlyNoteText: { color: T.accentDim, fontSize: 11, fontWeight: '500' },

  gridMonthLabel: { color: T.accentDim, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'monospace' },

  statsRow:  { flexDirection: 'row', gap: 24, marginTop: 14, paddingLeft: 2 },
  statLabel: { color: T.accentDim, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'monospace' },
  statValue: { color: T.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  statUnit:  { color: T.textSub, fontSize: 12, fontWeight: '500' },

  empty: { color: T.textSub, textAlign: 'center', padding: 60, fontSize: 14 },

  // Full-year
  yearSheet:      { flex: 1 },
  yearHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
  yearBackBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.accentSurf, height: 34, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder },
  yearBackText:   { color: T.text, fontSize: 14, fontWeight: '700' },
  yearPickerBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.accentFaint, height: 34, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder },
  yearPickerText: { color: T.accent, fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  yearTaskRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  yearTaskType:   { color: T.accentDim, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  yearTaskName:   { color: T.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.4, marginTop: 2 },
  yearStats:      { flexDirection: 'row', gap: 18, marginHorizontal: 16, padding: 12, backgroundColor: T.accentSurf, borderRadius: 14, borderWidth: 1, borderColor: T.cardBorder, marginBottom: 4 },
  yearStatLabel:  { color: T.accentDim, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'monospace' },
  yearStatValue:  { color: T.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginTop: 2 },
  yearDropdown:   { position: 'absolute', top: 100, right: 16, zIndex: 10, backgroundColor: '#111', borderRadius: 14, padding: 4, shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, minWidth: 120, borderWidth: 1, borderColor: T.cardBorder },
  yearDropItem:   { padding: 10, paddingHorizontal: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  yearDropText:   { color: T.text, fontSize: 15, fontWeight: '500' },
  monthsGrid:     { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 14, paddingBottom: 100 },
  monthCard:      { width: '30%', backgroundColor: T.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: T.cardBorder },
  monthName:      { color: T.accentDim, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', paddingLeft: 2, marginBottom: 6 },
});
