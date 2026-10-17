package com.tracking.logistica.controller;

import com.tracking.logistica.dto.UserResponse;
import com.tracking.logistica.dto.ShipmentResponse;
import com.tracking.logistica.entity.LogisticCenter;
import com.tracking.logistica.repository.LogisticCenterRepository;
import com.tracking.logistica.service.ShipmentService;
import com.tracking.logistica.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/supervisor") @RequiredArgsConstructor
public class SupervisorController {
    private final UserService userService;
    private final LogisticCenterRepository centers;
    private final ShipmentService shipmentService;
    @GetMapping("/users-with-shipments") public ResponseEntity<List<UserResponse>> usersWithShipments() { return ResponseEntity.ok(userService.findUsersWithShipments()); }
    @GetMapping("/logistic-centers") public ResponseEntity<List<LogisticCenter>> logisticCenters() { return ResponseEntity.ok(centers.findByActiveTrue()); }
    @GetMapping("/volume") public ResponseEntity<Long> volume() { return ResponseEntity.ok(userService.shipmentCount()); }
    @GetMapping("/shipments/in-delivery") public ResponseEntity<List<ShipmentResponse>> shipmentsInDelivery() { return ResponseEntity.ok(shipmentService.getShipmentsInDelivery()); }
}
