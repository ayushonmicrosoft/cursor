import { useUIStore } from '../../stores/uiStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { TEMPLATES } from '../../data/templates'
import { Modal, ModalBody } from '../ui'

export function NewProjectModal() {
  const open = useUIStore((s) => s.templatePickerOpen)
  const setOpen = useUIStore((s) => s.setTemplatePickerOpen)
  const setElements = useElementsStore((s) => s.setElements)
  const createNewProject = useProjectStore((s) => s.createNewProject)
  const setSettings = useCanvasStore((s) => s.setSettings)

  const close = () => setOpen(false)

  const handleSelect = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    createNewProject(template.name === 'Blank Canvas' ? undefined : template.name)
    setSettings(template.canvasSettings)

    const elements = template.createElements()
    const elementMap: Record<string, typeof elements[number]> = {}
    for (const el of elements) {
      elementMap[el.id] = el
    }
    setElements(elementMap)
    setOpen(false)
  }

  return (
    <Modal open={open} onClose={close} title="New Project" size="lg">
      <ModalBody>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Choose an office template or start with a blank canvas</p>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="flex flex-col items-start rounded-2xl border border-white/40 bg-white/70 p-4 text-left shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white/90 dark:border-white/10 dark:bg-slate-950/60 dark:hover:border-blue-900/50 dark:hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{t.category}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.name}</span>
              <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.description}</span>
            </button>
          ))}
        </div>
      </ModalBody>
    </Modal>
  )
}
