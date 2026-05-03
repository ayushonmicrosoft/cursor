import { supabase } from './supabase'
import type { BlockSourceTier } from '../blocks/registry'

export type BlockLibraryRecord = {
  id: string
  slug: string
  name: string
  category: string
  asset_type: string
  source_tier: BlockSourceTier
  canonical: boolean
  provenance: string
  source_url: string | null
  asset_url: string | null
  thumbnail_url: string | null
  status: 'draft' | 'imported' | 'verified' | 'archived'
  created_at: string
  updated_at: string
}

export async function fetchBlockLibraryRecords() {
  const { data, error } = await supabase
    .from('block_library_records')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as BlockLibraryRecord[]
}

export async function upsertBlockLibraryRecord(record: Partial<BlockLibraryRecord> & { slug: string; name: string }) {
  const { data, error } = await supabase
    .from('block_library_records')
    .upsert(record, { onConflict: 'slug' })
    .select('*')
    .single()

  if (error) throw error
  return data as BlockLibraryRecord
}
