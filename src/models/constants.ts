import { Voice } from "@/src/models/voice";

export const MAX_JOURNAL_ENTRIES = 3;
export const USER_PATH = 'test';
export const JOURNAL_ENTRIES_PATH = 'journalEntries';
export const SUMMARY_NONE = 'None';

export const DEFAULT_VOICE_ID = '00a77add-48d5-4ef6-8157-71e5437b282d';

export const VOICES: Voice[] = [
  { id: '00a77add-48d5-4ef6-8157-71e5437b282d', name: 'American', region: 'X', country: 'US', sex: 'female', language: 'en' },
  { id: '03496517-369a-4db1-8236-3d3ae459ddf7', name: 'Spa Voice', region: 'X', country: 'US', sex: 'female', language: 'en' },
  { id: '79a125e8-cd45-4c13-8a67-188112f4dd22', name: 'British', region: 'X', country: 'UK', sex: 'female', language: 'en' },
  { id: 'f9836c6e-a0bd-460e-9d3c-f7299fa60f94', name: 'Southern', region: 'X', country: 'US', sex: 'female', language: 'en' },
  { id: '3b554273-4299-48b9-9aaf-eefd438e3941', name: 'Indian', region: 'X', country: 'US', sex: 'female', language: 'en' },
  { id: 'daf747c6-6bc2-4083-bd59-aa94dce23f5d', name: 'Arab', region: 'X', country: 'US', sex: 'female', language: 'en' },

  { id: 'a0e99841-438c-4a64-b679-ae501e7d6091', name: 'American', region: 'X', country: 'US', sex: 'male', language: 'en' },
  { id: '729651dc-c6c3-4ee5-97fa-350da1f88600', name: 'American 2', region: 'X', country: 'US', sex: 'male', language: 'en' },
  { id: '40104aff-a015-4da1-9912-af950fbec99e', name: 'Southern', region: 'X', country: 'US', sex: 'male', language: 'en' },
  { id: '638efaaa-4d0c-442e-b701-3fae16aad012', name: 'Indian', region: 'X', country: 'US', sex: 'male', language: 'en' },
]