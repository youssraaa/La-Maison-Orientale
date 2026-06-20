package com.lamaisonorientale.reservation.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lamaisonorientale.reservation.domain.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
