package com.tracking.logistica.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tracking.logistica.dto.ShipmentEventRequest;
import com.tracking.logistica.dto.ShipmentEventResponse;
import com.tracking.logistica.service.ShipmentEventService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/operador")
@RequiredArgsConstructor
public class ShipmentEventController {

    private final ShipmentEventService shipmentEventService;

    @PostMapping("/shipment-events")
    public ResponseEntity<ShipmentEventResponse> registerEvent(
            @Valid @RequestBody ShipmentEventRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ShipmentEventResponse response = shipmentEventService.registerEvent(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}