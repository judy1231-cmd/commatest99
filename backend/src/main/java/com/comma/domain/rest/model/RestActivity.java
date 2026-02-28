package com.comma.domain.rest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestActivity {

    private Long id;
    private Long restTypeId;
    private String activityName;
    private String guideContent;
    private Integer durationMinutes;
}
