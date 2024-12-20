import * as amplitude from '@amplitude/analytics-browser';

export type EventCategory = 'auth' | 'session' | 'journals' | 'app';

export type MagicErrorEventName = 'magic-link-auth-error' | 'magic-link-send-error';
export type MagicEventName = 'magic-link-sent' | 'magic-link-received' | 'magic-link-authenticated' | MagicErrorEventName;
export type AuthEventName = 'login' | 'logout' | 'signup' | 'account-linked'| 'account-deleted' | MagicEventName;

export type SessionErrorEventName = 'session-error';
export type SessionActionEventName = 'mic-enabled' | 'mic-disabled' | 'speaker-enabled' | 'speaker-disabled' | 'text-message-sent';
export type SessionEventName = 'session-started' | 'session-ended' | 'session-saved' | 'session-discarded' | SessionActionEventName | SessionErrorEventName;

export type AppEventName = 'vad-updated' | 'voice-updated' | 'language-updated' | 'male-voice-selected' | 'female-voice-selected' | 'voice-error' | 'provider-updated';

export type JournalEventName = 'journal-updated' | 'journal-deleted' | 'all-journal-deleted' | 'journal-title-updated' | 'journal-title-reverted' | 'journal-notes-updated';

export type EventName = AuthEventName | SessionEventName | AppEventName | JournalEventName;


export function trackEvent(eventCategory: EventCategory, eventName: EventName, eventProperties: Record<string, string | number | boolean | undefined>) {
  amplitude.track(eventCategory, { eventName, ...eventProperties });
  amplitude.track(eventName, { eventCategory, ...eventProperties });
}
