package org.example.orderservice.entities;


import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "orders")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Order {
    @Id
    private long orderId;
    private Date date_commande;
    private String statut;
    private double montant_total;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItems> orderItemsList;

}
