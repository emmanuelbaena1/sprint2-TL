package com.tracking.logistica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class ShipmentGroupRequest {
    @NotBlank @Size(max = 100)
    private String name;
    @NotEmpty
    private List<@NotBlank @Pattern(regexp = "TRK-[A-Fa-f0-9]{10}") String> trackingIds;
}
