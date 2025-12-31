package org.example.orderservice.repo;

import org.example.orderservice.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {
    List<Order> findByCustomerId(String customerId);
}
