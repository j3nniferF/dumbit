# Visual Feature Guide

## How Each Feature Works (Step-by-Step)

---

## 1. ✏️ Inline Task Editing

### Before:
```
Task List:
☐ Buy cat food
☐ Email landlord
☐ Finish capstone work
```

### Action: Double-click "Buy cat food"
```
Task List:
☐ [Buy cat food          ] ← Red border, editable input
☐ Email landlord
☐ Finish capstone work
```

### Action: Type "Buy dog food" and press Enter
```
Task List:
☐ Buy dog food ← Updated!
☐ Email landlord
☐ Finish capstone work
```

**Visual Changes:**
- Text becomes input field with RED BORDER
- Cursor automatically focused
- Press Enter = Save
- Press Escape = Cancel
- Click outside = Save

---

## 2. 🗑️ Clear Completed Tasks

### Before:
```
DUE TODAY tab:
☑ Buy cat food (completed)
☐ Email landlord
☑ Finish capstone work (completed)

[+ ADD MORE SHIT] [ADD]
```

### After clicking "CLEAR COMPLETED":
```
Dialog: "Clear 2 completed task(s) from DUE TODAY?"
[Cancel] [OK]
```

### Result:
```
DUE TODAY tab:
☐ Email landlord

[+ ADD MORE SHIT] [ADD]
[CLEAR COMPLETED] ← Button appears here
```

**Visual Changes:**
- New button below input: RED background
- Shows confirmation dialog
- Completed tasks removed from list
- Button always visible

---

## 3. 💾 Data Export/Import

### Export Flow:

#### Step 1: Scroll to bottom
```
SHIT I DID
0/8 OF ALL TASKS DONE

[💾 EXPORT DATA] [📥 IMPORT DATA]

🧨 RESET EVERYTHING
```

#### Step 2: Click "💾 EXPORT DATA"
```
Browser downloads:
📁 dumbit-tasks-2026-02-09.json (2.4 KB)
```

#### Step 3: File contents (example)
```json
{
  "tasksByTab": {
    "dueToday": ["Email landlord", "Take meds"],
    "soon": ["Clean kitchen"],
    "asSoonAsICan": ["Organize closet"],
    "dontForget": ["Buy cat food"]
  },
  "completedByTab": {
    "dueToday": ["Finish capstone work"],
    "soon": [],
    "asSoonAsICan": [],
    "dontForget": []
  },
  "activeTabKey": "dueToday",
  "focusScope": "dueToday",
  "selectedFocusValue": ""
}
```

### Import Flow:

#### Step 1: Click "📥 IMPORT DATA"
```
File picker opens:
[Choose File] dumbit-tasks-2026-02-09.json
```

#### Step 2: Confirmation
```
Dialog: "⚠️ IMPORT DATA? ⚠️
This will REPLACE all current tasks!
Click OK to proceed."
[Cancel] [OK]
```

#### Step 3: Success
```
Alert: "✅ Data imported successfully! Reloading..."
Page reloads with imported data
```

**Visual Changes:**
- Two buttons at bottom: Export (💾) and Import (📥)
- Small, compact buttons
- Success/error alerts
- Automatic page reload after import

---

## 4. 🔄 Drag & Drop Reordering

### Initial State:
```
DUE TODAY:
⋮⋮ ☐ Task A
⋮⋮ ☐ Task B  ← Hover shows dots
⋮⋮ ☐ Task C
```

### During Drag:
```
DUE TODAY:
⋮⋮ ☐ Task A
   [Task B] ← 50% transparent, following cursor
⋮⋮ ☐ Task C
```

### After Drop (moved B between A and C):
```
DUE TODAY:
⋮⋮ ☐ Task A
⋮⋮ ☐ Task C
⋮⋮ ☐ Task B ← Reordered!
```

**Visual Feedback:**
- Hover: Subtle dots (⋮⋮) appear on left
- Hover: Slight background highlight
- Dragging: Task becomes semi-transparent
- Cursor: Changes to "move" icon
- Drop: Smooth slide into position

---

## 5. 🚚 Move Tasks Between Tabs

### Initial State:
```
Tabs:
[DUE TODAY*] [NEXT UP] [WHEN I CAN] [DON'T FORGET]

DUE TODAY tasks:
⋮⋮ ☐ Urgent task
⋮⋮ ☐ Not so urgent ← This one
⋮⋮ ☐ Very urgent
```

