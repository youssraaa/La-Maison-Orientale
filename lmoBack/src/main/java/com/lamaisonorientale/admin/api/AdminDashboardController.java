package com.lamaisonorientale.admin.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lamaisonorientale.admin.application.AdminDashboardService;
import com.lamaisonorientale.admin.dto.AdminDashboardDto;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardDto dashboard() {
        return adminDashboardService.getDashboard();
    }
}
