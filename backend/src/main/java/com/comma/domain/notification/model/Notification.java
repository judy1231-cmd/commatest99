package com.comma.domain.notification.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    private Long id;
    private String 쉼표번호;
    private String type;            // badge, challenge, system 등
    private String title;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
