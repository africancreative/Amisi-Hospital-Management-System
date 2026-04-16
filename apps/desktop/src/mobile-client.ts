/**
 * Multi-Device Mobile API Client
 * Use this in mobile apps to connect to Local Node
 */

const API_BASE = process.env.LOCAL_NODE_URL || 'http://localhost:8080';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    status: number;
}

class LocalNodeClient {
    private baseUrl: string;
    private apiKey: string | null;

    constructor(baseUrl?: string, apiKey?: string) {
        this.baseUrl = baseUrl || API_BASE;
        this.apiKey = apiKey || null;
    }

    private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            const data = await response.json();
            
            if (!response.ok) {
                const errorData = data as Record<string, unknown>;
                const errorMsg = typeof errorData.error === 'string' ? errorData.error : 'Request failed';
                return { error: errorMsg, status: response.status };
            }

            return { data: data as T, status: response.status };
        } catch (error) {
            return { error: String(error), status: 0 };
        }
    }

    // Health & Status
    async getHealth() {
        return this.request('/api/health');
    }

    async getNodeInfo() {
        return this.request('/api/node-info');
    }

    async getOfflineStatus() {
        return this.request('/api/offline/status');
    }

    // Patients
    async getPatients() {
        return this.request('/api/patients');
    }

    async getPatient(id: string) {
        return this.request(`/api/patients/${id}`);
    }

    async createPatient(patient: any) {
        return this.request('/api/patients', { method: 'POST', body: patient });
    }

    // Employees
    async getEmployees() {
        return this.request('/api/employees');
    }

    async getEmployee(id: string) {
        return this.request(`/api/employees/${id}`);
    }

    // Inventory
    async getInventory() {
        return this.request('/api/inventory');
    }

    async getInventoryAlerts() {
        return this.request('/api/inventory/alerts');
    }

    // Chat
    async getConversations() {
        return this.request('/api/chat/conversations');
    }

    async getMessages(groupId: string) {
        return this.request(`/api/chat/messages/${groupId}`);
    }

    // Invoices
    async getInvoices() {
        return this.request('/api/invoices');
    }

    // Audit
    async getAuditLogs() {
        return this.request('/api/audit');
    }
}

export const localNode = new LocalNodeClient();
export default LocalNodeClient;