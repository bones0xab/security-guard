package org.example.orderservice.web;

import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.entities.Order;
import org.example.orderservice.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 1. CREATE (CLIENT)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public Order createOrder(@RequestBody Order order, Authentication auth) {
        String customerId = getTokenClaim(auth, "preferred_username");
        return orderService.createOrder(order, customerId);
    }

    // 2. READ ALL (ADMIN)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // 3. READ MINE (CLIENT)
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CLIENT')")
    public List<Order> getMyOrders(Authentication auth) {
        String customerId = getTokenClaim(auth, "preferred_username");
        return orderService.getMyOrder(customerId);
    }

    // 4. READ ONE (ADMIN OR CLIENT)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    // 5. UPDATE STATUS (ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public Order updateStatus(@PathVariable Long id, @RequestBody Order order) {
        log.info("Updating order ID: {} with : {}", id, order.getStatut());
        return orderService.updateOrder(id, order);
    }

    // 6. DELETE (ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    // Helper method
    private String getTokenClaim(Authentication auth, String claim) {
        return ((JwtAuthenticationToken) auth).getToken().getClaimAsString(claim);
    }
}