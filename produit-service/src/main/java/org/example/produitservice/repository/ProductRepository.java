package org.example.produitservice.repository;

import org.example.produitservice.entitie.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

public interface ProductRepository extends JpaRepository<Product,Long> {
}
