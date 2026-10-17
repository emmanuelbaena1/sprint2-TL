package com.tracking.logistica.controller;

import java.util.List;

import com.tracking.logistica.dto.ShipmentEventResponse;
import com.tracking.logistica.dto.ShipmentResponse;
import com.tracking.logistica.service.ShipmentEventService;
import com.tracking.logistica.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final ShipmentService shipmentService;
    private final ShipmentEventService shipmentEventService;

    @GetMapping("/{trackingId}")
    public ResponseEntity<ShipmentResponse> getShipmentStatus(@PathVariable String trackingId, Authentication authentication) {
        ShipmentResponse response = shipmentService.getShipmentByTrackingId(trackingId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{trackingId}/events")
    public ResponseEntity<List<ShipmentEventResponse>> getShipmentHistory(@PathVariable String trackingId, Authentication authentication) {
        shipmentService.getShipmentByTrackingId(trackingId, authentication.getName());
        List<ShipmentEventResponse> history = shipmentEventService.getHistory(trackingId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ShipmentResponse>> getMyShipments(Authentication authentication) {
        return ResponseEntity.ok(shipmentService.getMyShipments(authentication.getName()));
    }
}
