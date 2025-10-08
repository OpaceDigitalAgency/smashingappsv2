# Lasso Selection Tool - User Guide

## How Lasso Selection Works in Graphics Smasher

The lasso selection tool allows you to select irregular, freeform areas of your canvas by drawing around them.

### Current Implementation Status

**✅ Working:**
- Drawing lasso selection outline
- Creating selection boundary
- Cut/Copy/Paste with lasso selections
- Delete with lasso selections

**⚠️ Limitations:**
- Lasso selections don't extract pixels for moving (this is a complex feature)
- Move tool doesn't work with lasso selections yet
- Selections work on the entire layer, not just the selected pixels

---

## Step-by-Step Guide: Using Lasso Selection

### 1. **Create Content to Select**
First, you need something to select:
- Select the **Brush tool** (B key)
- Draw something on the canvas
- This creates content on the current layer

### 2. **Draw a Lasso Selection**
- Select the **Lasso tool** (L key) from the toolbar
- Click and drag around the area you want to select
- Release the mouse to complete the selection
- You'll see a blue outline showing your selection

### 3. **What You Can Do With the Selection**

#### **Option A: Cut the Selection**
- With the lasso selection active, press **Cmd+X** (Mac) or **Ctrl+X** (Windows)
- Or use menu: **Edit → Cut**
- This will:
  - Copy the selected area to clipboard
  - Erase the selected area from the layer
  - The erased area becomes transparent

#### **Option B: Copy the Selection**
- With the lasso selection active, press **Cmd+C** (Mac) or **Ctrl+C** (Windows)
- Or use menu: **Edit → Copy**
- This copies the selected area without removing it

#### **Option C: Delete the Selection**
- With the lasso selection active, press **Delete** or **Backspace**
- Or use menu: **Edit → Delete**
- This erases the selected area (makes it transparent)

#### **Option D: Paste the Selection**
- After cutting or copying, press **Cmd+V** (Mac) or **Ctrl+V** (Windows)
- Or use menu: **Edit → Paste**
- This creates a new layer with the copied content
- The pasted content appears offset by 20px from the original position

### 4. **Deselect**
- Press **Cmd+D** (Mac) or **Ctrl+D** (Windows)
- Or use menu: **Select → Deselect**
- This removes the selection outline

---

## Why Move Tool Doesn't Work with Lasso (Yet)

**The Technical Challenge:**

Moving a lasso selection requires:
1. **Pixel Extraction**: Extract only the pixels within the irregular lasso shape
2. **Floating Selection**: Create a temporary "floating" layer with just those pixels
3. **Transform Handles**: Add handles to move/rotate the floating selection
4. **Commit Mechanism**: When you click outside, commit the pixels back to the layer

This is a complex feature that requires:
- Canvas pixel manipulation
- Mask generation from lasso path
- Temporary layer management
- Transform system integration

**Current Workaround:**

For now, use this workflow:
1. Draw lasso selection around area
2. Press **Cmd+X** to cut
3. Press **Cmd+V** to paste
4. The pasted content is on a new layer
5. Select **Move tool** (V key)
6. Now you can drag the entire new layer

---

## Rectangular Selection (Marquee) - Fully Working

If you need to move selections, use the **Marquee tool** instead:

1. Select **Marquee tool** (M key)
2. Draw a rectangle around the area
3. Press **Cmd+X** to cut
4. Press **Cmd+V** to paste
5. Select **Move tool** (V key)
6. Drag the new layer to position it

---

## Common Issues and Solutions

### Issue: "Content disappears when I drag it off-canvas"
**Fixed!** Content no longer gets clipped when moved outside canvas boundaries.

### Issue: "Pasted content returns to original position"
**Fixed!** Pasted content now appears offset by 20px, making it visible.

### Issue: "Undo doesn't work after cut/paste"
**Check:**
- Make sure canvas has focus (click on it)
- Try using Edit menu → Undo instead of keyboard shortcut
- Check browser console for errors

### Issue: "Delete key doesn't work"
**Fixed!** Delete and Backspace keys now work to delete selections.

### Issue: "Lasso selection doesn't move when I use Move tool"
**Expected behavior** - This feature isn't implemented yet. Use the cut/paste workflow above.

---

## Keyboard Shortcuts Reference

| Action | Mac | Windows |
|--------|-----|---------|
| Lasso Tool | L | L |
| Move Tool | V | V |
| Marquee Tool | M | M |
| Cut | ⌘X | Ctrl+X |
| Copy | ⌘C | Ctrl+C |
| Paste | ⌘V | Ctrl+V |
| Delete | Delete/Backspace | Delete/Backspace |
| Deselect | ⌘D | Ctrl+D |
| Undo | ⌘Z | Ctrl+Z |
| Redo | ⇧⌘Z | Ctrl+Shift+Z |

---

## Future Enhancements

These features are planned for future updates:

1. **Floating Selections**: Extract pixels for direct manipulation
2. **Transform Handles**: Rotate and scale lasso selections
3. **Feathering**: Soft edges on lasso selections
4. **Magic Wand Integration**: Select similar colors within lasso area
5. **Selection Refinement**: Expand, contract, smooth selection edges

---

## Tips for Best Results

1. **Use Layers**: Create separate layers for different elements - makes selection easier
2. **Zoom In**: Zoom in (Cmd/Ctrl + +) for precise lasso drawing
3. **Marquee for Rectangles**: Use marquee tool for rectangular areas - it's faster
4. **Undo is Your Friend**: Press Cmd/Ctrl + Z if you make a mistake
5. **Save Often**: Use Cmd/Ctrl + S to save your work

---

## Report Issues

If you encounter bugs or have feature requests, please report them with:
- Steps to reproduce the issue
- Screenshot if possible
- Browser and OS version

