package com.lamaisonorientale.notification.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.notification.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId);

    long countByUtilisateurIdAndLueFalse(Long utilisateurId);
}
