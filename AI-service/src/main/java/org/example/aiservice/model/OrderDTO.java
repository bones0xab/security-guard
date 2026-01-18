package org.example.aiservice.model;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderDTO {
    private Long orderId;
    private LocalDateTime orderDate;
    private String status;
    private double totalAmount;
    private String customerId;
    private List<OrderItemDTO> items;


    // getters / setters
}
