export interface Student {
  id: string;
  fullName: string;
  gender: 'Erkak' | 'Ayol'; // Jinsi
  photoUrl?: string;     // Talaba rasmi
  housePhotoUrls: string[]; // Yashash joyi (uy) rasmlari (Massiv)
  faculty: string;
  specialization: string;
  course: string;
  group: string;
  phone: string;
  city: string;
  mahalla: string;
  street: string;
  houseNumber: string;
  registrationDate: string;
}

export interface LocationOption {
  value: string;
  label: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface UniversityStats {
  name: string;
  count: number;
}