import re

with open(r'c:\oandocraft\src\components\editor\MapView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Left sidebar replacement
pattern1 = re.compile(r'\{!\s*isCompactEditor\s*&&\s*leftToolsVisible\s*&&\s*!leftToolsFloating\s*&&.*?(?=<div\s+className="relative min-w-0 flex-1 overflow-hidden bg-slate-100 dark:bg-gray-950"\s+data-canvas-toolbar-host\s*>)', re.DOTALL)
content = pattern1.sub('', content)

# Remove 'leftToolsFloating &&' from Left DockableToolbar
content = content.replace('{!isCompactEditor && leftToolsVisible && leftToolsFloating && (', '{leftToolsVisible && (')

# Right sidebar replacement
pattern2 = re.compile(r'\{rightSidebarOpen && rightInspectorVisible && rightInspectorFloating && \(\s*<DockableToolbar[\s\S]*?</DockableToolbar>\s*\)\}[\s\S]*?</div>\s*</div>\s*</>', re.DOTALL)

replacement2 = '''{rightSidebarOpen && rightInspectorVisible && (
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
    </>'''
content = pattern2.sub(replacement2, content)

with open(r'c:\oandocraft\src\components\editor\MapView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
