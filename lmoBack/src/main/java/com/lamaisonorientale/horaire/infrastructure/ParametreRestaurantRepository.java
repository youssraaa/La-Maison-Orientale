package com.lamaisonorientale.horaire.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.horaire.domain.ParametreRestaurant;

public interface ParametreRestaurantRepository extends JpaRepository<ParametreRestaurant, String> {}
