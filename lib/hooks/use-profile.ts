'use client'
// @ts-nocheck - Supabase SSR type inference workaround

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const supabase = createClient()

async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    'profile',
    fetchProfile,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function updateProfile(updates: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWatermarkSettings(settings: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('profiles')
    .update({ watermark_settings: settings })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}
