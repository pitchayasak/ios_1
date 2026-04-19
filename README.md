# My Daily Tracker

A minimalistic dark-mode iOS daily habit tracker built with **Expo** + **React Native** + **TypeScript**.

Track pills, exercise, money transfers, and spending — all in one place. History is saved locally on the device using AsyncStorage.

---

## Features

- **Home** — View and log today's tasks. Navigate to any past day using the calendar picker or the previous/next arrows.
- **History** — GitHub-style contribution grid showing the last 18 weeks per task. Tap a task name to open a full-year view with a year picker (up to 5 years back).
- **Tasks** — Create, edit, delete, and drag-and-drop reorder your tasks.
- **Settings** — Placeholder for future settings.

### Task types

| Type | Interaction |
|------|-------------|
| **Pill** | Morning ☀ and Evening ☾ glow toggle buttons |
| **Exercise** | Chip buttons for duration (15–60 min) or distance (500 m–2 km); choose an icon: run / bicycle / sport / drive |
| **Money Transfer** | Preset buttons: ฿7,500 or ฿20,000 |
| **Money Spend** | Free-entry decimal input (up to ฿999,999.99) |

### Data

- All data is stored locally with **AsyncStorage** — no account or network required.
- The app seeds 90 days of sample history on first launch so the History tab has data to display immediately.

---

## Tech stack

| | |
|-|---|
| Framework | [Expo](https://expo.dev) SDK 54 (managed workflow) |
| Language | TypeScript (strict) |
| Navigation | [Expo Router](https://expo.dev/router) v6 (file-based) |
| State | React Context + AsyncStorage |
| Icons | [react-native-svg](https://github.com/software-mansion/react-native-svg) (custom drawn) |
| Drag & drop | [react-native-draggable-flatlist](https://github.com/computerjazz/react-native-draggable-flatlist) |
| Gestures | react-native-gesture-handler + react-native-reanimated |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (`npm install -g expo-cli`) or use `npx`
- For iOS: Xcode + iOS Simulator **or** the [Expo Go](https://expo.dev/go) app on a physical device
- For Android: Android Studio + emulator **or** Expo Go on a physical device

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npx expo start
```

Then press one of the following in the terminal:

| Key | Action |
|-----|--------|
| `i` | Open in iOS Simulator |
| `a` | Open in Android emulator |
| `s` | Switch to Expo Go (scan QR with the Expo Go app) |
| `w` | Open in web browser |

### Run on a physical device

1. Install **Expo Go** from the App Store or Google Play.
2. Run `npx expo start`.
3. Scan the QR code shown in the terminal with your camera (iOS) or the Expo Go app (Android).

---

## Project structure

```
app/
  _layout.tsx              # Root layout — wraps app in StoreProvider + GestureHandler
  (tabs)/
    _layout.tsx            # Bottom tab bar with custom SVG icons
    index.tsx              # Home screen
    history.tsx            # History screen
    tasks.tsx              # Tasks screen (CRUD + drag-and-drop)
    settings.tsx           # Settings screen (placeholder)

components/
  tracker/
    icons.tsx              # All custom SVG icons (PillIcon, RunIcon, MoneyIcon, etc.)

context/
  store.tsx                # Global state, AsyncStorage persistence, date helpers, types
```

---

## Resetting app data

To wipe all stored data and start fresh, clear the app's storage from your device settings, or uninstall and reinstall the app. The seed history will be regenerated on next launch.
