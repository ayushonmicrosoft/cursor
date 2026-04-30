import { ShieldAlert, RefreshCw, Trash2, Unlock } from 'lucide-react'
import { useProjectStore } from '../../../stores/projectStore'
import { useElementsStore } from '../../../stores/elementsStore'
import { supabase } from '../../../lib/supabase'

export function AdminPanel() {
  const elements = useElementsStore((s) => s.elements)
  const setElements = useElementsStore((s) => s.setElements)
  const officeId = useProjectStore((s) => s.officeId)

  const handleClearMap = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL map elements. Are you sure?")) return
    setElements({})
  }

  const handleUnlockAll = () => {
    const next = { ...elements }
    for (const key in next) {
      if (next[key].locked) {
        next[key] = { ...next[key], locked: false }
      }
    }
    setElements(next)
  }

  const handlePromoteSelf = async () => {
    if (!officeId) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    await supabase.from('office_permissions').upsert({
      office_id: officeId,
      user_id: user.id,
      role: 'owner'
    })
    window.alert("You have explicitly made yourself the owner on the backend.")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="text-red-500" />
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Super Admin Controls</h2>
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-400">
        You are authenticated as <strong>ayush@oando.co.in</strong>. You bypass all permission controls and have full "editMap" rights everywhere via `useCan`.
      </p>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fast Overrides</h3>
        <button
          onClick={handleUnlockAll}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm font-medium transition-colors"
        >
          <Unlock size={16} />
          Unlock All Elements
        </button>
        <button
          onClick={handleClearMap}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium transition-colors"
        >
          <Trash2 size={16} />
          Clear Entire Map (Nuke)
        </button>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Database Tools</h3>
        <button
          onClick={handlePromoteSelf}
          className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
        >
          <RefreshCw size={16} />
          Force Sync Owner Role to DB
        </button>
      </div>
      
      <div className="mt-8 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
        <strong>Drag and Drop Enabled:</strong> By bypassing the permission matrix, your account automatically has rights to drag, drop, resize, and edit items on any floor plan—even teams you don't belong to.
      </div>
    </div>
  )
}
