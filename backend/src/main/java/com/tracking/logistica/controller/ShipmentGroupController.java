package com.tracking.logistica.controller;

import com.tracking.logistica.dto.*;
import com.tracking.logistica.entity.ShipmentGroup;
import com.tracking.logistica.service.ShipmentGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/operador/groups") @RequiredArgsConstructor
public class ShipmentGroupController {
    private final ShipmentGroupService service;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(service.list().stream().map(group -> Map.<String, Object>of(
                "id", group.getId(), "name", group.getName(), "active", group.isActive(), "createdAt", group.getCreatedAt(),
                "shipments", group.getShipments().stream().map(shipment -> Map.of("trackingId", shipment.getTrackingId(), "recipientName", shipment.getRecipientName(), "status", shipment.getStatus().name())).toList()
        )).toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ShipmentGroupRequest request, Authentication auth) {
        ShipmentGroup group = service.create(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", group.getId(), "name", group.getName(), "active", group.isActive(), "createdAt", group.getCreatedAt()));
    }

    @PostMapping("/{groupId}/events")
    public ResponseEntity<GroupEventResult> apply(@PathVariable Long groupId, @Valid @RequestBody GroupEventRequest request, Authentication auth) {
        return ResponseEntity.ok(service.apply(groupId, request, auth.getName()));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> dissolve(@PathVariable Long groupId) {
        service.dissolve(groupId);
        return ResponseEntity.noContent().build();
    }
}
