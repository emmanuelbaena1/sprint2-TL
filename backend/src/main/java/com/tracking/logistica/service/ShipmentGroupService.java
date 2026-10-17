package com.tracking.logistica.service;

import com.tracking.logistica.dto.*;
import com.tracking.logistica.entity.*;
import com.tracking.logistica.exception.ResourceNotFoundException;
import com.tracking.logistica.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service @RequiredArgsConstructor
public class ShipmentGroupService {
    private final ShipmentGroupRepository groups;
    private final ShipmentRepository shipments;
    private final ShipmentEventRepository events;
    private final LogisticCenterRepository centers;
    private final UserRepository users;

    @Transactional
    public ShipmentGroup create(ShipmentGroupRequest request, String email) {
        User operator = users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Operador no encontrado"));
        Set<Shipment> selected = new LinkedHashSet<>();
        for (String id : new LinkedHashSet<>(request.getTrackingIds())) {
            Shipment shipment = shipments.findByTrackingIdForUpdate(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado: " + id));
            if (shipment.getStatus() == ShipmentStatus.ENTREGADO || shipment.getStatus() == ShipmentStatus.CANCELADO)
                throw new IllegalArgumentException("No se puede incluir un envío terminal en un grupo: " + id);
            if (groups.existsByActiveTrueAndShipments_Id(shipment.getId()))
                throw new IllegalArgumentException("El envío " + id + " ya pertenece a un grupo activo");
            selected.add(shipment);
        }
        ShipmentGroup group = ShipmentGroup.builder().name(request.getName().trim()).createdBy(operator).shipments(selected).build();
        return groups.save(group);
    }

    @Transactional(readOnly = true)
    public List<ShipmentGroup> list() { return groups.findByActiveTrueOrderByCreatedAtDesc(); }

    @Transactional
    public GroupEventResult apply(Long groupId, GroupEventRequest request, String email) {
        ShipmentGroup group = groups.findByIdForUpdate(groupId).orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
        if (!group.isActive()) throw new IllegalArgumentException("El grupo ya fue disuelto");
        ShipmentStatus stage = request.getStage();
        if (stage == ShipmentStatus.ENTREGADO || stage == ShipmentStatus.CANCELADO)
            throw new IllegalArgumentException("Entregado y Cancelado solo se registran individualmente");
        User operator = users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Operador no encontrado"));
        Set<ShipmentStatus> networkStages = Set.of(ShipmentStatus.RECIBIDO_EN_ORIGEN, ShipmentStatus.EN_CENTRAL, ShipmentStatus.EN_TRANSITO);
        LogisticCenter center = null;
        String location;
        if (networkStages.contains(stage)) {
            if (request.getLogisticCenterId() == null) throw new IllegalArgumentException("Debe seleccionar un centro logístico");
            center = centers.findById(request.getLogisticCenterId()).orElseThrow(() -> new ResourceNotFoundException("Centro logístico no encontrado"));
            if (!center.isActive()) throw new IllegalArgumentException("El centro logístico seleccionado no está activo");
            location = center.getName() + " - " + center.getCity();
        } else if (stage == ShipmentStatus.EN_REPARTO) {
            location = "Dirección del destinatario";
        } else {
            throw new IllegalArgumentException("Etapa grupal no válida");
        }
        List<String> updated = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<Shipment> lockedShipments = new ArrayList<>();
        for (Shipment member : group.getShipments()) {
            Shipment shipment = shipments.findByTrackingIdForUpdate(member.getTrackingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado: " + member.getTrackingId()));
            lockedShipments.add(shipment);
            ShipmentStatus expected = events.findTopByShipmentIdOrderByEventDateTimeDesc(shipment.getId())
                    .map(last -> {
                        ShipmentStatus current = last.getStage();
                        if (current == ShipmentStatus.CANCELADO || current == ShipmentStatus.ENTREGADO) return null;
                        if (current == ShipmentStatus.EN_REPARTO) return ShipmentStatus.ENTREGADO;
                        return ShipmentStatus.values()[current.ordinal() + 1];
                    })
                    .orElse(ShipmentStatus.RECIBIDO_EN_ORIGEN);
            if (shipment.getStatus() != expected) {
                skipped.add(shipment.getTrackingId() + ": el estado actual no coincide con su historial");
                continue;
            }
            if (expected != stage) {
                skipped.add(shipment.getTrackingId() + ": siguiente etapa permitida " + (expected == null ? "ninguna (terminal)" : expected));
                continue;
            }
            String eventLocation = stage == ShipmentStatus.EN_REPARTO ? shipment.getRecipientAddress() : location;
            events.save(ShipmentEvent.builder().shipment(shipment).stage(stage)
                    .logisticCenter(stage == ShipmentStatus.EN_REPARTO ? null : center)
                    .location(eventLocation).registeredBy(operator).groupEvent(true)
                    .note("Aplicado desde grupo " + group.getName()).build());
            shipment.setStatus(stage);
            updated.add(shipment.getTrackingId());
        }
        shipments.saveAll(lockedShipments);
        return GroupEventResult.builder().updatedTrackingIds(updated).skippedReasons(skipped).build();
    }

    @Transactional
    public void dissolve(Long groupId) {
        ShipmentGroup group = groups.findByIdForUpdate(groupId).orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
        group.setActive(false);
        groups.save(group);
    }
}
