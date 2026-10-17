package com.tracking.logistica.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_id", nullable = false, unique = true, updatable = false)
    private String trackingId;

    @Column(name = "sender_company_name", nullable = false)
    private String senderCompanyName;

    @Column(name = "sender_contact_number", nullable = false)
    private String senderContactNumber;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "recipient_identification", nullable = false)
    private String recipientIdentification;

    @Column(name = "recipient_address", nullable = false)
    private String recipientAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "weight_category", nullable = false)
    private WeightCategory weightCategory;

    @Version
    private Long version;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.RECIBIDO_EN_ORIGEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.trackingId == null) {
            this.trackingId = generateTrackingId();
        }
    }

    private String generateTrackingId() {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        return "TRK-" + uuid;
    }
}
