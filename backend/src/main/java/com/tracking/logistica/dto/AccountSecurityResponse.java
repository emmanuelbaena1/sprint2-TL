package com.tracking.logistica.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AccountSecurityResponse {
    private Long id;
    private String email;
    private String fullName;
    private boolean accountLocked;
    private LocalDateTime penaltyUntil;
}
