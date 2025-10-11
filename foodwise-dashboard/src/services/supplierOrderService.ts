// Supplier Order Service API
// This service handles all supplier order related API calls

export interface Supplier {
    id: string;
    name: string;
    category: string;
    contact: {
        phone: string;
        email: string;
        address: string;
    };
    rating: number;
    deliveryTime: string;
    minOrder: number;
    paymentTerms: string;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalPrice: number;
}

export interface SupplierOrderType {
    id: string;
    orderNumber: string;
    supplier: Supplier;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
    orderDate: string;
    expectedDelivery: string;
    orderedBy: string;
    orderMethod: 'voice-assistant' | 'manual';
    approvedBy?: string;
    approvalDate?: string;
    notes?: string;
}

export interface CreateOrderRequest {
    supplierId: string;
    items: {
        name: string;
        quantity: number;
        unit: string;
        pricePerUnit: number;
    }[];
    orderedBy: string;
    notes?: string;
}

export interface UpdateOrderStatusRequest {
    orderId: string;
    status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
    notes?: string;
}

// Mock API base URL - replace with actual endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-endpoint.com/api';
const BACKEND_BASE_URL = "http://localhost:4000";

class SupplierOrderService {
    
    // Fetch orders from DynamoDB order-stock table
    async fetchOrderStockData(): Promise<SupplierOrderType[]> {
        try {
            console.log("🔗 Fetching order stock data from DynamoDB...");
            
            const response = await fetch(`${BACKEND_BASE_URL}/api/order-stock`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            console.log("📡 Order stock response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch order stock data: ${response.status}`);
            }
            
            const rawData = await response.json();
            console.log("📦 Raw order stock data:", rawData);
            
            // Transform raw DynamoDB data to match SupplierOrderType interface
            const transformedData: SupplierOrderType[] = rawData.map((order: any) => {
                console.log("🔧 Transforming order:", order);
                
                // Generate order number using VA + first 8 characters of order_id
                const orderNumber = `VA${order.id.substring(0, 8)}`;
                console.log(`📋 Generated order number: ${orderNumber} from order_id: ${order.id}`);
                
                // The API already returns the correct format, just use it directly
                return {
                    id: order.id,
                    orderNumber: orderNumber, // Use VA + first 8 chars of order_id
                    supplier: order.supplier, // Use backend supplier data
                    items: order.items, // Items are already in correct format from API
                    totalAmount: order.totalAmount,
                    status: order.status,
                    orderDate: order.orderDate,
                    expectedDelivery: order.expectedDelivery,
                    orderedBy: order.orderedBy, // Use backend value (Voice Assistant)
                    orderMethod: order.orderMethod, // Use backend value (voice-assistant)
                    approvedBy: order.approvedBy,
                    approvalDate: order.approvalDate,
                    notes: order.notes
                };
            });
            
            console.log("✅ Transformed order stock data:", transformedData);
            return transformedData;
            
        } catch (error) {
            console.error("❌ Error fetching order stock data:", error);
            return [];
        }
    }
    
    // Update order status in DynamoDB
    async updateOrderStatus(orderId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', approvedBy: string): Promise<boolean> {
        try {
            console.log(`🔄 Updating order ${orderId} status to ${status} by ${approvedBy}`);
            console.log(`📡 API URL: ${BACKEND_BASE_URL}/api/order-stock/${orderId}/status`);
            
            const requestBody = {
                status: status,
                approvedBy: approvedBy
            };
            console.log(`📦 Request body:`, requestBody);
            
            const response = await fetch(`${BACKEND_BASE_URL}/api/order-stock/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log("📡 Update order status response status:", response.status);
            console.log("📡 Response headers:", response.headers);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error Response:`, errorText);
                throw new Error(`Failed to update order status: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log("✅ Order status updated successfully:", result);
            
            return true;
            
        } catch (error) {
            console.error("❌ Error updating order status:", error);
            console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
            return false;
        }
    }
    
    // Get all suppliers
    async getSuppliers(): Promise<Supplier[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error;
        }
    }

    // Get suppliers by category
    async getSuppliersByCategory(category: string): Promise<Supplier[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers?category=${encodeURIComponent(category)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching suppliers by category:', error);
            throw error;
        }
    }

    // Get all orders
    async getOrders(): Promise<SupplierOrderType[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/supplier-orders`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    // Get orders by status
    async getOrdersByStatus(status: string): Promise<SupplierOrderType[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/supplier-orders?status=${status}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders by status:', error);
            throw error;
        }
    }

    // Get order by ID
    async getOrderById(orderId: string): Promise<SupplierOrderType> {
        try {
            const response = await fetch(`${API_BASE_URL}/supplier-orders/${orderId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    }

    // Create new order
    async createOrder(orderData: CreateOrderRequest): Promise<SupplierOrderType> {
        try {
            const response = await fetch(`${API_BASE_URL}/supplier-orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Cancel order
    async cancelOrder(orderId: string, reason?: string): Promise<SupplierOrderType> {
        try {
            const response = await fetch(`${API_BASE_URL}/supplier-orders/${orderId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    // Get supplier details
    async getSupplierById(supplierId: string): Promise<Supplier> {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching supplier:', error);
            throw error;
        }
    }

    // Add new supplier
    async addSupplier(supplierData: Omit<Supplier, 'id'>): Promise<Supplier> {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding supplier:', error);
            throw error;
        }
    }

    // Update supplier
    async updateSupplier(supplierId: string, supplierData: Partial<Supplier>): Promise<Supplier> {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    }

    // Delete supplier
    async deleteSupplier(supplierId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    }

    // Get order statistics
    async getOrderStatistics(): Promise<{
        totalOrders: number;
        pendingOrders: number;
        confirmedOrders: number;
        inTransitOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        totalAmount: number;
        averageOrderValue: number;
    }> {
        try {
            const response = await fetch(`${API_BASE_URL}/supplier-orders/statistics`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching order statistics:', error);
            throw error;
        }
    }
}

export const supplierOrderService = new SupplierOrderService();
export default supplierOrderService;