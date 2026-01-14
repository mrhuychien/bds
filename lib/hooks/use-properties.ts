// @ts-nocheck - Supabase SSR type inference workaround
'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types/database'

const supabase = createClient()

async function fetchProperties(): Promise<Property[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchProperty(id: string): Promise<Property | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error) return null
  return data
}

export function useProperties() {
  const { data, error, isLoading, mutate } = useSWR(
    'properties',
    fetchProperties,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    properties: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProperty(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `property-${id}` : null,
    () => fetchProperty(id!),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    property: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createProperty(
  property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'slug' | 'microsite_views'>
) {
  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProperty(
  id: string,
  updates: Partial<Property>
) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function togglePropertyPublic(id: string, isPublic: boolean) {
  const { data, error } = await supabase
    .from('properties')
    .update({ is_public: isPublic })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
