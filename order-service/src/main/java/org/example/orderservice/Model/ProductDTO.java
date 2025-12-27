package org.example.orderservice.Model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient
@Getter
@Setter
public class ProductDTO {
    private Long id;
    private String name;
    private double price;
    private int quantity;
}