'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

export function AmplitudeInitializer() {
  useEffect(() => {
    amplitude.init('19540656b27700fd5ec026b7ca44d57b', {"autocapture":true});
    console.log("amplitude initialized");
    amplitude.track("test", {
      "test1": "test2"
    });
    console.log("amplitude tracked");
  }, []);

  return null; // This component doesn't render anything
} 