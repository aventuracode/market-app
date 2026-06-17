import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { CashMovementDB } from '../domain/cash'

/**
 * Cash Realtime Service
 * Manages Supabase Realtime subscriptions for cash_movements table
 * Production-ready with proper cleanup and error handling
 */
class CashRealtimeService {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()

  /**
   * Subscribe to cash movements changes for a specific cash session
   * @param sessionId - The cash session ID to monitor
   * @param tenantId - The tenant ID for security filtering
   * @param callbacks - Callback functions for different event types
   * @returns Cleanup function to unsubscribe
   */
  subscribeToCashMovements(
    sessionId: string,
    tenantId: string,
    callbacks: {
      onInsert?: (payload: RealtimePostgresChangesPayload<CashMovementDB>) => void
      onUpdate?: (payload: RealtimePostgresChangesPayload<CashMovementDB>) => void
      onDelete?: (payload: RealtimePostgresChangesPayload<CashMovementDB>) => void
      onError?: (error: Error) => void
    }
  ): () => void {
    const channelName = `cash_movements:${sessionId}`

    // Remove existing channel if any
    const existingChannel = this.channels.get(channelName)
    if (existingChannel) {
      this.supabase.removeChannel(existingChannel)
      this.channels.delete(channelName)
    }

    // Create new channel and configure ALL callbacks BEFORE subscribe
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cash_movements',
          filter: `cash_session_id=eq.${sessionId}`,
        },
        (payload) => {
          const record = payload.new as CashMovementDB
          
          if (record.tenant_id === tenantId) {
            callbacks.onInsert?.(payload as RealtimePostgresChangesPayload<CashMovementDB>)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cash_movements',
          filter: `cash_session_id=eq.${sessionId}`,
        },
        (payload) => {
          const record = payload.new as CashMovementDB
          if (record.tenant_id === tenantId) {
            callbacks.onUpdate?.(payload as RealtimePostgresChangesPayload<CashMovementDB>)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'cash_movements',
          filter: `cash_session_id=eq.${sessionId}`,
        },
        (payload) => {
          callbacks.onDelete?.(payload as RealtimePostgresChangesPayload<CashMovementDB>)
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Channel error on ${channelName}:`, err)
          callbacks.onError?.(new Error(err?.message || 'Channel error'))
        }
        if (status === 'TIMED_OUT') {
          console.error(`[Realtime] Subscription timed out on ${channelName}`)
          callbacks.onError?.(new Error('Subscription timed out'))
        }
      })

    // Store channel reference
    this.channels.set(channelName, channel)

    // Return cleanup function
    return () => this.unsubscribe(channelName)
  }

  /**
   * Subscribe to cash sessions changes
   * Useful for monitoring when cash is opened/closed by other users
   */
  subscribeToCashSessions(
    tenantId: string,
    callbacks: {
      onInsert?: (payload: any) => void
      onUpdate?: (payload: any) => void
      onError?: (error: Error) => void
    }
  ): () => void {
    const channelName = `cash_sessions:${tenantId}`

    // Remove existing channel if any
    const existingChannel = this.channels.get(channelName)
    if (existingChannel) {
      this.supabase.removeChannel(existingChannel)
      this.channels.delete(channelName)
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cash_sessions',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            callbacks.onInsert?.(payload)
          } else if (payload.eventType === 'UPDATE') {
            callbacks.onUpdate?.(payload)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[Realtime] Error on ${channelName}:`, err)
          callbacks.onError?.(new Error(err?.message || 'Subscription error'))
        }
      })

    this.channels.set(channelName, channel)

    return () => this.unsubscribe(channelName)
  }

  /**
   * Unsubscribe from a specific channel
   */
  private async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName)
    if (channel) {
      await this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  /**
   * Unsubscribe from all channels
   * Call this on app unmount or user logout
   */
  async unsubscribeAll(): Promise<void> {
    const channelNames = Array.from(this.channels.keys())
    await Promise.all(channelNames.map((name) => this.unsubscribe(name)))
  }

  /**
   * Get active channels count (for debugging)
   */
  getActiveChannelsCount(): number {
    return this.channels.size
  }
}

// Singleton instance
export const cashRealtimeService = new CashRealtimeService()
