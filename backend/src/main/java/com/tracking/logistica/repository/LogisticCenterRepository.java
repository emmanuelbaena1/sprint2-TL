package com.tracking.logistica.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tracking.logistica.entity.LogisticCenter;

public interface LogisticCenterRepository extends JpaRepository<LogisticCenter, Long> {
    List<LogisticCenter> findByActiveTrue();
}
