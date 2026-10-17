package com.tracking.logistica.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentRequest {

    @NotBlank(message = "El nombre de la empresa remitente es obligatorio")
    private String senderCompanyName;

    @NotBlank(message = "El número de contacto del remitente es obligatorio")
    private String senderContactNumber;

    @NotBlank(message = "El nombre del destinatario es obligatorio")
    private String recipientName;

    @NotBlank(message = "La identificación del destinatario es obligatoria")
    @Pattern(regexp = "[0-9]{1,10}", message = "La identificación debe contener solo números y máximo 10 dígitos")
    private String recipientIdentification;

    @NotBlank(message = "La dirección del destinatario es obligatoria")
    private String recipientAddress;

    @NotNull(message = "El peso es obligatorio")
    @Positive(message = "El peso debe ser mayor a 0")
    @DecimalMax(value = "2000", message = "El peso no puede superar las 2000 lb")
    private Double weight;
}
