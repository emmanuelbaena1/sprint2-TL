package com.tracking.logistica.dto;

import com.tracking.logistica.entity.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GroupEventRequest {
    @NotNull private ShipmentStatus stage;
    private Long logisticCenterId;
}
