package com.comma.domain.place.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceTag {

    private Long id;
    private Long placeId;
    private String tagName;
    private String restType;    // 이 태그가 속하는 휴식 유형
}
