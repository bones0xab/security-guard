package org.example.produitservice.service;

import org.example.produitservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductAssistantService {
    private ProductRepository productRepository;

    public ProductAssistantService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }




    //how much products are available in stock?

}
