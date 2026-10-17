package com.tracking.logistica.dto;

import com.tracking.logistica.entity.ShipmentStatus;
import com.tracking.logistica.entity.WeightCategory;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentResponse {

    private Long id;
    private String trackingId;
    private String senderCompanyName;
    private String senderContactNumber;
    private String recipientName;
    private String recipientIdentification;
    private String recipientAddress;
    private WeightCategory weightCategory;
    private ShipmentStatus status;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private String message;
}