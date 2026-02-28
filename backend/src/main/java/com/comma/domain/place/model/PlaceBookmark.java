package com.comma.domain.place.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceBookmark {

    private Long id;
    private String 쉼표번호;
    private Long placeId;
    private LocalDateTime createdAt;
}
