package com.comma.domain.user.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {

    private Long id;
    private String 쉼표번호;
    private String notificationSettingsJson;    // {"push":true,"email":false} 형태
    private String theme;                       // light / dark
    private String smartwatchType;              // apple, galaxy, fitbit 등
}
