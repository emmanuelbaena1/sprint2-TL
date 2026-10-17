package com.tracking.logistica.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "shipment_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus stage;

    // Nulo cuando la etapa usa la dirección del destinatario en lugar de un centro logístico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logistic_center_id")
    private LogisticCenter logisticCenter;

    // Snapshot legible del lugar (nombre del centro o dirección del destinatario)
    @Column(nullable = false)
    private String location;

    @Column(name = "group_event", nullable = false)
    @Builder.Default
    private boolean groupEvent = false;

    @Column(name = "event_note", length = 500)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by", nullable = false)
    private User registeredBy;

    @Column(name = "event_date_time", nullable = false, updatable = false)
    private LocalDateTime eventDateTime;

    @PrePersist
    protected void onCreate() {
        this.eventDateTime = LocalDateTime.now();
    }
}
