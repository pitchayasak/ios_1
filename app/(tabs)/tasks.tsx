import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Modal, Pressable,
  ScrollView,
} from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  useStore, Task, TaskType, ExerciseMode, ExerciseIcon, PALETTE, ACCENT,
} from '@/context/store';
import {
  PillIcon, RunIcon, MoneyIcon, DragHandle, ExerciseIconGlyph,
} from '@/components/tracker/icons';

const BG = '#000';
const CARD = 'rgba(28,28,30,0.92)';
const EXERCISE_ICONS: ExerciseIcon[] = ['run', 'bicycle', 'sport', 'drive'];

// ─── Section helper ───────────────────────────────────────────
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

// ─── TaskEditorSheet ──────────────────────────────────────────
function TaskEditorSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { setState } = useStore();
  const isNew = !task;
  const [draft, setDraft] = useState<Task>(() => task || {
    id: 't' + Date.now(),
    type: 'pill',
    name: '',
    color: PALETTE[0],
    created: Date.now(),
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
            <Text style={styles.sheetTitle}>{isNew ? 'New task' : 'Edit task'}</Text>
            <TouchableOpacity onPress={save} disabled={!draft.name.trim()}>
              <Text style={[styles.sheetSave, !draft.name.trim() && { opacity: 0.35 }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Type selector */}
            <View style={styles.typePicker}>
              <View style={styles.typePickerInner}>
                {types.map(o => (
                  <TouchableOpacity key={o.k} onPress={() => setDraft(d => ({ ...d, type: o.k }))}
                    style={[styles.typeBtn, draft.type === o.k && styles.typeBtnActive]}>
                    <Text style={styles.typeBtnText}>{o.l}</Text>
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
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.nameInput}
              />
            </Section>

            {/* Exercise mode */}
            {draft.type === 'exercise' && (
              <Section label="Tracking">
                <TouchableOpacity onPress={() => setDraft(d => ({ ...d, mode: 'duration' }))} style={styles.modeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modeLabel}>Duration</Text>
                    <Text style={styles.modeSub}>minutes</Text>
                  </View>
                  <View style={[styles.radio, draft.mode === 'duration' && { backgroundColor: ACCENT, borderWidth: 0 }]}>
                    {draft.mode === 'duration' && (
                      <Svg width="10" height="8" viewBox="0 0 13 10">
                        <Path d="M1 5l3.5 3.5L12 1" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity onPress={() => setDraft(d => ({ ...d, mode: 'distance' }))} style={styles.modeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modeLabel}>Distance</Text>
                    <Text style={styles.modeSub}>metres</Text>
                  </View>
                  <View style={[styles.radio, draft.mode === 'distance' && { backgroundColor: ACCENT, borderWidth: 0 }]}>
                    {draft.mode === 'distance' && (
                      <Svg width="10" height="8" viewBox="0 0 13 10">
                        <Path d="M1 5l3.5 3.5L12 1" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>
              </Section>
            )}

            {/* Exercise icon */}
            {draft.type === 'exercise' && (
              <Section label="Icon">
                <View style={styles.iconPickerRow}>
                  {EXERCISE_ICONS.map(ic => {
                    const active = (draft.icon || 'run') === ic;
                    return (
                      <TouchableOpacity key={ic} onPress={() => setDraft(d => ({ ...d, icon: ic }))}
                        style={[
                          styles.iconPickerBtn,
                          active
                            ? { backgroundColor: draft.color + '22', borderColor: draft.color, shadowColor: draft.color, shadowOpacity: 0.35, shadowRadius: 7, shadowOffset: { width: 0, height: 0 } }
                            : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
                        ]}>
                        <ExerciseIconGlyph kind={ic} color={draft.color} size={26} />
                        <Text style={[styles.iconPickerLabel, active ? { color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }]}>
                          {ic}
                        </Text>
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
                      styles.colorSwatch,
                      { backgroundColor: c },
                      draft.color === c && { shadowColor: c, shadowOpacity: 0.45, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
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

// ─── Tasks Screen ─────────────────────────────────────────────
export default function TasksScreen() {
  const { state, setState } = useStore();
  const [editorTask, setEditorTask] = useState<Task | null | 'new'>('new' as any);
  const [editorOpen, setEditorOpen] = useState(false);

  const openEditor = (t: Task | null) => {
    setEditorTask(t);
    setEditorOpen(true);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <ScaleDecorator>
        <View style={[
          styles.taskRow,
          isActive && { shadowColor: ACCENT, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, opacity: 0.7 },
        ]}>
          <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
            <DragHandle />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openEditor(item)} style={styles.taskRowInner}>
            {item.type === 'pill' ? <PillIcon color={item.color} />
              : item.type === 'exercise' ? <RunIcon color={item.color} icon={item.icon || 'run'} />
              : <MoneyIcon color={item.color} kind={item.type === 'transfer' ? 'transfer' : 'spend'} />}
            <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
              <Text style={styles.taskName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.taskSub}>
                {item.type === 'pill' ? 'Pill · Morning + Evening'
                  : item.type === 'exercise' ? `Exercise · ${item.mode === 'duration' ? 'Duration (min)' : 'Distance (m)'}`
                  : item.type === 'transfer' ? 'Money transfer · THB'
                  : 'Money spend · THB'}
              </Text>
            </View>
            <Svg width="8" height="14" viewBox="0 0 8 14">
              <Path d="M1 1l6 6-6 6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </ScaleDecorator>
    );
  };

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
                <Path d="M7 1v12M1 7h12" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={styles.addBtnText}>Add new task</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
      {editorOpen && (
        <TaskEditorSheet
          task={editorTask === ('new' as any) ? null : editorTask as Task | null}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: { padding: 20, paddingBottom: 20 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  subheading: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 3 },
  list: { paddingHorizontal: 16, paddingBottom: 120 },

  taskRow: {
    backgroundColor: CARD,
    borderRadius: 18, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)',
  },
  dragHandle: { width: 22, height: 36, alignItems: 'center', justifyContent: 'center' },
  taskRowInner: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  taskName: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  taskSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },

  addBtn: {
    backgroundColor: 'rgba(244,183,64,0.12)',
    borderRadius: 18, padding: 16, marginTop: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(244,183,64,0.3)',
  },
  addBtnText: { color: ACCENT, fontSize: 16, fontWeight: '600' },

  // Editor sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', paddingBottom: 34 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginVertical: 8 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  sheetCancel: { color: 'rgba(255,255,255,0.65)', fontSize: 16 },
  sheetTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sheetSave: { color: ACCENT, fontSize: 16, fontWeight: '600' },

  typePicker: { padding: 16, paddingTop: 4 },
  typePickerInner: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 },
  typeBtn: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  typeBtnActive: { backgroundColor: 'rgba(120,120,128,0.5)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' },
  typeBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  section: { paddingHorizontal: 16, paddingBottom: 14 },
  sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, padding: 4, paddingBottom: 8 },
  sectionBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)' },
  divider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 },

  nameInput: { color: '#fff', fontSize: 17, padding: 14, paddingHorizontal: 16 },

  modeRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  modeLabel: { color: '#fff', fontSize: 16, fontWeight: '500' },
  modeSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  iconPickerRow: { flexDirection: 'row', gap: 10, padding: 16, flexWrap: 'wrap' },
  iconPickerBtn: { width: 58, height: 58, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 2 },
  iconPickerLabel: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize', letterSpacing: 0.2 },

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  deleteBtn: { backgroundColor: 'rgba(255,69,58,0.12)', borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#FF453A', fontSize: 16, fontWeight: '600' },
});
