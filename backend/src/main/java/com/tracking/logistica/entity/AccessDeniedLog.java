package com.tracking.logistica.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "access_denied_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccessDeniedLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String requestedTrackingId;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private LocalDateTime deniedAt;
}