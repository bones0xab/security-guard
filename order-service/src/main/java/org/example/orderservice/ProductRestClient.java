package org.example.orderservice;


import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "produit-service", url = "${PRODUCT_URI:http://localhost:8081}")
public interface ProductRestClient {
}
