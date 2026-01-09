package org.example.produitservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disable context test for Sonar/CI, requires real DB ms-postgres")
class ProduitServiceApplicationTests {

    @Test
    @Disabled
    void contextLoads() {
    }

}
