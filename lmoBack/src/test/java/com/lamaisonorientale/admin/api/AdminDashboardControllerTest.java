package com.lamaisonorientale.admin.api;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.lamaisonorientale.admin.application.AdminDashboardService;
import com.lamaisonorientale.admin.dto.AdminDashboardDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DashboardChartsDto;
import com.lamaisonorientale.admin.dto.AdminDashboardDto.DashboardKpisDto;
import com.lamaisonorientale.security.JwtAuthenticationFilter;

@WebMvcTest(AdminDashboardController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminDashboardService adminDashboardService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void dashboard_ShouldReturnDashboard() throws Exception {
        LocalDate today = LocalDate.of(2026, 8, 18);
        when(adminDashboardService.getDashboard(7))
                .thenReturn(new AdminDashboardDto(
                        today,
                        false,
                        7,
                        new DashboardKpisDto(3, 8, 12, 1, 2, 15, 40, 5, 85, 120, 300, 2, 48.5, 10, 220.0),
                        new DashboardChartsDto(
                                List.of(), List.of(), List.of(), List.of(), List.of(),
                                List.of(), List.of(), List.of(), List.of(),
                                List.of(), List.of(), List.of(), List.of()),
                        List.of(),
                        List.of(),
                        List.of()));

        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days").value(7))
                .andExpect(jsonPath("$.kpis.reservationsToday").value(3))
                .andExpect(jsonPath("$.closedToday").value(false));

        verify(adminDashboardService).getDashboard(7);
    }
}
