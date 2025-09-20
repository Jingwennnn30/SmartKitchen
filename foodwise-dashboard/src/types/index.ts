export interface InventoryItem {
    item: string;
    quantity: string | number;
    expiryDate: string;
    status: 'Good' | 'Expired' | 'Running Soon';
    location: string;
}

export interface KPIData {
    totalStockValue: number;
    expiringItems: number;
    averageWaitingTime: string;
    wasteThisWeek: string;
}

export interface ChartData {
    date: string;
    stock: number;
    usage: number;
}

export interface BusinessHourData {
    hour: string;
    sales: number;
}

export interface FoodWasteData {
    category: string;
    percentage: number;
    color: string;
}

export interface RestockPrediction {
    item: string;
    predictedDate: string;
    quantity: number;
}

export interface SidebarItem {
    title: string;
    icon: React.ReactNode;
    path: string;
}