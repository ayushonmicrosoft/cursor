const fs = require('fs');
let content = fs.readFileSync('c:/oandocraft/src/stores/uiStore.ts', 'utf8');

// Add minimap to DockableToolbarId
content = content.replace(/\|\s*'color-palette'/g, "| 'color-palette'\n    | 'minimap'");

// Add minimap to DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS
content = content.replace(/'color-palette': \{ mode: 'docked', position: \{ x: 88, y: 112 \} \},/g, "'color-palette': { mode: 'docked', position: { x: 88, y: 112 } },\n    'minimap': { mode: 'docked', position: { x: 920, y: 800 } },");

// Add minimap to DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY
content = content.replace(/'color-palette': true,/g, "'color-palette': true,\n    'minimap': true,");

// Add minimap to WORKSPACE_PRESET_CONFIGS visibility
content = content.replace(/'color-palette': false,/g, "'color-palette': false,\n        'minimap': true,");

// Add minimap to cloneToolbarLayouts
content = content.replace(/'color-palette': \{[\s\S]*?\},/g, "'color-palette': {\n        mode: layouts['color-palette'].mode,\n        position: { ...layouts['color-palette'].position },\n      },\n      'minimap': {\n        mode: layouts['minimap'].mode,\n        position: { ...layouts['minimap'].position },\n      },");

// Add minimap to cloneToolbarVisibility
content = content.replace(/'color-palette': visibility\['color-palette'\],/g, "'color-palette': visibility['color-palette'],\n      'minimap': visibility['minimap'],");

// Add minimap to readStoredToolbarLayouts
content = content.replace(/'color-palette': sanitizeToolbarLayout\('color-palette', 'storage-read', parsed\['color-palette'\]\),/g, "'color-palette': sanitizeToolbarLayout('color-palette', 'storage-read', parsed['color-palette']),\n        'minimap': sanitizeToolbarLayout('minimap', 'storage-read', parsed['minimap']),");

// Add minimap to readStoredToolbarVisibility
content = content.replace(/'color-palette':\s*typeof parsed\['color-palette'\] === 'boolean'\s*\?\s*parsed\['color-palette'\]\s*:\s*DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY\['color-palette'\],/g, "'color-palette':\n          typeof parsed['color-palette'] === 'boolean'\n            ? parsed['color-palette']\n            : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['color-palette'],\n        'minimap':\n          typeof parsed['minimap'] === 'boolean'\n            ? parsed['minimap']\n            : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['minimap'],");

fs.writeFileSync('c:/oandocraft/src/stores/uiStore.ts', content, 'utf8');
