package com.tracking.logistica.dto;

import com.tracking.logistica.entity.ShipmentStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShipmentEventRequest {

    @NotBlank(message = "El trackingId es obligatorio")
    private String trackingId;

    @NotNull(message = "La etapa es obligatoria")
    private ShipmentStatus stage;

    // Requerido solo cuando la etapa corresponde a un centro logístico
    // (RECIBIDO_EN_ORIGEN, EN_CENTRAL, EN_TRANSITO)
    private Long logisticCenterId;

    private String note;
}
