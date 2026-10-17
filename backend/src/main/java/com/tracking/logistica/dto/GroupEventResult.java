package com.tracking.logistica.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class GroupEventResult {
    private List<String> updatedTrackingIds;
    private List<String> skippedReasons;
}