### Step 1: Start dragging "Not so urgent"
```
Tabs:
[DUE TODAY*] [NEXT UP] [WHEN I CAN] [DON'T FORGET]
                              ↑ Cursor is here

DUE TODAY tasks:
⋮⋮ ☐ Urgent task
   [Not so urgent] ← Following cursor upward
⋮⋮ ☐ Very urgent
```

### Step 2: Hover over "WHEN I CAN" tab
```
Tabs:
[DUE TODAY*] [NEXT UP] [WHEN I CAN] [DON'T FORGET]
                       ↑↑↑↑↑↑↑↑↑↑↑
                       RED GLOW! ← Drop zone highlighted
```

### Step 3: Drop on "WHEN I CAN"
```
Alert: "✅ Moved 'Not so urgent' from DUE TODAY to WHEN I CAN"
```

### Result:
```
Switch to WHEN I CAN tab:
⋮⋮ ☐ Organize closet
⋮⋮ ☐ Not so urgent ← Moved here!
⋮⋮ ☐ Call dentist
```

**Visual Feedback:**
- Dragging: Task becomes 50% transparent
- Valid drop zone: Tab button GLOWS RED
- Invalid (same tab): No glow
- Success: Alert confirms move
- Task preserves ☐/☑ status

---

## Color Legend

🔴 **Red** - Primary actions, buttons, borders, highlights
⚪ **White/Cream** - Background, paper texture
⚫ **Black** - Text, borders
🟡 **Semi-transparent** - During drag (50% opacity)
🔵 **Red glow** - Valid drop zones

---

## Interaction Patterns

### Mouse:
- **Single Click** - Select task as current focus
- **Double Click** - Enter edit mode
- **Click & Hold** - Start dragging
- **Hover** - Show drag handle dots

### Keyboard:
- **Enter** - Save edit
- **Escape** - Cancel edit
- **Tab** - Navigate between fields (standard)

### Touch (Mobile):
- **Tap** - Select
- **Double Tap** - Edit
- **Long Press** - Start dragging
- **Drag & Drop** - Works with touch

---

## UI Element Locations

```
┌─────────────────────────────────────┐
│  DUMB SHIT I GOTTA DO TODAY         │ ← Title
├─────────────────────────────────────┤
│ [DUE TODAY*] [NEXT UP] [WHEN I CAN] │ ← Tabs (drop zones)
│ [DON'T FORGET]                      │
├─────────────────────────────────────┤
│ DUE TODAY:                           │
│ ⋮⋮ ☐ Task 1 (double-click to edit)  │ ← Tasks (draggable)
│ ⋮⋮ ☐ Task 2                          │
│ ⋮⋮ ☐ Task 3                          │
│                                      │
│ [+ ADD MORE SHIT    ] [ADD]          │ ← Add input
│ [CLEAR COMPLETED]                    │ ← New button
├─────────────────────────────────────┤
│ TIMER                                │
│ ... (timer controls)                 │
├─────────────────────────────────────┤
│ SHIT I DID                           │
│ 0/3 OF ALL TASKS DONE                │
│                                      │
│ [💾 EXPORT DATA] [📥 IMPORT DATA]    │ ← New buttons
│ 🧨 RESET EVERYTHING                  │
└─────────────────────────────────────┘
```

---

## Feature Interaction Matrix

| Feature | Works With | Notes |
|---------|-----------|-------|
| Edit | Any task | Can't edit while dragging |
| Clear | Completed tasks | Per-tab operation |
| Export | All data | Includes all tabs |
| Import | All data | Replaces everything |
| Drag Reorder | Same tab | Visual feedback |
| Drag Move | All tabs | Preserves completion |

---

## Animation Timings

- **Hover effects:** 200ms ease
- **Drag start:** Instant
- **Drop animation:** 300ms ease
- **Tab highlight:** 200ms ease
- **Button hover:** 200ms ease

---

## Responsive Behavior

### Desktop (>640px):
- All features fully enabled
- Hover effects visible
- Comfortable hit areas

### Mobile (<640px):
- Touch-friendly hit areas
- Long press to drag
- Buttons slightly smaller
- All features work

---

## Error States

### Import Errors:
```
Alert: "❌ Import failed: Invalid data format"
Alert: "❌ Import failed: File could not be read"
```

### Edit Errors:
```
(Empty text) → Task is deleted
(Same text) → No change made
```

### Clear Completed:
```
Alert: "No completed tasks to clear in this tab!"
```

---

## Success Messages

```
✅ Tasks exported successfully!
✅ Data imported successfully! Reloading...
✅ Moved "Task" from TAB1 to TAB2
Clear dialog: "Clear N completed task(s) from TAB?"
```

---

This visual guide shows exactly what users will see when using each feature!
