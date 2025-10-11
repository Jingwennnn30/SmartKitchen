export interface MenuItem {
    dishName: string;
    price: number;
    category?: string;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface Order {
    orderId?: string;
    items: CartItem[];
    totalPrice: number;
    createdAt?: string;
    completeAt?: string;
}