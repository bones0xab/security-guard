package org.example.produitservice.service;


import jakarta.transaction.Transactional;
import jakarta.websocket.server.ServerEndpoint;
import lombok.Setter;
import org.example.produitservice.entitie.Product;
import org.example.produitservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Req: Add a product [cite: 27]
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // Req: Modify a product [cite: 28]
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setQuantity(updatedProduct.getQuantity());

        return productRepository.save(existingProduct);
    }

    // Req: Delete a product [cite: 29]
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Req: List products [cite: 30]
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Req: Consult a product by ID [cite: 31]
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
