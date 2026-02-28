package com.comma.domain.place.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlacePhoto {

    private Long id;
    private Long placeId;
    private String photoUrl;
    private String source;      // user, crawling, api 등 사진 출처
}
