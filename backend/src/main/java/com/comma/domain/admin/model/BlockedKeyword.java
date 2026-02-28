package com.comma.domain.admin.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockedKeyword {

    private Long id;
    private String keyword;
    private Boolean active;
}
