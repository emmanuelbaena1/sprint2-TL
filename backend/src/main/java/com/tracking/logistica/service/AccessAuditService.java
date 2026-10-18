package com.tracking.logistica.service;

import com.tracking.logistica.entity.AccessDeniedLog;
import com.tracking.logistica.repository.AccessDeniedLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccessAuditService {

    private final AccessDeniedLogRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDenied(String userEmail, String trackingId, String reason) {
        repository.save(AccessDeniedLog.builder()
                .userEmail(userEmail)
                .requestedTrackingId(trackingId)
                .reason(reason)
                .deniedAt(LocalDateTime.now())
                .build());
    }
}