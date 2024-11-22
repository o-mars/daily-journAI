export interface Voice {
  id: string;
  name: string;
  region: string;
  country: string;
  sex: 'male' | 'female' | 'other';
  language: string;
}