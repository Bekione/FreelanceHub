"use client"

import Dexie, { type Table } from 'dexie'

// Database interfaces matching server types with offline metadata
export interface DBProject {
  id: string
  title: string
  description: string | null
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  deadline: string | null
  budget: number | null
  bonus: number | null
  platform: string | null
  category: string | null
  clientId: string | null
  createdAt: string
  updatedAt: string
  // Offline metadata
  _syncedAt: number
  _isLocalOnly: boolean
}

export interface DBClient {
  id: string
  name: string
  email: string | null
  company: string | null
  phone: string | null
  notes: string | null
  hasPortal: boolean
  createdAt: string
  updatedAt: string
  // Offline metadata
  _syncedAt: number
  _isLocalOnly: boolean
}

export interface DBInvoice {
  id: string
  invoiceNumber: string
  amount: number
  bonus: number | null
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  issueDate: string
  dueDate: string
  notes: string | null
  clientId: string | null
  projectId: string | null
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
  }>
  createdAt: string
  updatedAt: string
  // Offline metadata
  _syncedAt: number
  _isLocalOnly: boolean
}

export interface DBTimeEntry {
  id: string
  description: string
  hours: number
  date: string
  projectId: string | null
  createdAt: string
  updatedAt: string
  // Offline metadata
  _syncedAt: number
  _isLocalOnly: boolean
}

export interface DBDashboardMetrics {
  id: string
  totalRevenue: number
  pendingRevenue: number
  activeProjects: number
  totalClients: number
  lastSynced: number
}

export interface DBMutation {
  id?: number
  entity: 'project' | 'client' | 'invoice' | 'timeEntry'
  entityId: string
  operation: 'create' | 'update' | 'delete'
  payload: any
  status: 'pending' | 'processing' | 'failed' | 'completed'
  retryCount: number
  nextRetryAt: number | null
  lastError: string | null
  createdAt: number
  updatedAt: number
}

export interface DBSyncMetadata {
  key: string
  value: any
  updatedAt: number
}

/**
 * FreelanceHub Offline Database
 * 
 * This database stores all application data locally for offline access.
 * It serves as the single source of truth for the UI, with background
 * synchronization to the server.
 */
export class FreelanceHubDB extends Dexie {
  projects!: Table<DBProject, string>
  clients!: Table<DBClient, string>
  invoices!: Table<DBInvoice, string>
  timeEntries!: Table<DBTimeEntry, string>
  dashboardMetrics!: Table<DBDashboardMetrics, string>
  mutationQueue!: Table<DBMutation, number>
  syncMetadata!: Table<DBSyncMetadata, string>

  constructor() {
    super('freelancehub-offline')
    
    // Version 1: Initial schema
    this.version(1).stores({
      // Projects table with indexes for filtering and sorting
      projects: 'id, clientId, status, updatedAt, _syncedAt',
      
      // Clients table with indexes for search and sorting
      clients: 'id, email, updatedAt, _syncedAt',
      
      // Invoices table with indexes for filtering
      invoices: 'id, clientId, projectId, status, updatedAt, _syncedAt',
      
      // Time entries table with indexes for filtering by project
      timeEntries: 'id, projectId, date, updatedAt, _syncedAt',
      
      // Dashboard metrics (single record)
      dashboardMetrics: 'id, lastSynced',
      
      // Mutation queue for offline operations
      mutationQueue: '++id, status, nextRetryAt, createdAt',
      
      // Sync metadata for tracking sync state
      syncMetadata: 'key'
    })
  }
}

// Singleton instance
export const db = new FreelanceHubDB()
