package com.comma.domain.place.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {

    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String operatingHours;
    private Double aiScore;
    private String status;          // pending / approved / rejected
    private LocalDateTime createdAt;
}
