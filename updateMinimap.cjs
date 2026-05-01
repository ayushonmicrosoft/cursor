const fs = require('fs');
let content = fs.readFileSync('c:/oandocraft/src/components/editor/Minimap.tsx', 'utf8');

// Add import
content = "import { DockableToolbar } from './DockableToolbar'\n" + content;

// Replace MINIMAP_ANCHOR_CLASS logic
content = content.replace(/className=\{`\$\{MINIMAP_ANCHOR_CLASS\}.*?`\}/g, 'className="cursor-grab select-none overflow-hidden touch-none active:cursor-grabbing bg-white dark:bg-gray-900"');
content = content.replace(/className=\{`\$\{MINIMAP_ANCHOR_CLASS\}.*?`\}/g, 'className="flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900"');

// Wrap returns in DockableToolbar
content = content.replace(/if \(!minimapVisible\) return null/g, '// if (!minimapVisible) return null');

content = content.replace(/return \(\s*<div\s*ref=\{ref\}\s*role="region"/g, `return (
    <DockableToolbar
      id="minimap"
      title="Minimap"
      dockedClassName="bottom-12 right-24"
      className="w-auto"
    >
      <div
        ref={ref}
        role="region"`);

// Add closing tag for DockableToolbar
content = content.replace(/<\/button>\s*<\/div>\s*\)\s*\}/g, '</button>\n      </div>\n    </DockableToolbar>\n  )\n}');

fs.writeFileSync('c:/oandocraft/src/components/editor/Minimap.tsx', content, 'utf8');
