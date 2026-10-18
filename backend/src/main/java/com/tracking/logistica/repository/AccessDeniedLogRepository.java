package com.tracking.logistica.repository;

import com.tracking.logistica.entity.AccessDeniedLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessDeniedLogRepository extends JpaRepository<AccessDeniedLog, Long> {
}