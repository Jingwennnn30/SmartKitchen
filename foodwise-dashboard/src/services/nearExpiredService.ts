// API service for fetching near expired items from AWS Lambda
const API_URL = 'https://uuk7xc4i34.execute-api.us-east-1.amazonaws.com/dev/expired';

export interface NearExpiredItem {
    item_id: number;
    item_name: string;
    quantity: string;
    expiry_date: string;
    unit: string;
    storage_location: string;
    supplier: string;
    unit_price: number;
    total_stock: number;
}

export interface NearExpiredResponse {
    near_expired_items: NearExpiredItem[];
    count: number;
    scan_date: string;
}

export class NearExpiredService {
    static async getNearExpiredItems(): Promise<{ items: NearExpiredItem[], scanDate: string }> {
        try {
            console.log('Fetching near expired items from:', API_URL);
            
            const response = await fetch(API_URL);

            console.log('Near Expired API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Near Expired API error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data: NearExpiredResponse = await response.json();
            console.log('Received near expired data:', data);
            
            return {
                items: data.near_expired_items || [],
                scanDate: data.scan_date || new Date().toISOString().split('T')[0]
            };
        } catch (error) {
            console.error('Error fetching near expired items:', error);
            
            // Check if it's a network/CORS error
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This looks like a CORS error. Check your near expired API Gateway CORS settings.');
                throw new Error('CORS error: Unable to fetch near expired data from API. Please check API Gateway CORS configuration.');
            }
            
            throw error;
        }
    }

    // Helper function to format expiry date for display
    static formatExpiryDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    // Helper function to format scan date for display
    static formatScanDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    // Helper function to calculate days until expiry
    static getDaysUntilExpiry(expiryDate: string): number {
        try {
            const expiry = new Date(expiryDate);
            const today = new Date();
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch {
            return 0;
        }
    }

    // Helper function to get urgency level
    static getUrgencyLevel(expiryDate: string): 'high' | 'medium' | 'low' {
        const days = this.getDaysUntilExpiry(expiryDate);
        if (days <= 1) return 'high';
        if (days <= 3) return 'medium';
        return 'low';
    }
}