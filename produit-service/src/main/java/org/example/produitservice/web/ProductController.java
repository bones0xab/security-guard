package org.example.produitservice.web;


import org.example.produitservice.entitie.Product;
import org.example.produitservice.service.ProductService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // 1. Add Product -> ADMIN Only [cite: 27]
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    // 2. Modify Product -> ADMIN Only [cite: 28]
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    // 3. Delete Product -> ADMIN Only [cite: 29]
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    // 4. List Products -> ADMIN and CLIENT [cite: 30]
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // 5. Get One Product -> ADMIN and CLIENT [cite: 31]
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
}
