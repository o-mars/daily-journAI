import { getAuth } from "firebase/auth";

export async function analyzeTranscriptForSummary(transcript: string): Promise<string> {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user');
    const response = await fetch('/api/llm/analysis/mood', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: transcript})
    });
    
    if (!response.ok) throw new Error('Failed to analyze transcript');
    
    const data = await response.json();

    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return '';
  }
}
