package org.example.orderservice.service;

import jakarta.transaction.Transactional;
import org.example.orderservice.Model.ProductDTO;
import org.example.orderservice.entities.Order;
import org.example.orderservice.entities.OrderItems;
import org.example.orderservice.feign.ProductRestClients;
import org.example.orderservice.repo.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRestClients productRestClient;

    public OrderService(OrderRepository orderRepository, ProductRestClients productRestClient) {
        this.orderRepository = orderRepository;
        this.productRestClient = productRestClient;
    }

    // --- CREATE ---
    public Order createOrder(Order order, String customerId) {
        order.setCustomerId(customerId);
        order.setDate_commande(new Date());
        order.setStatut("CREATED");
        double totalCalculated = 0;

        if (order.getOrderItemsList() != null) {
            for (OrderItems item : order.getOrderItemsList()) {
                ProductDTO product = productRestClient.findProductById(item.getProductId());
                if (product.getQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Stock insuffisant: " + product.getName());
                }
                item.setPrice(product.getPrice());
                item.setOrder(order);
                totalCalculated += (product.getPrice() * item.getQuantity());
            }
        }
        order.setMontant_total(totalCalculated);
        return orderRepository.save(order);
    }

    // --- READ ---
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getMyOrders(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order Not Found"));
    }

    // --- UPDATE (Statut uniquement) ---
    public Order updateOrderStatus(Long id, String newStatus) {
        Order order = getOrderById(id);
        order.setStatut(newStatus);
        return orderRepository.save(order);
    }

    // --- DELETE ---
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}