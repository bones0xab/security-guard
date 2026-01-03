package org.example.orderservice.feign;

import org.example.orderservice.Model.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "produit-service", url = "http://product-service:8081")
public interface ProductRestClients {

    @GetMapping("/api/products/{id}")
    ProductDTO findProductById(@PathVariable("id") Long id);

}
