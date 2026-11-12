package com.lamaisonorientale.user.api;

import static com.lamaisonorientale.support.TestUserSupport.adminUser;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.lamaisonorientale.common.exception.GlobalExceptionHandler;
import com.lamaisonorientale.security.dto.JwtAuthenticationResponse;
import com.lamaisonorientale.user.application.StaffProfileService;
import com.lamaisonorientale.user.domain.Utilisateur;
import com.lamaisonorientale.user.dto.ChangePasswordRequest;
import com.lamaisonorientale.user.dto.StaffProfileDto;
import com.lamaisonorientale.user.dto.UpdateProfileRequest;

@ExtendWith(MockitoExtension.class)
class AdminMeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StaffProfileService staffProfileService;

    @InjectMocks
    private AdminMeController adminMeController;

    private Utilisateur currentUser;

    @BeforeEach
    void setUp() {
        currentUser = adminUser();
        HandlerMethodArgumentResolver principalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class)
                        && Utilisateur.class.isAssignableFrom(parameter.getParameterType());
            }

            @Override
            public Object resolveArgument(
                    MethodParameter parameter,
                    ModelAndViewContainer mavContainer,
                    NativeWebRequest webRequest,
                    WebDataBinderFactory binderFactory) {
                return currentUser;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(adminMeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(principalResolver)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void me_ShouldReturnStaffProfile() throws Exception {
        when(staffProfileService.getProfile(currentUser))
                .thenReturn(new StaffProfileDto(
                        1L,
                        "Admin",
                        "admin@test.local",
                        "ADMIN",
                        true,
                        Instant.parse("2026-01-01T00:00:00Z")));

        mockMvc.perform(get("/api/admin/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@test.local"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void updateProfile_ShouldReturnNewToken() throws Exception {
        when(staffProfileService.updateProfile(eq(currentUser), any(UpdateProfileRequest.class)))
                .thenReturn(JwtAuthenticationResponse.builder()
                        .token("new-token")
                        .role("ADMIN")
                        .userId(1L)
                        .nom("Admin Updated")
                        .email("admin-updated@test.local")
                        .build());

        mockMvc.perform(
                        put("/api/admin/me")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "nom": "Admin Updated",
                                          "email": "admin-updated@test.local"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-token"))
                .andExpect(jsonPath("$.email").value("admin-updated@test.local"));
    }

    @Test
    void changePassword_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(
                        put("/api/admin/me/password")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "currentPassword": "oldpassword123",
                                          "newPassword": "newpassword123"
                                        }
                                        """))
                .andExpect(status().isNoContent());

        verify(staffProfileService)
                .changePassword(
                        eq(currentUser), eq(new ChangePasswordRequest("oldpassword123", "newpassword123")));
    }
}
