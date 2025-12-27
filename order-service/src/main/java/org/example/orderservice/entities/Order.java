package org.example.orderservice.entities;


import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
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
    @OneToMany(cascade = CascadeType.ALL)
    private List<Product> produits_commandes;

• liste des produits commandés (idProduit, quantité, prix)
}
