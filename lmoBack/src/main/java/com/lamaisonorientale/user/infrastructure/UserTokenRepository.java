package com.lamaisonorientale.user.infrastructure;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.user.domain.UserToken;
import com.lamaisonorientale.user.domain.UserTokenType;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    Optional<UserToken> findByTokenAndType(String token, UserTokenType type);

    boolean existsByUtilisateurIdAndTypeAndUsedAtIsNullAndExpiresAtAfter(
            Long utilisateurId, UserTokenType type, Instant expiresAfter);
}
