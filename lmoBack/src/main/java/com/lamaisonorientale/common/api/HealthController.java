package com.lamaisonorientale.common.api;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "UP",
                "application", "La Maison Orientale API"
        );
    }

    @GetMapping("/health/db")
    public Map<String, Object> databaseHealth() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("database", "connected");
        body.put("host", "localhost");
        body.put("port", 5433);

        Integer categories = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM categorie", Integer.class);
        Integer tables = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
                Integer.class);

        body.put("tablesCount", tables);
        body.put("categorieCount", categories);
        body.put("message", "Connexion PostgreSQL OK");
        return body;
    }
}
