package com.comma.domain.notification.service;

import com.comma.domain.notification.mapper.NotificationMapper;
import com.comma.domain.notification.model.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;

    public Map<String, Object> getNotifications(String 쉼표번호, int page, int size) {
        int offset = (page - 1) * size;
        List<Notification> notifications = notificationMapper.findBy쉼표번호(쉼표번호, offset, size);

        Map<String, Object> result = new HashMap<>();
        result.put("notifications", notifications);
        result.put("page", page);
        return result;
    }

    public int getUnreadCount(String 쉼표번호) {
        return notificationMapper.countUnread(쉼표번호);
    }

    @Transactional
    public void markAsRead(Long id, String 쉼표번호) {
        notificationMapper.updateRead(id);
    }

    @Transactional
    public void markAllAsRead(String 쉼표번호) {
        notificationMapper.updateAllRead(쉼표번호);
    }

    /**
     * 알림 생성 — 다른 서비스에서 호출 (배지 수여, 시스템 공지 등)
     */
    @Transactional
    public void createNotification(String 쉼표번호, String type, String title, String content) {
        Notification notification = new Notification();
        notification.set쉼표번호(쉼표번호);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationMapper.insertNotification(notification);
    }
}
