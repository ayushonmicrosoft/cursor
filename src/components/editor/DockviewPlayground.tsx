import { DockviewReact } from 'dockview-react'
import type { DockviewReadyEvent, IDockviewPanelProps } from 'dockview-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

const MotionPanel = (_props: IDockviewPanelProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="p-6 h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      className="w-16 h-16 bg-blue-500 rounded-xl shadow-lg mb-4"
    />
    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Framer Motion is Active!</h2>
    <p className="text-sm text-gray-500 max-w-xs">This panel sliding in and the rotating cube are powered entirely by framer-motion.</p>
  </motion.div>
)

const QueryPanel = (_props: IDockviewPanelProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['demo-teams'],
    queryFn: async () => {
      const { data } = await supabase.from('teams').select('name, slug').limit(3)
      return data || []
    }
  })

  return (
    <div className="p-6 h-full bg-white dark:bg-gray-900 overflow-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">React Query is Active!</h2>
      <p className="text-sm text-gray-500 mb-4">Fetching live team data using Tanstack Query with automatic caching and retry logic:</p>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.map(team => (
            <div key={team.slug} className="p-3 border border-gray-200 dark:border-gray-800 rounded shadow-sm text-sm font-medium">
              {team.name} <span className="text-xs text-gray-400 ml-2 font-normal">/{team.slug}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const components = {
  motionPanel: MotionPanel,
  queryPanel: QueryPanel,
}

export function DockviewPlayground() {
  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel({
      id: 'motion',
      component: 'motionPanel',
      title: 'Animation Engine',
    })
    event.api.addPanel({
      id: 'query',
      component: 'queryPanel',
      title: 'Data Engine',
      position: { referencePanel: 'motion', direction: 'right' }
    })
  }

  return (
    <div className="h-[400px] w-full border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden mt-8 mb-12 flex flex-col">
      <div className="bg-gray-900 text-white px-4 py-2 text-xs font-mono flex justify-between items-center">
        <span>⚡ ARCHITECTURE UPGRADE COMPLETE ⚡</span>
        <span className="text-gray-400">dockview-react • framer-motion • react-query</span>
      </div>
      <DockviewReact
        components={components}
        onReady={onReady}
        className="dockview-theme-light dark:dockview-theme-dark flex-1"
      />
    </div>
  )
}
