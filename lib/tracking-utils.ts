// lib/tracking-utils.ts
// Event ID generation and deduplication utilities

/**
 * Generates a unique event ID for deduplication between browser and server events
 * Format: timestamp-randomstring to ensure uniqueness
 */
export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Stores an event ID in sessionStorage for deduplication
 * Used to prevent duplicate event processing
 */
export function markEventProcessed(eventId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const processedEvents = new Set<string>(
      JSON.parse(sessionStorage.getItem('processed-events') || '[]')
    );
    processedEvents.add(eventId);
    
    // Keep only last 100 events to prevent storage bloat
    const eventsArray = Array.from(processedEvents).slice(-100);
    sessionStorage.setItem('processed-events', JSON.stringify(eventsArray));
  } catch (error) {
    console.error('Failed to mark event as processed:', error);
  }
}

/**
 * Checks if an event has already been processed
 */
export function isEventProcessed(eventId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const processedEvents = new Set<string>(
      JSON.parse(sessionStorage.getItem('processed-events') || '[]')
    );
    return processedEvents.has(eventId);
  } catch (error) {
    console.error('Failed to check event processing status:', error);
    return false;
  }
}

/**
 * Extracts numeric price from formatted price string (e.g., "5,000 DA" -> 5000)
 */
export function extractPriceValue(priceString: string): number {
  if (!priceString) return 0;
  const numericValue = priceString.replace(/\D/g, '');
  return parseInt(numericValue, 10) || 0;
}

/**
 * Formats phone number for tracking (removes spaces, keeps digits)
 */
export function formatPhoneForTracking(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Gets current timestamp in seconds for API payloads
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
