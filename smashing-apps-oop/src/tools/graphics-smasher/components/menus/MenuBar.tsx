import React, { useState, useRef, useEffect } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';
import { useActiveDocument, useActiveDocumentId } from '../../hooks/useGraphicsStore';
import { ChevronDown, Sun, Moon } from 'lucide-react';

interface MenuItem {
  label: string;
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
    createDocument,
    setActiveDocument,
    closeDocument,
    duplicateDocument,
    undo,
    redo,
    addLayer,
    removeLayer,
    setCommandPaletteOpen,
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
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleNewDocument = () => {
    const id = createDocument({ name: 'Untitled', width: 1920, height: 1080 });
    setActiveDocument(id);
    setActiveMenu(null);
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (event) => {
          img.onload = () => {
            // Create a new document with the image dimensions
            const docId = createDocument({
              name: file.name.replace(/\.[^/.]+$/, ''),
              width: img.width,
              height: img.height
            });

            // Set as active document
            setActiveDocument(docId);

            // Store the image URL in the document's background layer metadata
            const doc = useGraphicsStore.getState().documents.find(d => d.id === docId);
            if (doc) {
              useGraphicsStore.getState().updateLayer(docId, doc.layers[0].id, (layer) => ({
                ...layer,
                metadata: {
                  ...layer.metadata,
                  imageUrl: img.src,
                  imageWidth: img.width,
                  imageHeight: img.height
                }
              }));
            }
          };
          img.src = event.target?.result as string;
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    };
    input.click();
    setActiveMenu(null);
  };

  const handleSave = () => {
    if (!activeDocument) return;
    // For now, just export as PNG
    handleExportAs('png');
  };

  const handleSaveAs = () => {
    if (!activeDocument) return;
    handleExportAs('png');
  };

