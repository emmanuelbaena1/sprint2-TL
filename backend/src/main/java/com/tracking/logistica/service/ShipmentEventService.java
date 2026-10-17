package com.tracking.logistica.service;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tracking.logistica.dto.ShipmentEventRequest;
import com.tracking.logistica.dto.ShipmentEventResponse;
import com.tracking.logistica.entity.LogisticCenter;
import com.tracking.logistica.entity.Shipment;
import com.tracking.logistica.entity.ShipmentEvent;
import com.tracking.logistica.entity.ShipmentStatus;
import com.tracking.logistica.entity.User;
import com.tracking.logistica.exception.ResourceNotFoundException;
import com.tracking.logistica.repository.LogisticCenterRepository;
import com.tracking.logistica.repository.ShipmentEventRepository;
import com.tracking.logistica.repository.ShipmentRepository;
import com.tracking.logistica.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipmentEventService {

    private final ShipmentEventRepository shipmentEventRepository;
    private final ShipmentRepository shipmentRepository;
    private final LogisticCenterRepository logisticCenterRepository;
    private final UserRepository userRepository;

    // Etapas en las que el lugar debe ser un centro logístico registrado
    private static final Set<ShipmentStatus> NETWORK_STAGES = Set.of(
            ShipmentStatus.RECIBIDO_EN_ORIGEN,
            ShipmentStatus.EN_CENTRAL,
            ShipmentStatus.EN_TRANSITO
    );

    @Transactional
    public ShipmentEventResponse registerEvent(ShipmentEventRequest request, String operatorEmail) {

        User operator = userRepository.findByEmail(operatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Operador no encontrado"));

        Shipment shipment = shipmentRepository.findByTrackingIdForUpdate(request.getTrackingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Envío no encontrado con el código: " + request.getTrackingId()));

        ShipmentStatus expectedStage = determineExpectedStage(shipment.getId());
        if (shipment.getStatus() != expectedStage) {
            throw new IllegalArgumentException("El estado del envío no coincide con su último evento.");
        }
        validateStage(request.getStage(), expectedStage);

        String location;
        LogisticCenter center = null;

        if (NETWORK_STAGES.contains(request.getStage())) {
            if (request.getLogisticCenterId() == null) {
                throw new IllegalArgumentException(
                        "Debe indicar un centro logístico para la etapa " + request.getStage());
            }
            center = logisticCenterRepository.findById(request.getLogisticCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Centro logístico no encontrado"));

            if (!center.isActive()) {
                throw new IllegalArgumentException("El centro logístico seleccionado no está activo");
            }
            location = center.getName() + " - " + center.getCity();
        } else {
            // EN_REPARTO y ENTREGADO usan la dirección del destinatario
            location = shipment.getRecipientAddress();
        }

        ShipmentEvent event = ShipmentEvent.builder()
                .shipment(shipment)
                .stage(request.getStage())
                .logisticCenter(center)
                .location(location)
                .note(request.getNote())
                .registeredBy(operator)
                .build();

        ShipmentEvent saved = shipmentEventRepository.save(event);

        // Actualiza el estado actual del envío para mantenerlo sincronizado
        shipment.setStatus(request.getStage());
        shipmentRepository.save(shipment);

        return mapToResponse(saved);
    }

    public List<ShipmentEventResponse> getHistory(String trackingId) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Envío no encontrado con el código: " + trackingId));

        return shipmentEventRepository.findByShipmentIdOrderByEventDateTimeAsc(shipment.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ShipmentStatus determineExpectedStage(Long shipmentId) {
        return shipmentEventRepository.findTopByShipmentIdOrderByEventDateTimeDesc(shipmentId)
                .map(lastEvent -> {
                    ShipmentStatus current = lastEvent.getStage();
                    if (current == ShipmentStatus.CANCELADO || current == ShipmentStatus.ENTREGADO) {
                        throw new IllegalArgumentException("El envío está en una etapa terminal y no admite nuevos eventos.");
                    }
                    if (current == ShipmentStatus.EN_REPARTO) return ShipmentStatus.ENTREGADO;
                    return ShipmentStatus.values()[current.ordinal() + 1];
                })
                .orElse(ShipmentStatus.RECIBIDO_EN_ORIGEN);
    }
    private void validateStage(ShipmentStatus requested, ShipmentStatus expected) {
        if (requested != expected) {
            throw new IllegalArgumentException(
                    "Etapa inválida. La siguiente etapa permitida es: " + expected);
        }
    }

    private ShipmentEventResponse mapToResponse(ShipmentEvent event) {
        return ShipmentEventResponse.builder()
                .id(event.getId())
                .trackingId(event.getShipment().getTrackingId())
                .stage(event.getStage())
                .location(event.getLocation())
                .registeredByEmail(event.getRegisteredBy().getEmail())
                .eventDateTime(event.getEventDateTime())
                .groupEvent(event.isGroupEvent())
                .note(event.getNote())
                .build();
    }
}
