package org.example.aiservice;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Slf4j
public class AiasController {

    private final AiasService aiasService;

    public AiasController(AiasService aiasService) {
        this.aiasService = aiasService;
    }

    @PostMapping("/sync-data")
    public ResponseEntity<String> syncData() {
        log.info("Manual data sync triggered.");
        aiasService.init(); // Ensure your method in Service is named loadData() not init()
        return ResponseEntity.ok("Data synchronization started successfully.");
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chatWithAi(@RequestParam String querytext, HttpServletRequest request) {
        log.info("Received chat request with query : {}", querytext);
        return ResponseEntity.ok(aiasService.ragQuery(querytext));
    }
}
