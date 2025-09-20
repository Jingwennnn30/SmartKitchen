// Mock donation service for frontend display
export interface DonationItem {
    item_id: number;
    item_name: string;
    donation_partner: string;
    donation_date: string;
    donation_quantity: number;
    donation_status: string;
    expiry_date: string;
    unit: string;
    storage_location: string;
    supplier: string;
    unit_price: number;
    stockquantity: number;
    past_wasted: number;
    waste_reason: string;
}

export interface PartnerAnalytics {
    partner: string;
    total_donations: number;
    successful_donations: number;
    pending_donations: number;
    failed_donations: number;
    success_rate: number;
}

export interface DonationResponse {
    donation_partners: string[];
    donation_items: DonationItem[];
    partner_analytics: PartnerAnalytics[];
    summary_stats: {
        total_partners: number;
        total_donated_items: number;
        total_wasted_kg: number;
        total_donation_records: number;
    };
    scan_date: string;
}

export interface SelectedItem {
    item_name: string;
    quantity: string;
    expiry_date: string;
    unit: string;
    donation_partner?: string;
    notified?: boolean;
}

export class DonationService {
    // Mock donation data for frontend display
    static async getDonationData(): Promise<DonationResponse> {
        try {
            console.log('Using mock donation data for frontend display');
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const mockData: DonationResponse = {
                donation_partners: [
                    'ZeroWaste Org',
                    'Community Pantry',
                    'Food Bank KL',
                    'Charity Foundation',
                    'Green Earth Initiative',
                    'Local Food Network'
                ],
                donation_items: [
                    {
                        item_id: 1091,
                        item_name: 'Yeast',
                        donation_partner: 'ZeroWaste Org',
                        donation_date: '2025-09-15',
                        donation_quantity: 18,
                        donation_status: 'Pending Approval',
                        expiry_date: '2025-09-15',
                        unit: 'g',
                        storage_location: 'Cold Storage',
                        supplier: 'Knife Cooking Oil',
                        unit_price: 31.63,
                        stockquantity: 46,
                        past_wasted: 46,
                        waste_reason: 'Expired'
                    },
                    {
                        item_id: 1073,
                        item_name: 'Tofu',
                        donation_partner: 'Community Pantry',
                        donation_date: '2025-09-05',
                        donation_quantity: 1,
                        donation_status: 'Completed',
                        expiry_date: '2025-09-05',
                        unit: 'ml',
                        storage_location: 'Shelf B',
                        supplier: 'Lee Kum Kee',
                        unit_price: 46.89,
                        stockquantity: 391,
                        past_wasted: 0,
                        waste_reason: ''
                    }
                ],
                partner_analytics: [
                    {
                        partner: 'Community Pantry',
                        total_donations: 8,
                        successful_donations: 7,
                        pending_donations: 1,
                        failed_donations: 0,
                        success_rate: 87.5
                    },
                    {
                        partner: 'Charity Foundation',
                        total_donations: 6,
                        successful_donations: 5,
                        pending_donations: 1,
                        failed_donations: 0,
                        success_rate: 83.3
                    },
                    {
                        partner: 'ZeroWaste Org',
                        total_donations: 15,
                        successful_donations: 12,
                        pending_donations: 2,
                        failed_donations: 1,
                        success_rate: 80.0
                    },
                    {
                        partner: 'Food Bank KL',
                        total_donations: 12,
                        successful_donations: 9,
                        pending_donations: 2,
                        failed_donations: 1,
                        success_rate: 75.0
                    },
                    {
                        partner: 'Green Earth Initiative',
                        total_donations: 10,
                        successful_donations: 7,
                        pending_donations: 2,
                        failed_donations: 1,
                        success_rate: 70.0
                    },
                    {
                        partner: 'Local Food Network',
                        total_donations: 5,
                        successful_donations: 3,
                        pending_donations: 1,
                        failed_donations: 1,
                        success_rate: 60.0
                    }
                ],
                summary_stats: {
                    total_partners: 6,
                    total_donated_items: 42,
                    total_wasted_kg: 185,
                    total_donation_records: 56
                },
                scan_date: new Date().toISOString().split('T')[0]
            };
            
            return mockData;
        } catch (error) {
            console.error('Error with mock donation data:', error);
            throw error;
        }
    }

    // Mock notification service (replace with actual email service integration)
    static async notifyPartner(itemName: string, partnerName: string): Promise<boolean> {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log(`Sending notification to ${partnerName} about ${itemName}`);
            
            // Here you would integrate with actual email service like:
            // - AWS SES
            // - SendGrid
            // - Nodemailer
            // For now, we'll just return success
            
            return true;
        } catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    }

    // Helper function to format dates
    static formatDate(dateString: string): string {
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

    // Helper function to get status color
    static getStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'successful':
                return '#4caf50'; // Green
            case 'pending approval':
            case 'pending':
                return '#ff9800'; // Orange
            case 'failed':
            case 'cancelled':
                return '#f44336'; // Red
            default:
                return '#9e9e9e'; // Gray
        }
    }

    // Helper function to calculate days until expiry
    static getDaysUntilExpiry(expiryDate: string): number {
        try {
            const expiry = new Date(expiryDate);
            const today = new Date();
            const diffTime = expiry.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch {
            return 0;
        }
    }

    // Helper function to get urgency level
    static getUrgencyLevel(daysUntilExpiry: number): 'high' | 'medium' | 'low' {
        if (daysUntilExpiry <= 7) return 'high';
        if (daysUntilExpiry <= 14) return 'medium';
        return 'low';
    }
}