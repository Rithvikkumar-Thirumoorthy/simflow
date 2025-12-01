import axios, { AxiosInstance } from 'axios';
import type {
  User,
  Dataset,
  Image,
  Annotation,
  LoginCredentials,
  RegisterData,
  TokenResponse,
} from '../types';

class API {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post<TokenResponse>('/api/auth/refresh', {
                refresh_token: refreshToken,
              });

              const { access_token, refresh_token } = response.data;
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', refresh_token);

              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: RegisterData): Promise<User> {
    const response = await this.client.post<User>('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/auth/login', null, {
      params: { email, password },
    });
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Datasets
  async getDatasets(): Promise<Dataset[]> {
    const response = await this.client.get<Dataset[]>('/datasets/');
    return response.data;
  }

  async createDataset(data: { name: string; description?: string }): Promise<Dataset> {
    const response = await this.client.post<Dataset>('/datasets/', data);
    return response.data;
  }

  async getDataset(id: number): Promise<Dataset> {
    const response = await this.client.get<Dataset>(`/datasets/${id}`);
    return response.data;
  }

  async updateDataset(id: number, data: { name?: string; description?: string }): Promise<Dataset> {
    const response = await this.client.put<Dataset>(`/datasets/${id}`, data);
    return response.data;
  }

  async deleteDataset(id: number): Promise<void> {
    await this.client.delete(`/datasets/${id}`);
  }

  // Images
  async getDatasetImages(datasetId: number): Promise<Image[]> {
    const response = await this.client.get<Image[]>(`/datasets/${datasetId}/images`);
    return response.data;
  }

  async uploadImages(datasetId: number, files: File[]): Promise<Image[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post<Image[]>(
      `/images/datasets/${datasetId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getImage(id: number): Promise<Image> {
    const response = await this.client.get<Image>(`/images/${id}`);
    return response.data;
  }

  async getImageUrl(id: number, thumbnail: boolean = false): Promise<{ url: string }> {
    const response = await this.client.get<{ url: string }>(`/images/${id}/url`, {
      params: { thumbnail },
    });
    return response.data;
  }

  async deleteImage(id: number): Promise<void> {
    await this.client.delete(`/images/${id}`);
  }

  // Annotations
  async getImageAnnotations(imageId: number): Promise<Annotation[]> {
    const response = await this.client.get<Annotation[]>(`/images/${imageId}/annotations`);
    return response.data;
  }

  async createAnnotation(data: {
    image_id: number;
    label: string;
    annotation_type: string;
    geometry: any;
  }): Promise<Annotation> {
    const response = await this.client.post<Annotation>('/annotations', data);
    return response.data;
  }

  async updateAnnotation(
    id: number,
    data: { label?: string; geometry?: any }
  ): Promise<Annotation> {
    const response = await this.client.put<Annotation>(`/annotations/${id}`, data);
    return response.data;
  }

  async deleteAnnotation(id: number): Promise<void> {
    await this.client.delete(`/annotations/${id}`);
  }
}

export const api = new API();
