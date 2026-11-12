package com.lamaisonorientale.notification.api;

import static com.lamaisonorientale.support.TestUserSupport.adminUser;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

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
import com.lamaisonorientale.notification.application.NotificationService;
import com.lamaisonorientale.notification.dto.NotificationDto;
import com.lamaisonorientale.user.domain.Utilisateur;

@ExtendWith(MockitoExtension.class)
class AdminNotificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminNotificationController adminNotificationController;

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

        mockMvc = MockMvcBuilders.standaloneSetup(adminNotificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(principalResolver)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    private static NotificationDto sampleNotification(boolean lue) {
        return new NotificationDto(
                10L,
                "NOUVEAU_MESSAGE",
                "Nouveau message contact",
                "Dupont · Renseignements",
                "/admin/messages",
                lue,
                Instant.parse("2026-08-01T10:00:00Z"));
    }

    @Test
    void list_ShouldReturnNotificationsForAuthenticatedUser() throws Exception {
        when(notificationService.listForUser(1L)).thenReturn(List.of(sampleNotification(false)));

        mockMvc.perform(get("/api/admin/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titre").value("Nouveau message contact"))
                .andExpect(jsonPath("$[0].lue").value(false));

        verify(notificationService).listForUser(1L);
    }

    @Test
    void unreadCount_ShouldReturnCount() throws Exception {
        when(notificationService.unreadCount(1L)).thenReturn(3L);

        mockMvc.perform(get("/api/admin/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(3));

        verify(notificationService).unreadCount(1L);
    }

    @Test
    void markRead_ShouldReturnUpdatedNotification() throws Exception {
        when(notificationService.markRead(eq(1L), eq(10L))).thenReturn(sampleNotification(true));

        mockMvc.perform(patch("/api/admin/notifications/10/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.lue").value(true));

        verify(notificationService).markRead(1L, 10L);
    }
}
