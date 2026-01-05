export type UserRole = 'ADMIN' | 'CLIENT';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

export interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    date_commande: string; // Date ISO venant de Java
    statut: string; // CREATED, PENDING, DELIVERED, CANCELED
    montant_total: number;
    customerId: string;
    orderItemsList: OrderItem[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    roles: UserRole[];
}
