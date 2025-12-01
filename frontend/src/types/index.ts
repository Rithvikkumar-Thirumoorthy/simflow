export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  image_count?: number;
  annotation_count?: number;
}

export interface Image {
  id: number;
  filename: string;
  dataset_id: number;
  s3_key: string;
  thumbnail_key?: string;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  annotation_count?: number;
}

export type AnnotationType = 'bbox' | 'polygon' | 'point';

export interface Annotation {
  id: number;
  image_id: number;
  label: string;
  annotation_type: AnnotationType;
  geometry: BBoxGeometry | PolygonGeometry | PointGeometry;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface BBoxGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonGeometry {
  points: number[][]; // Array of [x, y] coordinates
}

export interface PointGeometry {
  x: number;
  y: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
