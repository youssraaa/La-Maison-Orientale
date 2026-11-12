package com.lamaisonorientale.user.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.user.domain.RoleUtilisateur;
import com.lamaisonorientale.user.domain.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    List<Utilisateur> findByRoleOrderByNomAscEmailAsc(RoleUtilisateur role);

    List<Utilisateur> findByRoleInAndActifTrueOrderByNomAscEmailAsc(List<RoleUtilisateur> roles);

    long countByRole(RoleUtilisateur role);
}
