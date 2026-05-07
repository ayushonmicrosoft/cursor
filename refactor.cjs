const fs = require('fs');

const path = 'c:\\oandocraft\\src\\components\\editor\\MapView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Left sidebar replacement
const pattern1 = /\{!\s*isCompactEditor\s*&&\s*leftToolsVisible\s*&&\s*!leftToolsFloating\s*&&[\s\S]*?(?=<div\s+className="relative min-w-0 flex-1 overflow-hidden bg-slate-100 dark:bg-gray-950"\s+data-canvas-toolbar-host\s*>)/;
content = content.replace(pattern1, '');

// Remove 'leftToolsFloating &&' from Left DockableToolbar
content = content.replace('{!isCompactEditor && leftToolsVisible && leftToolsFloating && (', '{leftToolsVisible && (');

// Right sidebar replacement
const pattern2 = /\{rightSidebarOpen && rightInspectorVisible && rightInspectorFloating && \(\s*<DockableToolbar[\s\S]*?<\/DockableToolbar>\s*\)\}[\s\S]*?<\/div>\s*<\/div>\s*<\/>/;
const replacement2 = `{rightSidebarOpen && rightInspectorVisible && (
            <DockableToolbar
              id="right-inspector"
              title="Inspector"
              dockedClassName="right-4 top-4"
              className="max-h-[calc(100%-2rem)] w-[320px] overflow-y-auto"
            >
              <RightSidebar />
            </DockableToolbar>
          )}
        </div>
      </div>
      </div>
    </>`;
content = content.replace(pattern2, replacement2);

fs.writeFileSync(path, content, 'utf8');
