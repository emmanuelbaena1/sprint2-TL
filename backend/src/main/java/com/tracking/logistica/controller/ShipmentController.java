package com.tracking.logistica.controller;

import com.tracking.logistica.dto.CancelShipmentRequest;
import com.tracking.logistica.dto.ShipmentRequest;
import com.tracking.logistica.dto.ShipmentResponse;
import com.tracking.logistica.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/operador")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;
    @GetMapping("/centers")
    public ResponseEntity<List<com.tracking.logistica.entity.LogisticCenter>> getCenters() {
        return ResponseEntity.ok(shipmentService.getActiveCenters());
    }

    @GetMapping("/shipments")
    public ResponseEntity<List<ShipmentResponse>> getShipments() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    @PostMapping("/shipments")
    public ResponseEntity<ShipmentResponse> createShipment(
            @Valid @RequestBody ShipmentRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ShipmentResponse response = shipmentService.createShipment(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/shipments/{trackingId}/cancel")
    public ResponseEntity<ShipmentResponse> cancelShipment(@PathVariable String trackingId, @Valid @RequestBody CancelShipmentRequest body, Authentication authentication) {
        return ResponseEntity.ok(shipmentService.cancelShipment(trackingId, body.getReason(), authentication.getName()));
    }
}

