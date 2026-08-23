const BASE_URL = 'http://localhost:3333';

const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
};

export interface ApiResponse<T = any> {
    data: T;
    status: number;
}

export class ApiError extends Error {
    response?: { data: any; status: number };

    constructor(message: string, response?: { data: any; status: number }) {
        super(message);
        this.name = 'ApiError';
        this.response = response;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

async function request<T = any>(method: string, url: string, body?: any): Promise<ApiResponse<T>> {
    let res: Response;

    try {
        res = await fetch(`${BASE_URL}${url}`, {
            method,
            headers: { ...defaultHeaders },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (err) {
        throw new ApiError(`Falha de rede ao acessar ${url}`, undefined);
    }

    const text = await res.text();
    let data: any = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!res.ok) {
        throw new ApiError(`HTTP ${res.status} ao acessar ${url}`, { data, status: res.status });
    }

    return { data, status: res.status };
}

export const api = {
    defaults: { headers: defaultHeaders },

    get<T = any>(url: string): Promise<ApiResponse<T>> {
        return request<T>('GET', url);
    },

    post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
        return request<T>('POST', url, body);
    },

    put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
        return request<T>('PUT', url, body);
    },

    delete<T = any>(url: string): Promise<ApiResponse<T>> {
        return request<T>('DELETE', url);
    },
};
