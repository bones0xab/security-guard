package org.example.orderservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disable context test for Sonar/CI, requires real DB ms-postgres")
class OrderServiceApplicationTests {

    @Test
    @Disabled
    void contextLoads() {
    }

}
