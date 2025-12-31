package org.example.orderservice.web;

import org.example.orderservice.entities.Order;
import org.example.orderservice.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 1. CREATE (CLIENT)
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public Order createOrder(@RequestBody Order order, Authentication auth) {
        String customerId = getTokenClaim(auth, "preferred_username");
        return orderService.createOrder(order, customerId);
    }

    // 2. READ ALL (ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // 3. READ MINE (CLIENT)
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CLIENT')")
    public List<Order> getMyOrders(Authentication auth) {
        String customerId = getTokenClaim(auth, "preferred_username");
        return orderService.getMyOrders(customerId);
    }

    // 4. READ ONE (ADMIN OR CLIENT)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    // 5. UPDATE STATUS (ADMIN)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateOrderStatus(id, status);
    }

    // 6. DELETE (ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    // Helper method
    private String getTokenClaim(Authentication auth, String claim) {
        return ((JwtAuthenticationToken) auth).getToken().getClaimAsString(claim);
    }
}