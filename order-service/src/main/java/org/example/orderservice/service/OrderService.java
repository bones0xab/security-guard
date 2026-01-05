package org.example.orderservice.service;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.Model.ProductDTO;
import org.example.orderservice.entities.Order;
import org.example.orderservice.entities.OrderItems;
import org.example.orderservice.feign.ProductRestClients;
import org.example.orderservice.repo.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
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
    public Order updateOrder(Long id, Order updatedOrder) {
        Order order = getOrderById(id);

        // 1. Update simple fields
        order.setStatut(updatedOrder.getStatut());
        order.setMontant_total(updatedOrder.getMontant_total());
        order.setCustomerId(updatedOrder.getCustomerId());
        // Don't update date_commande usually, keep the original creation date

        // 2. CRITICAL: Handle the Items List Relation
        // If we just do setOrderItemsList, the new items won't know their parent ID.
        if (updatedOrder.getOrderItemsList() != null) {
            List<OrderItems> newItems = updatedOrder.getOrderItemsList();

            // Loop through and re-attach the parent Order
            for (OrderItems item : newItems) {
                item.setOrder(order); // <--- MANDATORY FOR JPA
            }

            // Now it's safe to replace the list
            // (Assuming you have orphanRemoval=true in Entity, this deletes old items removed from the list)
            order.getOrderItemsList().clear();
            order.getOrderItemsList().addAll(newItems);
        }

        log.info("Order ID: {} updated successfully", id);
        return orderRepository.save(order);
    }

    // --- DELETE ---
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
        log.info("Order Deleted Successfully");
    }

    public List<Order> getMyOrder(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }
}