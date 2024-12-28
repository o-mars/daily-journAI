import { getAuth } from "firebase/auth";

export async function getConfigIdForUser(): Promise<string> {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user');
    const response = await fetch('/api/user/config', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error('Failed to get config');

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return '';
  }
}
