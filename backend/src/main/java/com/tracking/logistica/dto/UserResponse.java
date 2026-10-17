package com.tracking.logistica.dto;

import com.tracking.logistica.entity.Role;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String identification;
    private String address;
    private String cityCountry;
    private Role role;
    private LocalDateTime createdAt;
}