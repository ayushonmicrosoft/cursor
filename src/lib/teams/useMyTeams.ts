import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Team } from '../../types/team'

export function useMyTeams() {
  const [teams, setTeams] = useState<Team[] | null>(null)
  useEffect(() => {
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let attempts = 0

    const MAX_ATTEMPTS = 3

    const load = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, slug, name, created_by, created_at')
        .order('created_at', { ascending: true })

      if (cancelled) return

      if (error) {
        attempts += 1
        if (attempts < MAX_ATTEMPTS) {
          retryTimer = setTimeout(() => {
            void load()
          }, attempts * 600)
          return
        }
        console.error('[useMyTeams] Failed to load teams', error)
        // Resolve loading state after max retries to avoid an indefinite
        // skeleton when bootstrapping fails repeatedly.
        setTeams([])
        return
      }

      setTeams(data ?? [])
    }

    void load()
    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [])
  return teams
}
