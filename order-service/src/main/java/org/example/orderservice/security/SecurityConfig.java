package org.example.orderservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Mandatory for @PreAuthorize to work
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for microservices
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS
                .authorizeHttpRequests(auth -> auth
                        // Publicly accessible endpoints (Swagger)
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                // Use Keycloak as the Resource Server
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(jwtDecoder()))
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // URL de votre realm Keycloak
        String jwkSetUri = "http://localhost:9090/realms/mini-project/protocol/openid-connect/certs";

        return NimbusJwtDecoder
                .withJwkSetUri(jwkSetUri)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); // Your React URL
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


//    // This method tells Spring how to read "realm_access.roles" from Keycloak
//    @Bean
//    public JwtAuthenticationConverter jwtAuthConverter() {
//        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
//        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
//
//            // 1. Standard scopes (optional)
//            var defaultConverter = new JwtGrantedAuthoritiesConverter();
//            Collection<GrantedAuthority> authorities = defaultConverter.convert(jwt);
//
//            // 2. Extract Keycloak REALM ROLES
//            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
//            if (realmAccess != null && realmAccess.containsKey("roles")) {
//                List<String> roles = (List<String>) realmAccess.get("roles");
//
//                // Convert ["ADMIN"] to ["ROLE_ADMIN"]
//                authorities.addAll(roles.stream()
//                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
//                        .collect(Collectors.toList()));
//            }
//            return authorities;
//        });
//        return converter;
//    }
}
