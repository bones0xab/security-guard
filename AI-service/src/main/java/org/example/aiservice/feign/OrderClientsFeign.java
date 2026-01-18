package org.example.aiservice.feign;


import org.example.aiservice.model.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Configuration
@FeignClient(name = "order-service", url = "http://order-service:8082")
public interface OrderClientsFeign {

    @GetMapping("/api/orders")
    List<OrderDTO> getAllOrders();

}
