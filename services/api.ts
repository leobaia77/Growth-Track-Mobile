import { storage } from './storage';
import type { AuthResponse, ApiError } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://node-post-connect.replit.app';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(requiresAuth: boolean): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = await storage.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, requiresAuth = true } = options;
    
    const headers = await this.getHeaders(requiresAuth);
    
    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      throw new Error(`Network request failed: ${errorMessage}. URL: ${url}`);
    }

    if (response.status === 401) {
      await storage.clear();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ 
        error: 'Request failed' 
      }));
      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false,
    });
    
    await storage.setToken(response.token);
    await storage.setUser(response.user);
    
    return response;
  }

  async register(email: string, password: string, displayName: string, securityWord?: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName, role: 'user' },
      requiresAuth: false,
    });
    
    await storage.setToken(response.token);
    await storage.setUser(response.user);
    
    return response;
  }

  async verifySecurityWord(email: string, securityWord: string): Promise<{ valid: boolean }> {
    return this.request<{ valid: boolean }>('/api/auth/verify-security-word', {
      method: 'POST',
      body: { email, securityWord },
      requiresAuth: false,
    });
  }

  async resetPassword(email: string, securityWord: string, newPassword: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      body: { email, securityWord, newPassword },
      requiresAuth: false,
    });
  }

  async logout(): Promise<void> {
    await storage.clear();
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async getProfile() {
    return this.request('/api/profile');
  }

  async updateProfile(data: unknown) {
    return this.request('/api/profile', { method: 'PUT', body: data });
  }

  async getUserProfile() {
    return this.request('/api/user-profile');
  }

  async updateUserProfile(data: unknown) {
    return this.request('/api/user-profile', { method: 'PUT', body: data });
  }

  async updateGoals(goals: unknown) {
    return this.request('/api/goals', { method: 'PUT', body: { goals } });
  }

  async getTeenProfile() {
    return this.getProfile();
  }

  async updateTeenProfile(data: unknown) {
    return this.updateProfile(data);
  }

  async updateTeenGoals(goals: unknown) {
    return this.updateGoals(goals);
  }

  async logMentalHealth(data: unknown) {
    return this.request('/api/mental-health', { method: 'POST', body: data });
  }

  async getMentalHealthLogs(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/api/mental-health${query}`);
  }

  async createCheckin(data: unknown) {
    return this.request('/api/checkin', { method: 'POST', body: data });
  }

  async logSleep(data: unknown) {
    return this.request('/api/sleep', { method: 'POST', body: data });
  }

  async logWorkout(data: unknown) {
    return this.request('/api/workout', { method: 'POST', body: data });
  }

  async logNutrition(data: unknown) {
    return this.request('/api/nutrition', { method: 'POST', body: data });
  }

  async getRecommendations(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request(`/api/recommendations${query}`);
  }

  async getMorningBrief(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request(`/api/morning-brief${query}`);
  }

  async completeAction(actionId: string, completed: boolean) {
    return this.request('/api/recommendations/actions/complete', {
      method: 'POST',
      body: { actionId, completed },
    });
  }

  async getScoliosisStatus() {
    return this.request('/api/scoliosis/status');
  }

  async enableScoliosisSupport() {
    return this.request('/api/scoliosis/enable', { method: 'POST' });
  }

  async getBraceSchedule() {
    return this.request('/api/brace-schedules');
  }

  async createBraceSchedule(data: unknown) {
    return this.request('/api/brace-schedules', { method: 'POST', body: data });
  }

  async updateBraceSchedule(id: string, data: unknown) {
    return this.request(`/api/brace-schedules/${id}`, { method: 'PUT', body: data });
  }

  async getBraceLogs(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request(`/api/brace-logs${query}`);
  }

  async getActiveBraceSession() {
    return this.request('/api/brace-logs/active');
  }

  async startBraceSession(notes?: string) {
    return this.request('/api/brace-logs/start', { method: 'POST', body: { notes } });
  }

  async endBraceSession(id: string, notes?: string) {
    return this.request(`/api/brace-logs/${id}/end`, { method: 'POST', body: { notes } });
  }

  async createBraceLog(data: unknown) {
    return this.request('/api/brace-logs', { method: 'POST', body: data });
  }

  async getPtExercises() {
    return this.request('/api/scoliosis/exercises');
  }

  async getPtRoutines() {
    return this.request('/api/pt-routines');
  }

  async createPtRoutine(data: unknown) {
    return this.request('/api/pt-routines', { method: 'POST', body: data });
  }

  async updatePtRoutine(id: string, data: unknown) {
    return this.request(`/api/pt-routines/${id}`, { method: 'PUT', body: data });
  }

  async getPtAdherence(routineId?: string, startDate?: string, endDate?: string) {
    if (routineId) {
      return this.request(`/api/pt-adherence/${routineId}`);
    }
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/api/pt-adherence${query}`);
  }

  async logPtAdherence(data: unknown) {
    return this.request('/api/pt-adherence', { method: 'POST', body: data });
  }

  async getSymptomLogs(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/api/scoliosis-symptoms${query}`);
  }

  async logSymptoms(data: unknown) {
    return this.request('/api/scoliosis-symptoms', { method: 'POST', body: data });
  }
}

export const api = new ApiService(API_URL);
