package com.lamaisonorientale;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class LmoBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(LmoBackApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        System.out.println();
        System.out.println("=".repeat(60));
        System.out.println(" API La Maison Orientale prete !");
        System.out.println(" http://localhost:8080/api/health");
        System.out.println(" http://localhost:8080/api/health/db");
        System.out.println("=".repeat(60));
        System.out.println();
    }
}
