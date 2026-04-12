"use client"

import { db, type DBMutation } from '../db/client'

/**
 * Mutation Queue Management
 * 
 * Manages the queue of offline mutations (create, update, delete operations)
 * that need to be synchronized with the server when connectivity is restored.
 */

export interface AddMutationParams {
  entity: DBMutation['entity']
  entityId: string
  operation: DBMutation['operation']
  payload: any
}

/**
 * Add a mutation to the sync queue
 * 
 * @param params - Mutation parameters
 * @returns The ID of the created mutation record
 */
export async function addMutation(params: AddMutationParams): Promise<number> {
  const mutation: Omit<DBMutation, 'id'> = {
    entity: params.entity,
    entityId: params.entityId,
    operation: params.operation,
    payload: params.payload,
    status: 'pending',
    retryCount: 0,
    nextRetryAt: null,
    lastError: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const id = await db.mutationQueue.add(mutation)
  
  console.log(`[MutationQueue] Added ${params.operation} mutation for ${params.entity}:${params.entityId}`, { id })
  
  return id
}

/**
 * Get all pending mutations from the queue
 * 
 * @returns Array of pending mutations, sorted by creation time
 */
export async function getPendingMutations(): Promise<DBMutation[]> {
  const mutations = await db.mutationQueue
    .where('status')
    .equals('pending')
    .or('status')
    .equals('failed')
    .filter(m => !m.nextRetryAt || m.nextRetryAt <= Date.now())
    .sortBy('createdAt')
  
  return mutations
}

/**
 * Get the count of pending mutations
 * 
 * @returns Number of mutations waiting to be synced
 */
export async function getPendingMutationCount(): Promise<number> {
  const count = await db.mutationQueue
    .where('status')
    .equals('pending')
    .or('status')
    .equals('failed')
    .filter(m => !m.nextRetryAt || m.nextRetryAt <= Date.now())
    .count()
  
  return count
}

/**
 * Update a mutation's status
 * 
 * @param id - Mutation ID
 * @param updates - Fields to update
 */
export async function updateMutation(
  id: number,
  updates: Partial<Omit<DBMutation, 'id'>>
): Promise<void> {
  await db.mutationQueue.update(id, {
    ...updates,
    updatedAt: Date.now()
  })
}

/**
 * Remove a mutation from the queue
 * 
 * @param id - Mutation ID
 */
export async function removeMutation(id: number): Promise<void> {
  await db.mutationQueue.delete(id)
  console.log(`[MutationQueue] Removed mutation ${id}`)
}

/**
 * Clear all completed mutations older than the specified age
 * 
 * @param maxAgeMs - Maximum age in milliseconds (default: 24 hours)
 */
export async function clearOldMutations(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const cutoffTime = Date.now() - maxAgeMs
  
  const oldMutations = await db.mutationQueue
    .where('status')
    .equals('completed')
    .and(m => m.updatedAt < cutoffTime)
    .toArray()
  
  if (oldMutations.length > 0) {
    await db.mutationQueue.bulkDelete(oldMutations.map(m => m.id!))
    console.log(`[MutationQueue] Cleared ${oldMutations.length} old mutations`)
  }
}

/**
 * Get all mutations for a specific entity
 * 
 * @param entity - Entity type
 * @param entityId - Entity ID
 * @returns Array of mutations for the entity
 */
export async function getMutationsForEntity(
  entity: DBMutation['entity'],
  entityId: string
): Promise<DBMutation[]> {
  const mutations = await db.mutationQueue
    .where('[entity+entityId]')
    .equals([entity, entityId])
    .sortBy('createdAt')
  
  return mutations
}
