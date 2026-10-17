package com.tracking.logistica.dto;

import java.time.LocalDateTime;

import com.tracking.logistica.entity.ShipmentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShipmentEventResponse {
    private Long id;
    private String trackingId;
    private ShipmentStatus stage;
    private String location;
    private String registeredByEmail;
    private LocalDateTime eventDateTime;
    private boolean groupEvent;
    private String note;
}
