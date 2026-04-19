import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Modal, Pressable, ScrollView,
} from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Svg, { Path } from 'react-native-svg';
import {
  useStore, Task, TaskType, TaskFrequency, PALETTE, T,
} from '@/context/store';
import { PillIcon, RunIcon, MoneyIcon, DragHandle, ExerciseIconGlyph } from '@/components/tracker/icons';

type ExerciseIcon = 'run' | 'bicycle' | 'sport' | 'drive';
const EXERCISE_ICONS: ExerciseIcon[] = ['run', 'bicycle', 'sport', 'drive'];

// ─── Reusable section wrapper ─────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionBox}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Task editor sheet ────────────────────────────────────────
function TaskEditorSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { setState } = useStore();
  const isNew = !task;
  const [draft, setDraft] = useState<Task>(() => task || {
    id: 't' + Date.now(),
    type: 'pill',
    name: '',
    color: PALETTE[0],
    created: Date.now(),
    frequency: 'daily',
    mode: 'duration',
    icon: 'run',
  });

  const save = () => {
    if (!draft.name.trim()) return;
    setState(s => {
      const tasks = [...s.tasks];
      const idx = tasks.findIndex(x => x.id === draft.id);
      if (idx >= 0) tasks[idx] = draft;
      else tasks.push({ ...draft, created: Date.now() });
      return { ...s, tasks };
    });
    onClose();
  };

  const del = () => {
    setState(s => ({ ...s, tasks: s.tasks.filter(x => x.id !== draft.id) }));
    onClose();
  };

  const types: { k: TaskType; l: string }[] = [
    { k: 'pill', l: '💊 Pill' },
    { k: 'exercise', l: '🏃 Exercise' },
    { k: 'transfer', l: '⇄ Transfer' },
    { k: 'spend', l: '฿ Spend' },
  ];

  const freqs: { k: TaskFrequency; l: string; sub: string }[] = [
    { k: 'daily', l: 'Daily', sub: 'Logged once per day' },
    { k: 'monthly', l: 'Monthly', sub: 'Logged once per month' },
  ];

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.grabber} />
          {/* Header */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.sheetCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>{isNew ? 'New task' : 'Edit task'}</Text>
            <TouchableOpacity onPress={save} disabled={!draft.name.trim()}>
              <Text style={[styles.sheetSave, !draft.name.trim() && { opacity: 0.35 }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Type switcher */}
            <View style={styles.typePicker}>
              <View style={styles.typePickerInner}>
                {types.map(o => (
                  <TouchableOpacity key={o.k} onPress={() => setDraft(d => ({ ...d, type: o.k }))}
                    style={[styles.typeBtn, draft.type === o.k && styles.typeBtnActive]}>
                    <Text style={[styles.typeBtnText, draft.type === o.k && { color: '#fff' }]}>{o.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Name */}
            <Section label="Name">
              <TextInput
                value={draft.name}
                onChangeText={v => setDraft(d => ({ ...d, name: v }))}
                placeholder={
                  draft.type === 'pill' ? 'e.g. Vitamin D'
                    : draft.type === 'exercise' ? 'e.g. Morning Run'
                    : draft.type === 'transfer' ? 'e.g. Savings'
                    : 'e.g. Groceries'
                }
                placeholderTextColor={T.textFaint}
                style={styles.nameInput}
              />
            </Section>

            {/* Frequency */}
            <Section label="Frequency">
              {freqs.map((f, i) => (
                <React.Fragment key={f.k}>
                  {i > 0 && <Divider />}
                  <TouchableOpacity onPress={() => setDraft(d => ({ ...d, frequency: f.k }))} style={styles.freqRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.freqLabel}>{f.l}</Text>
                      <Text style={styles.freqSub}>{f.sub}</Text>
                    </View>
                    <View style={[styles.radio, draft.frequency === f.k && { backgroundColor: T.accent, borderWidth: 0 }]}>
                      {draft.frequency === f.k && (
                        <Svg width="10" height="8" viewBox="0 0 13 10">
                          <Path d="M1 5l3.5 3.5L12 1" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </Section>

            {/* Exercise mode */}
            {draft.type === 'exercise' && (
              <Section label="Tracking">
                {[{ k: 'duration' as const, l: 'Duration', s: 'minutes' }, { k: 'distance' as const, l: 'Distance', s: 'metres' }].map((m, i) => (
                  <React.Fragment key={m.k}>
                    {i > 0 && <Divider />}
                    <TouchableOpacity onPress={() => setDraft(d => ({ ...d, mode: m.k }))} style={styles.freqRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.freqLabel}>{m.l}</Text>
                        <Text style={styles.freqSub}>{m.s}</Text>
                      </View>
                      <View style={[styles.radio, draft.mode === m.k && { backgroundColor: T.accent, borderWidth: 0 }]}>
                        {draft.mode === m.k && (
                          <Svg width="10" height="8" viewBox="0 0 13 10">
                            <Path d="M1 5l3.5 3.5L12 1" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        )}
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </Section>
            )}

            {/* Exercise icon */}
            {draft.type === 'exercise' && (
              <Section label="Icon">
                <View style={styles.iconRow}>
                  {EXERCISE_ICONS.map(ic => {
                    const active = (draft.icon || 'run') === ic;
                    return (
                      <TouchableOpacity key={ic} onPress={() => setDraft(d => ({ ...d, icon: ic }))}
                        style={[
                          styles.iconBtn,
                          active
                            ? { backgroundColor: draft.color + '22', borderColor: draft.color, shadowColor: draft.color, shadowOpacity: 0.35, shadowRadius: 7, shadowOffset: { width: 0, height: 0 } }
                            : { backgroundColor: T.accentSurf, borderColor: T.cardBorder },
                        ]}>
                        <ExerciseIconGlyph kind={ic} color={active ? draft.color : T.accentDim} size={26} />
                        <Text style={[styles.iconLabel, { color: active ? '#fff' : T.textSub }]}>{ic}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Section>
            )}

            {/* Color */}
            <Section label="Color">
              <View style={styles.colorRow}>
                {PALETTE.map(c => (
                  <TouchableOpacity key={c} onPress={() => setDraft(d => ({ ...d, color: c }))}
                    style={[
                      styles.colorSwatch, { backgroundColor: c },
                      draft.color === c && { shadowColor: c, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
                    ]}>
                    {draft.color === c && (
                      <Svg width="12" height="10" viewBox="0 0 13 10">
                        <Path d="M1 5l3.5 3.5L12 1" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            {/* Delete */}
            {!isNew && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <TouchableOpacity onPress={del} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>Delete task</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Frequency badge ──────────────────────────────────────────
function FreqBadge({ freq }: { freq: TaskFrequency }) {
  return (
    <View style={[styles.badge, freq === 'monthly' && styles.badgeMonthly]}>
      <Text style={[styles.badgeText, freq === 'monthly' && styles.badgeTextMonthly]}>
        {freq === 'daily' ? 'Daily' : 'Monthly'}
      </Text>
    </View>
  );
}

// ─── Tasks screen ─────────────────────────────────────────────
export default function TasksScreen() {
  const { state, setState } = useStore();
  const [editorTask, setEditorTask] = useState<Task | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const openEditor = (t: Task | null) => { setEditorTask(t); setEditorOpen(true); };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <ScaleDecorator>
      <View style={[
        styles.taskRow,
        isActive && { borderColor: T.accent, shadowColor: T.accent, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, opacity: 0.75 },
      ]}>
        <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
          <DragHandle />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openEditor(item)} style={styles.taskInner}>
          {item.type === 'pill'     ? <PillIcon color={item.color} />
           : item.type === 'exercise' ? <RunIcon color={item.color} icon={item.icon || 'run'} />
           : <MoneyIcon color={item.color} kind={item.type === 'transfer' ? 'transfer' : 'spend'} />}
          <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
            <Text style={styles.taskName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.taskSub}>
              {item.type === 'pill'     ? 'Pill · Morning + Evening'
               : item.type === 'exercise' ? `Exercise · ${item.mode === 'duration' ? 'Duration (min)' : 'Distance (m)'}`
               : item.type === 'transfer' ? 'Money transfer · THB'
               : 'Money spend · THB'}
            </Text>
          </View>
          <FreqBadge freq={item.frequency} />
          <Svg width="8" height="14" viewBox="0 0 8 14" style={{ marginLeft: 8 }}>
            <Path d="M1 1l6 6-6 6" stroke={T.accentDim} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>
    </ScaleDecorator>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.heading}>Your tasks</Text>
          <Text style={styles.subheading}>Tap to edit · hold the handle to reorder.</Text>
        </View>
        <DraggableFlatList
          data={state.tasks}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => setState(s => ({ ...s, tasks: data }))}
          contentContainerStyle={styles.list}
          ListFooterComponent={() => (
            <TouchableOpacity onPress={() => openEditor(null)} style={styles.addBtn}>
              <Svg width="14" height="14" viewBox="0 0 14 14">
                <Path d="M7 1v12M1 7h12" stroke={T.accent} strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={styles.addBtnText}>Add new task</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
      {editorOpen && (
        <TaskEditorSheet task={editorTask} onClose={() => setEditorOpen(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.bg },
  header:     { padding: 20, paddingBottom: 16 },
  heading:    { color: T.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  subheading: { color: T.textSub, fontSize: 13, marginTop: 3 },
  list:       { paddingHorizontal: 16, paddingBottom: 120 },

  taskRow:    { backgroundColor: T.card, borderRadius: 18, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: T.cardBorder },
  dragHandle: { width: 22, height: 36, alignItems: 'center', justifyContent: 'center' },
  taskInner:  { flex: 1, flexDirection: 'row', alignItems: 'center' },
  taskName:   { color: T.text, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  taskSub:    { color: T.textSub, fontSize: 12, marginTop: 2 },

  badge:          { backgroundColor: T.accentSurf, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: T.cardBorder },
  badgeMonthly:   { backgroundColor: 'rgba(244,183,64,0.12)', borderColor: T.accentDim },
  badgeText:      { color: T.textSub, fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  badgeTextMonthly: { color: T.accent },

  addBtn:     { backgroundColor: T.accentFaint, borderRadius: 18, padding: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: T.cardBorder },
  addBtnText: { color: T.accent, fontSize: 16, fontWeight: '700' },

  // Editor sheet
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#0D0D0D', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: T.cardBorder, maxHeight: '92%', paddingBottom: 34 },
  grabber:     { width: 40, height: 4, borderRadius: 2, backgroundColor: T.cardBorder, alignSelf: 'center', marginVertical: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  sheetCancel: { color: T.textSub, fontSize: 16 },
  sheetTitle:  { color: T.text, fontSize: 16, fontWeight: '700' },
  sheetSave:   { color: T.accent, fontSize: 16, fontWeight: '700' },

  typePicker:      { padding: 16, paddingTop: 4 },
  typePickerInner: { flexDirection: 'row', backgroundColor: T.accentSurf, borderRadius: 10, padding: 3, gap: 2, borderWidth: 1, borderColor: T.cardBorder },
  typeBtn:         { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  typeBtnActive:   { backgroundColor: T.accent },
  typeBtnText:     { color: T.textSub, fontSize: 12, fontWeight: '700' },

  section:      { paddingHorizontal: 16, paddingBottom: 14 },
  sectionLabel: { color: T.accentDim, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, padding: 4, paddingBottom: 8 },
  sectionBox:   { backgroundColor: T.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.cardBorder },
  divider:      { height: 0.5, backgroundColor: T.divider, marginHorizontal: 16 },

  nameInput: { color: T.text, fontSize: 17, padding: 14, paddingHorizontal: 16 },

  freqRow:   { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  freqLabel: { color: T.text, fontSize: 16, fontWeight: '500' },
  freqSub:   { color: T.textSub, fontSize: 12, marginTop: 2 },
  radio:     { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: T.cardBorder, alignItems: 'center', justifyContent: 'center' },

  iconRow:   { flexDirection: 'row', gap: 10, padding: 16, flexWrap: 'wrap' },
  iconBtn:   { width: 58, height: 58, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 2 },
  iconLabel: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize', letterSpacing: 0.2 },

  colorRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  deleteBtn:     { backgroundColor: 'rgba(255,69,58,0.1)', borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,69,58,0.3)' },
  deleteBtnText: { color: '#FF453A', fontSize: 16, fontWeight: '700' },
});
