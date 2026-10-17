package com.tracking.logistica.repository;

import com.tracking.logistica.entity.Shipment;
import com.tracking.logistica.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingId(String trackingId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Shipment s where s.trackingId = :trackingId")
    Optional<Shipment> findByTrackingIdForUpdate(@Param("trackingId") String trackingId);

    List<Shipment> findByRecipientIdentification(String recipientIdentification);
    List<Shipment> findAllByOrderByCreatedAtDesc();
    List<Shipment> findByStatusOrderByCreatedAtDesc(ShipmentStatus status);
}
