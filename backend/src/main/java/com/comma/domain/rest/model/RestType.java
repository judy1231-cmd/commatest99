package com.comma.domain.rest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestType {

    private Long id;
    private String typeName;        // physical, mental, sensory 등
    private String description;
    private String icon;
    private String colorCode;       // 예: #10b981
}
