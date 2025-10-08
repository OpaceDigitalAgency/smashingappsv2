import React, { useState, useRef, useEffect } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';
import { useActiveDocument, useActiveDocumentId } from '../../hooks/useGraphicsStore';
import { ChevronDown, Sun, Moon } from 'lucide-react';
import { menuHandlers } from '../../services/menu/MenuHandlers';

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('graphics-smasher-theme');
    return saved ? saved === 'dark' : true;
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const activeDocumentId = useActiveDocumentId();
  const activeDocument = useActiveDocument();
  
  const {
    setCommandPaletteOpen,
    selection,
  } = useGraphicsStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('graphics-smasher-theme', isDarkMode ? 'dark' : 'light');

    // Apply theme to graphics smasher container
    const container = document.querySelector('.graphics-smasher-container');
    if (container) {
      if (isDarkMode) {
        container.classList.add('dark-theme');
        container.classList.remove('light-theme');
      } else {
        container.classList.add('light-theme');
        container.classList.remove('dark-theme');
      }
    }

    // Apply theme to main navigation
    const mainNav = document.querySelector('nav.main-nav-dark, nav:not(.main-nav-dark)');
    if (mainNav) {
      if (isDarkMode) {
        mainNav.classList.add('main-nav-dark');
      } else {
        mainNav.classList.remove('main-nav-dark');
      }
    }

    // Apply theme to body for full-screen workspace
    const body = document.body;
    if (isDarkMode) {
      body.style.backgroundColor = '#1a1a1a';
      body.style.color = '#e0e0e0';
    } else {
      body.style.backgroundColor = '';
      body.style.color = '';
    }

    // Cleanup function to remove body styles when component unmounts
    return () => {
      body.style.backgroundColor = '';
      body.style.color = '';
    };
  }, [isDarkMode]);

  // Cleanup body styles when component unmounts
  useEffect(() => {
    return () => {
      const body = document.body;
      body.style.backgroundColor = '';
      body.style.color = '';
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const wrapHandler = (handler: () => void | Promise<void>) => {
    return async () => {
      await handler();
      setActiveMenu(null);
    };
  };

  const menus: MenuSection[] = [
    {
      title: 'File',
      items: [
        { label: 'New...', shortcut: '⌘N', action: wrapHandler(() => menuHandlers.newDocument()) },
        { label: 'Open...', shortcut: '⌘O', action: wrapHandler(() => menuHandlers.openFile()) },
        { label: 'Open Recent', submenu: [
          { label: 'No recent files', disabled: true }
        ]},
        { divider: true },
        { label: 'Close', shortcut: '⌘W', action: wrapHandler(() => menuHandlers.closeDocument(activeDocumentId)) },
        { label: 'Save', shortcut: '⌘S', action: wrapHandler(() => menuHandlers.save(activeDocument)), disabled: !activeDocumentId },
        { label: 'Save As...', shortcut: '⇧⌘S', action: wrapHandler(() => menuHandlers.saveAs(activeDocument)), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Export', submenu: [
          { label: 'Export As PNG...', action: wrapHandler(() => menuHandlers.exportAs(activeDocument, 'png')) },
          { label: 'Export As JPEG...', action: wrapHandler(() => menuHandlers.exportAs(activeDocument, 'jpeg')) },
          { label: 'Export As WebP...', action: wrapHandler(() => menuHandlers.exportAs(activeDocument, 'webp')) },
          { label: 'Export As SVG...', action: wrapHandler(() => menuHandlers.exportAs(activeDocument, 'svg')) },
        ]},
        { divider: true },
        { label: 'Place...', action: wrapHandler(() => menuHandlers.placeFile()) },
        { label: 'Import', submenu: [
          { label: 'From File...', action: wrapHandler(() => menuHandlers.placeFile()) },
          { label: 'From Clipboard', shortcut: '⌘V', action: wrapHandler(() => menuHandlers.importFromClipboard()) },
        ]},
      ]
    },
    {
      title: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', action: wrapHandler(() => menuHandlers.undo(activeDocumentId)), disabled: !activeDocument?.history.past.length },
        { label: 'Redo', shortcut: '⇧⌘Z', action: wrapHandler(() => menuHandlers.redo(activeDocumentId)), disabled: !activeDocument?.history.future.length },
        { divider: true },
        { label: 'Cut', shortcut: '⌘X', action: wrapHandler(() => menuHandlers.cut(selection, activeDocumentId)), disabled: !selection },
        { label: 'Copy', shortcut: '⌘C', action: wrapHandler(() => menuHandlers.copy(selection)), disabled: !selection },
        { label: 'Paste', shortcut: '⌘V', action: wrapHandler(() => menuHandlers.paste(activeDocumentId)) },
        { label: 'Paste Special', submenu: [
          { label: 'Paste in Place', shortcut: '⇧⌘V', action: wrapHandler(() => menuHandlers.paste(activeDocumentId)) },
          { label: 'Paste Into Selection', action: wrapHandler(() => menuHandlers.paste(activeDocumentId)) },
        ]},
        { divider: true },
        { label: 'Clear', action: wrapHandler(() => menuHandlers.clear(selection, activeDocumentId)), disabled: !selection },
        { label: 'Fill...', shortcut: '⇧F5', action: wrapHandler(() => menuHandlers.fill(activeDocumentId, activeDocument?.activeLayerId || null)), disabled: !activeDocument?.activeLayerId },
        { label: 'Stroke...', action: wrapHandler(() => menuHandlers.stroke(activeDocumentId, activeDocument?.activeLayerId || null)), disabled: !activeDocument?.activeLayerId },
        { divider: true },
        { label: 'Transform', submenu: [
          { label: 'Free Transform', shortcut: '⌘T', action: wrapHandler(() => menuHandlers.transformLayer(activeDocumentId, activeDocument?.activeLayerId || null, 'rotate')) },
          { label: 'Scale', action: wrapHandler(() => menuHandlers.transformLayer(activeDocumentId, activeDocument?.activeLayerId || null, 'scale')) },
          { label: 'Rotate', action: wrapHandler(() => menuHandlers.transformLayer(activeDocumentId, activeDocument?.activeLayerId || null, 'rotate')) },
          { label: 'Skew', action: wrapHandler(() => menuHandlers.transformLayer(activeDocumentId, activeDocument?.activeLayerId || null, 'skew')) },
          { label: 'Flip Horizontal', action: wrapHandler(() => menuHandlers.flipHorizontal(activeDocumentId)) },
          { label: 'Flip Vertical', action: wrapHandler(() => menuHandlers.flipVertical(activeDocumentId)) },
        ]},
        { divider: true },
        { label: 'Preferences...', shortcut: '⌘,', action: wrapHandler(() => menuHandlers.showPreferences()) },
      ]
    },
    {
      title: 'Image',
      items: [
        { label: 'Image Size...', shortcut: '⌥⌘I', action: wrapHandler(() => menuHandlers.showImageSizeDialog(activeDocumentId)), disabled: !activeDocumentId },
        { label: 'Canvas Size...', shortcut: '⌥⌘C', action: wrapHandler(() => menuHandlers.showCanvasSizeDialog(activeDocumentId)), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Crop', action: wrapHandler(() => menuHandlers.cropToSelection(activeDocumentId, selection)), disabled: !selection },
        { label: 'Trim...', action: wrapHandler(() => menuHandlers.trim(activeDocumentId)), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Rotate Canvas', submenu: [
          { label: '90° Clockwise', action: wrapHandler(() => menuHandlers.rotateCanvas(activeDocumentId, 90)) },
          { label: '90° Counter Clockwise', action: wrapHandler(() => menuHandlers.rotateCanvas(activeDocumentId, -90)) },
          { label: '180°', action: wrapHandler(() => menuHandlers.rotateCanvas(activeDocumentId, 180)) },
          { label: 'Arbitrary...', action: wrapHandler(() => menuHandlers.showArbitraryRotateDialog(activeDocumentId)) },
        ]},
        { divider: true },
        { label: 'Adjustments', submenu: [
          { label: 'Brightness/Contrast...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Brightness/Contrast', activeDocumentId)) },
          { label: 'Levels...', shortcut: '⌘L', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Levels', activeDocumentId)) },
          { label: 'Curves...', shortcut: '⌘M', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Curves', activeDocumentId)) },
          { label: 'Hue/Saturation...', shortcut: '⌘U', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Hue/Saturation', activeDocumentId)) },
          { label: 'Colour Balance...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Colour Balance', activeDocumentId)) },
          { label: 'Black & White...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Black & White', activeDocumentId)) },
          { label: 'Vibrance...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Vibrance', activeDocumentId)) },
        ]},
      ]
    },
    {
      title: 'Layer',
      items: [
        { label: 'New Layer', shortcut: '⇧⌘N', action: wrapHandler(() => menuHandlers.addLayer(activeDocumentId, activeDocument)), disabled: !activeDocumentId },
        { label: 'Duplicate Layer', shortcut: '⌘J', action: wrapHandler(() => menuHandlers.duplicateLayer(activeDocumentId, activeDocument?.activeLayerId || null)), disabled: !activeDocument?.activeLayerId },
        { label: 'Delete Layer', action: wrapHandler(() => menuHandlers.deleteLayer(activeDocumentId, activeDocument?.activeLayerId || null)), disabled: !activeDocument?.activeLayerId },
        { divider: true },
        { label: 'Layer Properties...', action: wrapHandler(() => menuHandlers.showLayerProperties(activeDocumentId, activeDocument?.activeLayerId || null)), disabled: !activeDocument?.activeLayerId },
        { label: 'Layer Style', submenu: [
          { label: 'Blending Options...', action: wrapHandler(() => menuHandlers.applyLayerStyle('Blending Options', activeDocumentId, activeDocument?.activeLayerId || null)) },
          { label: 'Drop Shadow...', action: wrapHandler(() => menuHandlers.applyLayerStyle('Drop Shadow', activeDocumentId, activeDocument?.activeLayerId || null)) },
          { label: 'Inner Shadow...', action: wrapHandler(() => menuHandlers.applyLayerStyle('Inner Shadow', activeDocumentId, activeDocument?.activeLayerId || null)) },
          { label: 'Outer Glow...', action: wrapHandler(() => menuHandlers.applyLayerStyle('Outer Glow', activeDocumentId, activeDocument?.activeLayerId || null)) },
          { label: 'Stroke...', action: wrapHandler(() => menuHandlers.applyLayerStyle('Stroke', activeDocumentId, activeDocument?.activeLayerId || null)) },
        ]},
        { divider: true },
        { label: 'New Adjustment Layer', submenu: [
          { label: 'Brightness/Contrast...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Brightness/Contrast', activeDocumentId)) },
          { label: 'Levels...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Levels', activeDocumentId)) },
          { label: 'Curves...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Curves', activeDocumentId)) },
          { label: 'Hue/Saturation...', action: wrapHandler(() => menuHandlers.addAdjustmentLayer('Hue/Saturation', activeDocumentId)) },
        ]},
        { label: 'Layer Mask', submenu: [
          { label: 'Reveal All', action: wrapHandler(() => menuHandlers.addLayerMask('reveal', activeDocumentId, activeDocument?.activeLayerId || null)) },
          { label: 'Hide All', action: wrapHandler(() => menuHandlers.addLayerMask('hide', activeDocumentId, activeDocument?.activeLayerId || null)) },
          { label: 'From Selection', action: wrapHandler(() => menuHandlers.addLayerMask('selection', activeDocumentId, activeDocument?.activeLayerId || null)) },
        ]},
        { divider: true },
        { label: 'Merge Down', shortcut: '⌘E', action: wrapHandler(() => menuHandlers.mergeDown(activeDocumentId, activeDocument?.activeLayerId || null)), disabled: !activeDocument?.activeLayerId },
        { label: 'Merge Visible', shortcut: '⇧⌘E', action: wrapHandler(() => menuHandlers.mergeVisible(activeDocumentId)) },
        { label: 'Flatten Image', action: wrapHandler(() => menuHandlers.flattenImage(activeDocumentId)) },
      ]
    },
    {
      title: 'Select',
      items: [
        { label: 'All', shortcut: '⌘A', action: wrapHandler(() => menuHandlers.selectAll(activeDocumentId, activeDocument)), disabled: !activeDocumentId },
        { label: 'Deselect', shortcut: '⌘D', action: wrapHandler(() => menuHandlers.deselect()), disabled: !selection },
        { label: 'Reselect', shortcut: '⇧⌘D', action: wrapHandler(() => menuHandlers.reselect(activeDocumentId)), disabled: !activeDocumentId },
        { label: 'Inverse', shortcut: '⇧⌘I', action: wrapHandler(() => menuHandlers.inverseSelection(activeDocumentId, activeDocument)), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Modify', submenu: [
          { label: 'Border...', action: wrapHandler(() => menuHandlers.modifySelection('border', activeDocumentId)) },
          { label: 'Smooth...', action: wrapHandler(() => menuHandlers.modifySelection('smooth', activeDocumentId)) },
          { label: 'Expand...', action: wrapHandler(() => menuHandlers.modifySelection('expand', activeDocumentId)) },
          { label: 'Contract...', action: wrapHandler(() => menuHandlers.modifySelection('contract', activeDocumentId)) },
          { label: 'Feather...', shortcut: '⇧F6', action: wrapHandler(() => menuHandlers.modifySelection('feather', activeDocumentId)) },
        ]},
        { label: 'Grow', action: wrapHandler(() => menuHandlers.growSelection(activeDocumentId)), disabled: !activeDocumentId },
        { label: 'Similar', action: wrapHandler(() => menuHandlers.similarSelection(activeDocumentId)), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Transform Selection', action: wrapHandler(() => menuHandlers.transformSelection(activeDocumentId)), disabled: !activeDocumentId },
        { label: 'Save Selection...', action: wrapHandler(() => menuHandlers.saveSelection(activeDocumentId)), disabled: !activeDocumentId },
        { label: 'Load Selection...', action: wrapHandler(() => menuHandlers.loadSelection()) },
      ]
    },
    {
      title: 'Filter',
      items: [
        { label: 'Last Filter', shortcut: '⌘F', action: wrapHandler(() => menuHandlers.applyFilter('Last Filter', activeDocumentId)), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Blur', submenu: [
          { label: 'Gaussian Blur...', action: wrapHandler(() => menuHandlers.applyFilter('Gaussian Blur', activeDocumentId)) },
          { label: 'Motion Blur...', action: wrapHandler(() => menuHandlers.applyFilter('Motion Blur', activeDocumentId)) },
          { label: 'Radial Blur...', action: wrapHandler(() => menuHandlers.applyFilter('Radial Blur', activeDocumentId)) },
          { label: 'Smart Blur...', action: wrapHandler(() => menuHandlers.applyFilter('Smart Blur', activeDocumentId)) },
        ]},
        { label: 'Sharpen', submenu: [
          { label: 'Sharpen', action: wrapHandler(() => menuHandlers.applyFilter('Sharpen', activeDocumentId)) },
          { label: 'Sharpen More', action: wrapHandler(() => menuHandlers.applyFilter('Sharpen More', activeDocumentId)) },
          { label: 'Unsharp Mask...', action: wrapHandler(() => menuHandlers.applyFilter('Unsharp Mask', activeDocumentId)) },
          { label: 'Smart Sharpen...', action: wrapHandler(() => menuHandlers.applyFilter('Smart Sharpen', activeDocumentId)) },
        ]},
        { label: 'Noise', submenu: [
          { label: 'Add Noise...', action: wrapHandler(() => menuHandlers.applyFilter('Add Noise', activeDocumentId)) },
          { label: 'Reduce Noise...', action: wrapHandler(() => menuHandlers.applyFilter('Reduce Noise', activeDocumentId)) },
        ]},
        { divider: true },
        { label: 'Distort', submenu: [
          { label: 'Pinch...', action: wrapHandler(() => menuHandlers.applyFilter('Pinch', activeDocumentId)) },
          { label: 'Twirl...', action: wrapHandler(() => menuHandlers.applyFilter('Twirl', activeDocumentId)) },
          { label: 'Wave...', action: wrapHandler(() => menuHandlers.applyFilter('Wave', activeDocumentId)) },
        ]},
        { label: 'Stylise', submenu: [
          { label: 'Emboss...', action: wrapHandler(() => menuHandlers.applyFilter('Emboss', activeDocumentId)) },
          { label: 'Find Edges', action: wrapHandler(() => menuHandlers.applyFilter('Find Edges', activeDocumentId)) },
        ]},
      ]
    },
    {
      title: 'View',
      items: [
        { label: 'Zoom In', shortcut: '⌘+', action: wrapHandler(() => menuHandlers.zoomIn(activeDocumentId, activeDocument)) },
        { label: 'Zoom Out', shortcut: '⌘-', action: wrapHandler(() => menuHandlers.zoomOut(activeDocumentId, activeDocument)) },
        { label: 'Fit to Screen', shortcut: '⌘0', action: wrapHandler(() => menuHandlers.fitToScreen(activeDocumentId)) },
        { label: 'Actual Pixels', shortcut: '⌘1', action: wrapHandler(() => menuHandlers.actualPixels(activeDocumentId)) },
        { divider: true },
        { label: 'Show Rulers', shortcut: '⌘R', action: wrapHandler(() => menuHandlers.toggleRulers(activeDocumentId, activeDocument)) },
        { label: 'Show Grid', shortcut: "⌘'", action: wrapHandler(() => menuHandlers.toggleGrid(activeDocumentId, activeDocument)) },
        { label: 'Show Guides', shortcut: '⌘;', action: wrapHandler(() => menuHandlers.toggleGuides(activeDocumentId, activeDocument)) },
        { divider: true },
        { label: 'Snap', action: wrapHandler(() => menuHandlers.toggleSnap()) },
        { label: 'Lock Guides', shortcut: '⌥⌘;', action: wrapHandler(() => menuHandlers.lockGuides()) },
        { label: 'Clear Guides', action: wrapHandler(() => menuHandlers.clearGuides(activeDocumentId)) },
      ]
    },
    {
      title: 'Window',
      items: [
        { label: 'Layers', shortcut: 'F7', action: wrapHandler(() => menuHandlers.showPanel('layers')) },
        { label: 'History', shortcut: 'F9', action: wrapHandler(() => menuHandlers.showPanel('history')) },
        { label: 'Properties', action: wrapHandler(() => menuHandlers.showPanel('properties')) },
        { label: 'Adjustments', action: wrapHandler(() => menuHandlers.showPanel('adjustments')) },
        { divider: true },
        { label: 'Workspace', submenu: [
          { label: 'Essentials', action: wrapHandler(() => menuHandlers.setWorkspace('Essentials')) },
          { label: 'Photography', action: wrapHandler(() => menuHandlers.setWorkspace('Photography')) },
          { label: 'Painting', action: wrapHandler(() => menuHandlers.setWorkspace('Painting')) },
          { label: 'Design', action: wrapHandler(() => menuHandlers.setWorkspace('Design')) },
        ]},
      ]
    },
    {
      title: 'Help',
      items: [
        { label: 'Graphics Smasher Help', shortcut: 'F1', action: wrapHandler(() => menuHandlers.showHelp()) },
        { label: 'Keyboard Shortcuts', shortcut: '⌘/', action: wrapHandler(() => menuHandlers.showKeyboardShortcuts()) },
        { divider: true },
        { label: 'About Graphics Smasher', action: wrapHandler(() => menuHandlers.showAbout()) },
      ]
    },
  ];

  const renderSubmenu = (items: MenuItem[], parentKey: string) => (
    <div className="absolute left-full top-0 z-[10001] ml-1 min-w-[200px] rounded-md border border-slate-200 bg-white py-1 shadow-xl">
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={`${parentKey}-divider-${index}`} className="my-1 h-px bg-slate-200" />;
        }
        return (
          <button
            key={`${parentKey}-${index}`}
            onClick={item.action}
            disabled={item.disabled}
            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
              item.disabled
                ? 'cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="ml-8 text-xs text-slate-400">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );

  const renderMenuItems = (items: MenuItem[], menuKey: string) => (
    <div className="absolute left-0 top-full z-[10000] mt-1 min-w-[240px] rounded-md border border-slate-200 bg-white py-1 shadow-xl">
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={`${menuKey}-divider-${index}`} className="my-1 h-px bg-slate-200" />;
        }

        const hasSubmenu = item.submenu && item.submenu.length > 0;

        return (
          <div key={`${menuKey}-${index}`} className="relative group">
            <button
              onClick={!hasSubmenu ? item.action : undefined}
              disabled={item.disabled}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                item.disabled
                  ? 'cursor-not-allowed text-slate-400'
                  : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <span>{item.label}</span>
              <div className="flex items-center gap-2">
                {item.shortcut && <span className="text-xs text-slate-400">{item.shortcut}</span>}
                {hasSubmenu && <ChevronDown size={14} className="rotate-[-90deg]" />}
              </div>
            </button>
            {hasSubmenu && (
              <div className="hidden group-hover:block">
                {renderSubmenu(item.submenu!, `${menuKey}-${index}`)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={menuRef} className="relative z-[9999] flex items-center border-b border-slate-200 bg-white px-4 py-1 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-1">
        {menus.map((menu) => (
          <div key={menu.title} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menu.title ? null : menu.title)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                activeMenu === menu.title
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {menu.title}
            </button>
            {activeMenu === menu.title && renderMenuItems(menu.items, menu.title)}
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
          title="Command Palette (⌘K)"
        >
          ⌘K
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
