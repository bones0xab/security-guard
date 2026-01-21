package org.example.aiservice;

import lombok.extern.slf4j.Slf4j;
import org.example.aiservice.feign.OrderClientsFeign;
import org.example.aiservice.feign.ProductclientsFeign;
import org.example.aiservice.model.OrderDTO;
import org.example.aiservice.model.ProductDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AiasService {
    private final ChatClient chatClient;
    private  EmbeddingModel embeddingModel;
    private  VectorStore vectorStore;
    private final ProductclientsFeign productclientsFeign;
    private final OrderClientsFeign orderClientsFeign;


    public AiasService(ChatClient.Builder chatClientbuilder, ProductclientsFeign productclientsFeign, OrderClientsFeign orderClientsFeign, EmbeddingModel embeddingModel, VectorStore vectorStore) {
        this.chatClient = chatClientbuilder.build();
        this.embeddingModel = embeddingModel;
        this.vectorStore = vectorStore;
        this.productclientsFeign = productclientsFeign;
        this.orderClientsFeign = orderClientsFeign;
    }

    private volatile boolean isDataLoaded = false;
    public void ensureDataLoaded() {
        if (!isDataLoaded) { // First check (no locking, fast)
            synchronized (this) {
                if (!isDataLoaded) init();
            }
        }
    }


    @Tool(description = "Recuperation d'une order")
    public String getOrderById(Long id) {
        OrderDTO order = orderClientsFeign.getOrderById(id);
        if (order == null) return "Aucune commande avec cet ID.";
        int itemcount = order.getItems() != null ? order.getItems().size() : 0;

        return "Commande #" + order.getOrderId() + ": " + itemcount + " articles, total €" + order.getTotalAmount();
    }

    public void init() {
        // Wrap in try-catch to handle errors without crashing the chat
        try {
            log.info("AI indexing started. ");
            List<Document> docs = new ArrayList<>();

            List<OrderDTO> orders = orderClientsFeign.getAllOrders();
            for (OrderDTO o : orders) {
                int itemCount = o.getItems() != null ? o.getItems().size() : 0;
                Document doc = new Document(
                        "Commande #" + o.getOrderId() + ": " + itemCount + " articles, total €" + o.getTotalAmount(),
                        Map.of("domain", "order", "orderId", o.getOrderId())
                );
                docs.add(doc);
            }

            List<ProductDTO> products = productclientsFeign.getAllProducts();
            for (ProductDTO p : products) {
                Document doc = new Document(
                        "Produit: " + p.getName() + " - Prix: €" + p.getPrice() + " - Stock: " + p.getQuantity(),
                        Map.of("domain", "product", "productId", p.getId())
                );
                docs.add(doc);
            }

            if (!docs.isEmpty()) {
                vectorStore.add(docs);
                log.info("Indexed {} business documents", docs.size());

                // 👇 CRITICAL FIX: Mark data as loaded!
                isDataLoaded = true;
            }

        } catch (Exception e) {
            // Log error but don't set isDataLoaded=true, so it tries again next time
            log.error("Failed to sync data (will retry next request): {}", e.getMessage());
        }
    }


    public String ragQuery(String query) {
        try {
            ensureDataLoaded();
            // 1. Embed query → cherche similaires
            List<Document> relevantDocs = vectorStore.similaritySearch(query); // Simple string !
            // 2. Contexte (top 3)
            String context = relevantDocs.stream()
                    .limit(3)
                    .map(Document::getText)  // .text() ou .getContent()
                    .collect(Collectors.joining("\n\n"));

            log.info("Found {} docs for '{}'", relevantDocs.size(), query);

            // 3. Chat avec contexte
            return chatClient.prompt()
                    .system("""
                    Réponds en FRANÇAIS avec ces données EXACTES :
                    
                    CONTESTE ===
                    %s
                    ===
                    
                    - Si pas pertinent : "Je ne trouve pas d'info précise."
                    - Sois concis (3 phrases max).
                    """.formatted(context.isBlank() ? "Aucune donnée" : context))
                    .user(query)
                    .tools(AiasService.class)
                    .call()
                    .content();

        } catch (Exception e) {
            log.error("RAG error", e);
            return chatClient.prompt()
                    .system("Pas de contexte disponible.")
                    .user(query)
                    .call()
                    .content();
        }
}


//    public String aiasResponse(String querytext) {
//        log.info("Sending query to AI service: {}", querytext);
//
//        return chatClient.prompt()
//                .system("""
//                        You are an AI assistant for a web application.
//                        - Always answer in French.
//                        - Be concise (max 5 sentences).
//                        - If the question is about code, provide clear examples.
//                        - If you don't know, say you don't know.
//                        """)
//                .user(querytext).call().content();
//    }

}