  const handleExportAs = (format: 'png' | 'jpeg' | 'webp' | 'svg') => {
    if (!activeDocument) return;

    // Create a temporary canvas to render the document
    const canvas = document.createElement('canvas');
    canvas.width = activeDocument.width;
    canvas.height = activeDocument.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Fill with background colour
    ctx.fillStyle = activeDocument.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // TODO: Render all layers to the canvas
    // For now, just export the background

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDocument.name}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }, `image/${format}`, format === 'jpeg' ? 0.95 : undefined);

    setActiveMenu(null);
  };

  const handleExport = () => {
    handleExportAs('png');
  };

  const handleUndo = () => {
    if (activeDocumentId) {
      undo(activeDocumentId);
    }
    setActiveMenu(null);
  };

  const handleRedo = () => {
    if (activeDocumentId) {
      redo(activeDocumentId);
    }
    setActiveMenu(null);
  };

  const handleAddLayer = () => {
    if (activeDocumentId) {
      addLayer(activeDocumentId, { name: `Layer ${(activeDocument?.layers.length || 0) + 1}` });
    }
    setActiveMenu(null);
  };

  const handleDuplicateLayer = () => {
    // TODO: Implement duplicate layer
    console.log('Duplicate layer');
    setActiveMenu(null);
  };

  const handleDeleteLayer = () => {
    if (activeDocumentId && activeDocument?.activeLayerId) {
      removeLayer(activeDocumentId, activeDocument.activeLayerId);
    }
    setActiveMenu(null);
  };

  const menus: MenuSection[] = [
    {
      title: 'File',
      items: [
        { label: 'New...', shortcut: '⌘N', action: handleNewDocument },
        { label: 'Open...', shortcut: '⌘O', action: handleOpenFile },
        { label: 'Open Recent', submenu: [
          { label: 'No recent files', disabled: true }
        ]},
        { divider: true },
        { label: 'Close', shortcut: '⌘W', action: () => activeDocumentId && closeDocument(activeDocumentId) },
        { label: 'Save', shortcut: '⌘S', action: handleSave, disabled: !activeDocumentId },
        { label: 'Save As...', shortcut: '⇧⌘S', action: handleSaveAs, disabled: !activeDocumentId },
        { divider: true },
        { label: 'Export', submenu: [
          { label: 'Export As PNG...', action: () => handleExportAs('png') },
          { label: 'Export As JPEG...', action: () => handleExportAs('jpeg') },
          { label: 'Export As WebP...', action: () => handleExportAs('webp') },
          { label: 'Export As SVG...', action: () => handleExportAs('svg') },
        ]},
        { divider: true },
        { label: 'Place...', action: () => console.log('Place') },
        { label: 'Import', submenu: [
          { label: 'From File...', action: () => console.log('Import file') },
          { label: 'From Clipboard', shortcut: '⌘V', action: () => console.log('Paste') },
        ]},
      ]
    },
    {
      title: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', action: handleUndo, disabled: !activeDocument?.history.past.length },
        { label: 'Redo', shortcut: '⇧⌘Z', action: handleRedo, disabled: !activeDocument?.history.future.length },
        { divider: true },
        { label: 'Cut', shortcut: '⌘X', action: () => console.log('Cut'), disabled: !activeDocumentId },
        { label: 'Copy', shortcut: '⌘C', action: () => console.log('Copy'), disabled: !activeDocumentId },
        { label: 'Paste', shortcut: '⌘V', action: () => console.log('Paste') },
        { label: 'Paste Special', submenu: [
          { label: 'Paste in Place', shortcut: '⇧⌘V', action: () => console.log('Paste in place') },
          { label: 'Paste Into Selection', action: () => console.log('Paste into') },
        ]},
        { divider: true },
        { label: 'Clear', action: () => console.log('Clear'), disabled: !activeDocumentId },
        { label: 'Fill...', shortcut: '⇧F5', action: () => console.log('Fill') },
        { label: 'Stroke...', action: () => console.log('Stroke') },
        { divider: true },
        { label: 'Transform', submenu: [
          { label: 'Free Transform', shortcut: '⌘T', action: () => console.log('Transform') },
          { label: 'Scale', action: () => console.log('Scale') },
          { label: 'Rotate', action: () => console.log('Rotate') },
          { label: 'Skew', action: () => console.log('Skew') },
          { label: 'Flip Horizontal', action: () => console.log('Flip H') },
          { label: 'Flip Vertical', action: () => console.log('Flip V') },
        ]},
        { divider: true },
        { label: 'Preferences...', shortcut: '⌘,', action: () => console.log('Preferences') },
      ]
    },
    {
      title: 'Image',
      items: [
        { label: 'Image Size...', shortcut: '⌥⌘I', action: () => console.log('Image size'), disabled: !activeDocumentId },
        { label: 'Canvas Size...', shortcut: '⌥⌘C', action: () => console.log('Canvas size'), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Crop', action: () => console.log('Crop'), disabled: !activeDocumentId },
        { label: 'Trim...', action: () => console.log('Trim'), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Rotate Canvas', submenu: [
          { label: '90° Clockwise', action: () => console.log('Rotate 90 CW') },
          { label: '90° Counter Clockwise', action: () => console.log('Rotate 90 CCW') },
          { label: '180°', action: () => console.log('Rotate 180') },
          { label: 'Arbitrary...', action: () => console.log('Rotate arbitrary') },
        ]},
        { divider: true },
        { label: 'Adjustments', submenu: [
          { label: 'Brightness/Contrast...', action: () => console.log('Brightness') },
          { label: 'Levels...', shortcut: '⌘L', action: () => console.log('Levels') },
          { label: 'Curves...', shortcut: '⌘M', action: () => console.log('Curves') },
          { label: 'Hue/Saturation...', shortcut: '⌘U', action: () => console.log('Hue/Sat') },
          { label: 'Colour Balance...', action: () => console.log('Colour balance') },
          { label: 'Black & White...', action: () => console.log('B&W') },
          { label: 'Vibrance...', action: () => console.log('Vibrance') },
        ]},
      ]
    },
    {
      title: 'Layer',
      items: [
        { label: 'New Layer', shortcut: '⇧⌘N', action: handleAddLayer, disabled: !activeDocumentId },
        { label: 'Duplicate Layer', shortcut: '⌘J', action: handleDuplicateLayer, disabled: !activeDocument?.activeLayerId },
        { label: 'Delete Layer', action: handleDeleteLayer, disabled: !activeDocument?.activeLayerId },
        { divider: true },
        { label: 'Layer Properties...', action: () => console.log('Layer props'), disabled: !activeDocument?.activeLayerId },
        { label: 'Layer Style', submenu: [
          { label: 'Blending Options...', action: () => console.log('Blend') },
          { label: 'Drop Shadow...', action: () => console.log('Shadow') },
          { label: 'Inner Shadow...', action: () => console.log('Inner shadow') },
          { label: 'Outer Glow...', action: () => console.log('Glow') },
          { label: 'Stroke...', action: () => console.log('Stroke') },
        ]},
        { divider: true },
        { label: 'New Adjustment Layer', submenu: [
          { label: 'Brightness/Contrast...', action: () => console.log('Adj brightness') },
          { label: 'Levels...', action: () => console.log('Adj levels') },
          { label: 'Curves...', action: () => console.log('Adj curves') },
          { label: 'Hue/Saturation...', action: () => console.log('Adj hue') },
        ]},
        { label: 'Layer Mask', submenu: [
          { label: 'Reveal All', action: () => console.log('Mask reveal') },
          { label: 'Hide All', action: () => console.log('Mask hide') },
          { label: 'From Selection', action: () => console.log('Mask from sel') },
        ]},
        { divider: true },
        { label: 'Merge Down', shortcut: '⌘E', action: () => console.log('Merge down'), disabled: !activeDocument?.activeLayerId },
        { label: 'Merge Visible', shortcut: '⇧⌘E', action: () => console.log('Merge visible') },
        { label: 'Flatten Image', action: () => console.log('Flatten') },
      ]
    },
    {
      title: 'Select',
      items: [
        { label: 'All', shortcut: '⌘A', action: () => console.log('Select all'), disabled: !activeDocumentId },
        { label: 'Deselect', shortcut: '⌘D', action: () => console.log('Deselect'), disabled: !activeDocumentId },
        { label: 'Reselect', shortcut: '⇧⌘D', action: () => console.log('Reselect'), disabled: !activeDocumentId },
        { label: 'Inverse', shortcut: '⇧⌘I', action: () => console.log('Inverse'), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Modify', submenu: [
          { label: 'Border...', action: () => console.log('Border') },
          { label: 'Smooth...', action: () => console.log('Smooth') },
          { label: 'Expand...', action: () => console.log('Expand') },
          { label: 'Contract...', action: () => console.log('Contract') },
          { label: 'Feather...', shortcut: '⇧F6', action: () => console.log('Feather') },
        ]},
        { label: 'Grow', action: () => console.log('Grow'), disabled: !activeDocumentId },
        { label: 'Similar', action: () => console.log('Similar'), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Transform Selection', action: () => console.log('Transform sel'), disabled: !activeDocumentId },
        { label: 'Save Selection...', action: () => console.log('Save sel'), disabled: !activeDocumentId },
        { label: 'Load Selection...', action: () => console.log('Load sel') },
      ]
    },
    {
      title: 'Filter',
      items: [
        { label: 'Last Filter', shortcut: '⌘F', action: () => console.log('Last filter'), disabled: !activeDocumentId },
        { divider: true },
        { label: 'Blur', submenu: [
          { label: 'Gaussian Blur...', action: () => console.log('Gaussian blur') },
          { label: 'Motion Blur...', action: () => console.log('Motion blur') },
          { label: 'Radial Blur...', action: () => console.log('Radial blur') },
          { label: 'Smart Blur...', action: () => console.log('Smart blur') },
        ]},
        { label: 'Sharpen', submenu: [
          { label: 'Sharpen', action: () => console.log('Sharpen') },
          { label: 'Sharpen More', action: () => console.log('Sharpen more') },
          { label: 'Unsharp Mask...', action: () => console.log('Unsharp') },
          { label: 'Smart Sharpen...', action: () => console.log('Smart sharpen') },
        ]},
        { label: 'Noise', submenu: [
          { label: 'Add Noise...', action: () => console.log('Add noise') },
          { label: 'Reduce Noise...', action: () => console.log('Reduce noise') },
        ]},
        { divider: true },
        { label: 'Distort', submenu: [
          { label: 'Pinch...', action: () => console.log('Pinch') },
          { label: 'Twirl...', action: () => console.log('Twirl') },
          { label: 'Wave...', action: () => console.log('Wave') },
        ]},
        { label: 'Stylise', submenu: [
          { label: 'Emboss...', action: () => console.log('Emboss') },
          { label: 'Find Edges', action: () => console.log('Find edges') },
        ]},
      ]
    },
    {
      title: 'View',
      items: [
        { label: 'Zoom In', shortcut: '⌘+', action: () => console.log('Zoom in') },
        { label: 'Zoom Out', shortcut: '⌘-', action: () => console.log('Zoom out') },
        { label: 'Fit to Screen', shortcut: '⌘0', action: () => console.log('Fit') },
        { label: 'Actual Pixels', shortcut: '⌘1', action: () => console.log('100%') },
        { divider: true },
        { label: 'Show Rulers', shortcut: '⌘R', action: () => console.log('Rulers') },
        { label: 'Show Grid', shortcut: "⌘'", action: () => console.log('Grid') },
        { label: 'Show Guides', shortcut: '⌘;', action: () => console.log('Guides') },
        { divider: true },
        { label: 'Snap', action: () => console.log('Snap') },
        { label: 'Lock Guides', shortcut: '⌥⌘;', action: () => console.log('Lock guides') },
        { label: 'Clear Guides', action: () => console.log('Clear guides') },
      ]
    },
    {
      title: 'Window',
      items: [
        { label: 'Layers', shortcut: 'F7', action: () => console.log('Show layers') },
        { label: 'History', shortcut: 'F9', action: () => console.log('Show history') },
        { label: 'Properties', action: () => console.log('Show props') },
        { label: 'Adjustments', action: () => console.log('Show adjustments') },
        { divider: true },
        { label: 'Workspace', submenu: [
          { label: 'Essentials', action: () => console.log('Workspace essentials') },
          { label: 'Photography', action: () => console.log('Workspace photo') },
          { label: 'Painting', action: () => console.log('Workspace paint') },
          { label: 'Design', action: () => console.log('Workspace design') },
        ]},
      ]
    },
    {
      title: 'Help',
      items: [
        { label: 'Graphics Smasher Help', shortcut: 'F1', action: () => console.log('Help') },
        { label: 'Keyboard Shortcuts', shortcut: '⌘/', action: () => console.log('Shortcuts') },
        { divider: true },
        { label: 'About Graphics Smasher', action: () => console.log('About') },
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

