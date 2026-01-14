// @ts-nocheck - Supabase SSR type inference workaround
'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types/database'

const supabase = createClient()

async function fetchCustomers(): Promise<Customer[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchCustomer(id: string): Promise<Customer | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error) return null
  return data
}

export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR(
    'customers',
    fetchCustomers,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    customers: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCustomer(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `customer-${id}` : null,
    () => fetchCustomer(id!),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    customer: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createCustomer(
  customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>
) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateCustomerStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('customers')
    .update({ status, last_contact_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addCustomerInteraction(
  customerId: string,
  type: string,
  content?: string,
  propertyId?: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('customer_interactions')
    .insert({
      customer_id: customerId,
      owner_id: user.id,
      type,
      content,
      property_id: propertyId,
    })
    .select()
    .single()

  if (error) throw error

  // Update last contact
  await supabase
    .from('customers')
    .update({ last_contact_at: new Date().toISOString() })
    .eq('id', customerId)

  return data
}
