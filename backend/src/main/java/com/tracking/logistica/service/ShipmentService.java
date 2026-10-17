package com.tracking.logistica.service;

import com.tracking.logistica.dto.ShipmentRequest;
import com.tracking.logistica.dto.ShipmentResponse;
import com.tracking.logistica.entity.*;
import com.tracking.logistica.exception.ResourceNotFoundException;
import com.tracking.logistica.repository.ShipmentRepository;
import com.tracking.logistica.repository.UserRepository;
import com.tracking.logistica.repository.ShipmentEventRepository;
import com.tracking.logistica.repository.LogisticCenterRepository;
import com.tracking.logistica.repository.ShipmentGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final ShipmentEventRepository shipmentEventRepository;
    private final LogisticCenterRepository logisticCenterRepository;
    private final ShipmentGroupRepository shipmentGroupRepository;

    public ShipmentResponse createShipment(ShipmentRequest request, String operatorEmail) {

        User operator = userRepository.findByEmail(operatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Operador no encontrado"));

        WeightCategory category = determineCategory(request.getWeight());

        Shipment shipment = Shipment.builder()
                .senderCompanyName(request.getSenderCompanyName().trim())
                .senderContactNumber(request.getSenderContactNumber().trim())
                .recipientName(request.getRecipientName().trim())
                .recipientIdentification(request.getRecipientIdentification().trim())
                .recipientAddress(request.getRecipientAddress().trim())
                .weightCategory(category)
                .createdBy(operator)
                .build();

        Shipment saved = shipmentRepository.save(shipment);

        ShipmentResponse response = mapToResponse(saved);

        if (category == WeightCategory.EXTRAGRANDE) {
            response.setMessage("Envío Extragrande registrado. Tendrá un tratamiento diferente.");
        }

        return response;
    }

    public ShipmentResponse getShipmentByTrackingId(String trackingId, String userEmail) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con el código: " + trackingId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        if (user.getRole() == Role.CLIENTE &&
                !user.getIdentification().equals(shipment.getRecipientIdentification())) {
            throw new ResourceNotFoundException("Envío no encontrado con el código: " + trackingId);
        }

        return mapToResponse(shipment);
    }

    public java.util.List<ShipmentResponse> getMyShipments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return shipmentRepository.findByRecipientIdentification(user.getIdentification())
                .stream().map(this::mapToResponse).toList();
    }

    public java.util.List<ShipmentResponse> getAllShipments() {
        return shipmentRepository.findAllByOrderByCreatedAtDesc().stream().map(this::mapToResponse).toList();
    }

    public java.util.List<ShipmentResponse> getShipmentsInDelivery() {
        return shipmentRepository.findByStatusOrderByCreatedAtDesc(ShipmentStatus.EN_REPARTO)
                .stream().map(this::mapToResponse).toList();
    }

    public java.util.List<LogisticCenter> getActiveCenters() { return logisticCenterRepository.findByActiveTrue(); }

    @Transactional
    public ShipmentResponse cancelShipment(String trackingId, String reason, String operatorEmail) {
        if (reason == null || reason.isBlank()) throw new IllegalArgumentException("El motivo de cancelación es obligatorio");
        Shipment shipment = shipmentRepository.findByTrackingIdForUpdate(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con el código: " + trackingId));
        ShipmentStatus expected = shipmentEventRepository.findTopByShipmentIdOrderByEventDateTimeDesc(shipment.getId())
                .map(event -> {
                    ShipmentStatus current = event.getStage();
                    if (current == ShipmentStatus.CANCELADO || current == ShipmentStatus.ENTREGADO) return null;
                    if (current == ShipmentStatus.EN_REPARTO) return ShipmentStatus.ENTREGADO;
                    return ShipmentStatus.values()[current.ordinal() + 1];
                })
                .orElse(ShipmentStatus.RECIBIDO_EN_ORIGEN);
        if (shipment.getStatus() != expected)
            throw new IllegalArgumentException("El estado del envío no coincide con su último evento");
        if (expected != ShipmentStatus.RECIBIDO_EN_ORIGEN && expected != ShipmentStatus.EN_CENTRAL)
            throw new IllegalArgumentException("El envío ya no puede cancelarse en su etapa actual");
        User operator = userRepository.findByEmail(operatorEmail).orElseThrow(() -> new ResourceNotFoundException("Operador no encontrado"));
        if (shipmentGroupRepository.existsByActiveTrueAndShipments_Id(shipment.getId())) {
            throw new IllegalArgumentException("Disuelve el grupo activo antes de cancelar este envío");
        }
        shipment.setStatus(ShipmentStatus.CANCELADO);
        shipmentRepository.save(shipment);
        ShipmentEvent event = ShipmentEvent.builder().shipment(shipment).stage(ShipmentStatus.CANCELADO)
                .location(shipment.getRecipientAddress()).registeredBy(operator).note(reason.trim()).build();
        shipmentEventRepository.save(event);
        return mapToResponse(shipment);
    }

    private WeightCategory determineCategory(double weight) {
        if (weight <= 20) return WeightCategory.PEQUENO;
        if (weight <= 40) return WeightCategory.MEDIANO;
        if (weight <= 70) return WeightCategory.GRANDE;
        return WeightCategory.EXTRAGRANDE;
    }

    private ShipmentResponse mapToResponse(Shipment shipment) {
        return ShipmentResponse.builder()
                .id(shipment.getId())
                .trackingId(shipment.getTrackingId())
                .senderCompanyName(shipment.getSenderCompanyName())
                .senderContactNumber(shipment.getSenderContactNumber())
                .recipientName(shipment.getRecipientName())
                .recipientIdentification(shipment.getRecipientIdentification())
                .recipientAddress(shipment.getRecipientAddress())
                .weightCategory(shipment.getWeightCategory())
                .status(shipment.getStatus())
                .createdByEmail(shipment.getCreatedBy().getEmail())
                .createdAt(shipment.getCreatedAt())
                .build();
    }
}

