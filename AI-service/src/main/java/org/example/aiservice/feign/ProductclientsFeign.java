package org.example.aiservice.feign;


import org.example.aiservice.model.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Configuration
@FeignClient(name = "product-service", url = "http://product-service:8081")
public interface ProductclientsFeign {

    @GetMapping("/api/products")
    List<ProductDTO> getAllProducts();

}
