export type UserRole = 'ADMIN' | 'CLIENT';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: number;
    productId: number;
    quantity: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    roles: UserRole[];
}
