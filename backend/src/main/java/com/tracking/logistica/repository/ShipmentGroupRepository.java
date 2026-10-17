package com.tracking.logistica.repository;

import com.tracking.logistica.entity.ShipmentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ShipmentGroupRepository extends JpaRepository<ShipmentGroup, Long> {
    List<ShipmentGroup> findByActiveTrueOrderByCreatedAtDesc();
    boolean existsByActiveTrueAndShipments_Id(Long shipmentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from ShipmentGroup g where g.id = :id")
    java.util.Optional<ShipmentGroup> findByIdForUpdate(@Param("id") Long id);
}
