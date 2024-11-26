export interface Voice {
  id: string;
  name: string;
  region: string;
  country: string;
  sex: 'male' | 'female' | 'other';
  languageId: string;
}

export interface Language {
  id: string;
  name: string;
}