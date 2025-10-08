# Graphics Smasher - Selection Tools Guide

## Overview

Graphics Smasher provides professional selection tools similar to Photoshop, including Marquee (rectangular/elliptical) and Lasso (free-form) selection tools. This guide explains how to use them effectively.

## Selection Tools

### Marquee Tool (M key)
- **Rectangular Selection**: Click and drag to create a rectangular selection
- **Use Case**: Selecting rectangular areas, cropping, isolating geometric regions

### Lasso Tool (L key)
- **Free-form Selection**: Click and drag to draw a free-form selection path
- **Use Case**: Selecting irregular shapes, organic forms, complex outlines

### Magic Wand (W key)
- **Colour-based Selection**: Click on a colour to select similar pixels
- **Tolerance**: Adjust in tool options to control colour similarity range
- **Use Case**: Selecting areas of similar colour, backgrounds, sky regions

## Selection Workflow

### 1. Creating a Selection

1. **Select a tool**: Press `M` for Marquee, `L` for Lasso, or `W` for Magic Wand
2. **Draw your selection**:
   - **Marquee**: Click and drag to define the rectangular area
   - **Lasso**: Click and drag to draw around the area you want to select
   - **Magic Wand**: Click on the colour you want to select
3. **Release** to complete the selection
4. You'll see a blue animated outline (marching ants) around your selection

### 2. Working with Selections

Once you have an active selection, you can perform these operations:

#### Copy (⌘C / Ctrl+C)
- Copies the selected area to the clipboard
- Original content remains unchanged
- The selection outline stays active

#### Cut (⌘X / Ctrl+X)
- Copies the selected area to the clipboard
- **Erases** the selected area from the current layer (makes it transparent)
- The selection outline is cleared after cutting

#### Delete (Delete or Backspace)
- Erases the selected area from the current layer
- Does NOT copy to clipboard
- The selection outline is cleared after deletion

#### Paste (⌘V / Ctrl+V)
- Creates a **new layer** with the clipboard content
- The new layer appears offset by 20px from the original position
- A new selection is created around the pasted content
- You can now use the Move tool (V) to reposition this new layer

### 3. Selection Operations

#### Select All (⌘A / Ctrl+A)
- Selects the entire canvas
- Useful for copying/cutting all content on the active layer

#### Deselect (⌘D / Ctrl+D)
- Removes the current selection
- No content is affected, just the selection outline is removed

#### Inverse Selection (⇧⌘I / Shift+Ctrl+I)
- Inverts the selection (selects everything except the current selection)
- Useful for selecting backgrounds after selecting a subject

#### Modify Selection
Available in the **Select** menu:
- **Expand**: Grows the selection by specified pixels
- **Contract**: Shrinks the selection by specified pixels
- **Feather**: Softens the selection edges
- **Border**: Creates a border selection of specified width

## Important Workflow Notes

### ⚠️ Move Tool Behaviour

**Current Implementation:**
- The Move tool (V) moves the selection **outline**, not the selected pixels
- This is different from Photoshop's "floating selection" behaviour

**Recommended Workflow:**
1. Make your selection with Marquee or Lasso tool
2. **Cut** (⌘X) or **Copy** (⌘C) the selection
3. **Paste** (⌘V) to create a new layer
4. Now use the **Move tool** (V) to reposition the new layer
5. When satisfied, you can merge layers if needed

### Why This Workflow?

Moving pixels within an irregular lasso selection requires:
- Extracting pixels within the irregular shape
- Creating a temporary "floating selection" layer
- Implementing transform handles
- Adding a commit/cancel mechanism

This is a complex feature that requires pixel-level manipulation. The current workflow using Cut/Copy/Paste achieves the same result with better layer management and non-destructive editing.

## Keyboard Shortcuts Reference

### Selection Tools
- `M` - Marquee Tool (Rectangular Selection)
- `L` - Lasso Tool (Free-form Selection)
- `W` - Magic Wand (Colour-based Selection)
- `V` - Move Tool

### Selection Operations
- `⌘A` / `Ctrl+A` - Select All
- `⌘D` / `Ctrl+D` - Deselect
- `⇧⌘I` / `Shift+Ctrl+I` - Inverse Selection

### Clipboard Operations
- `⌘C` / `Ctrl+C` - Copy selection
- `⌘X` / `Ctrl+X` - Cut selection (copies and erases)
- `⌘V` / `Ctrl+V` - Paste (creates new layer)
- `Delete` or `Backspace` - Delete selection (erase without copying)

## Tips and Best Practices

### 1. Non-Destructive Editing
- Always work on duplicate layers when making destructive edits
- Use `⌘J` to duplicate the active layer before cutting/deleting
- Keep your original layer hidden as a backup

### 2. Precise Selections
- **Zoom in** (`⌘+`) for more precise lasso selections
- Use **Magic Wand** with low tolerance for clean colour selections
- Combine selections using **Inverse** and **Modify** operations

### 3. Layer Management
- After pasting, rename your layers for better organisation
- Use layer visibility to compare before/after
- Merge layers (`⌘E`) only when you're certain of the changes

### 4. Selection Refinement
- Use **Feather** to soften hard selection edges
- Use **Expand/Contract** to adjust selection size
- Save complex selections using **Select > Save Selection**

## Common Workflows

### Workflow 1: Moving Part of an Image
```
1. Select Lasso tool (L)
2. Draw around the area you want to move
3. Cut (⌘X) - this copies and erases
4. Paste (⌘V) - creates new layer
5. Select Move tool (V)
6. Drag the new layer to desired position
7. Optional: Merge down (⌘E) when satisfied
```

### Workflow 2: Duplicating an Element
```
1. Select Marquee or Lasso tool (M or L)
2. Select the element
3. Copy (⌘C) - leaves original intact
4. Paste (⌘V) - creates duplicate on new layer
5. Move tool (V) to reposition
6. Repeat paste for multiple copies
```

### Workflow 3: Removing a Background
```
1. Select Magic Wand (W)
2. Click on background colour
3. Adjust tolerance if needed
4. Delete (Backspace) to remove background
5. Or: Inverse (⇧⌘I) to select subject instead
```

### Workflow 4: Creating a Border Effect
```
1. Select All (⌘A)
2. Select > Modify > Border (enter width)
3. Fill with colour or apply effect
4. Deselect (⌘D)
```

## Troubleshooting

### "Nothing happens when I press Delete"
- Make sure you have an active selection (blue outline visible)
- Ensure the active layer is not locked
- Check that you're on the correct layer

### "Paste creates a layer in the wrong position"
- Pasted content is offset by 20px by design (to make it visible)
- Use Move tool (V) to reposition
- The offset prevents pasting exactly on top of the original

### "Move tool doesn't move my selection"
- Move tool moves the selection outline, not the pixels
- Use Cut/Paste workflow to move actual pixels
- See "Move Tool Behaviour" section above

### "Selection disappears after Cut/Delete"
- This is correct behaviour
- Cut and Delete are destructive operations that clear the selection
- Use Copy if you want to keep the selection active

## Future Enhancements

Planned improvements for selection tools:
- Floating selection support for direct pixel manipulation
- Transform handles on selections
- Quick Mask mode for painting selections
- Selection brushes for refining edges
- Alpha channel selection support

## Getting Help

- Press `⌘/` or `Ctrl+/` to view all keyboard shortcuts
- Press `⌘K` or `Ctrl+K` to open the Command Palette
- Access the Help menu for additional resources

---

**Remember**: The key to effective selection work is understanding the Cut/Copy/Paste workflow. While it may seem like an extra step compared to direct pixel manipulation, it provides better layer management and non-destructive editing capabilities.

