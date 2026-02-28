package com.comma.domain.notification.mapper;

import com.comma.domain.notification.model.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {

    List<Notification> findBy쉼표번호(@Param("쉼표번호") String 쉼표번호,
                                    @Param("offset") int offset,
                                    @Param("size") int size);

    int countUnread(@Param("쉼표번호") String 쉼표번호);

    void updateRead(@Param("id") Long id);

    void updateAllRead(@Param("쉼표번호") String 쉼표번호);

    void insertNotification(Notification notification);
}
