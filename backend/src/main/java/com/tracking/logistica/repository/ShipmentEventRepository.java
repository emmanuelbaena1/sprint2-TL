package com.tracking.logistica.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tracking.logistica.entity.ShipmentEvent;

public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, Long> {
    List<ShipmentEvent> findByShipmentIdOrderByEventDateTimeAsc(Long shipmentId);
    Optional<ShipmentEvent> findTopByShipmentIdOrderByEventDateTimeDesc(Long shipmentId);
    boolean existsByShipmentId(Long shipmentId);
}
