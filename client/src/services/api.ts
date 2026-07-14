const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5199/api').replace(/\/$/, '');

interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
}

async function request<T>(path: string, method: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    throw new Error('Unauthorized');
  }

  if (response.status === 403) {
    throw new Error('Forbidden');
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) => 
    request<T>(path, 'GET', { headers }),
    
  post: <T>(path: string, body: any, headers?: Record<string, string>) => 
    request<T>(path, 'POST', { body, headers }),
    
  put: <T>(path: string, body: any, headers?: Record<string, string>) => 
    request<T>(path, 'PUT', { body, headers }),
    
  delete: <T>(path: string, headers?: Record<string, string>) => 
    request<T>(path, 'DELETE', { headers }),
};
