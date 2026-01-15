package org.example.orderservice.entities;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Getter
@Setter
@Builder
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long orderId;
    private Long clientId;
    private String reason;
    private Status status;
}
