'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

export function AmplitudeInitializer() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
      console.error("Amplitude API key not found");
      return;
    }
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY, { autocapture: true });
  }, []);

  return null;
}