package com.comma.global.util;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.front-url:http://localhost:3000}")
    private String frontUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String token) {
        String link = baseUrl + "/api/auth/email/verify?token=" + token;
        String html =
            "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;'>" +
            "<h2 style='color:#10b981;'>쉼표(,) 이메일 인증</h2>" +
            "<p>안녕하세요, 쉼표입니다.<br>아래 버튼을 클릭해 이메일 인증을 완료해주세요.<br>링크는 24시간 동안 유효합니다.</p>" +
            "<a href='" + link + "' style='display:inline-block;margin-top:16px;padding:12px 24px;" +
            "background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;'>" +
            "이메일 인증하기</a>" +
            "<p style='margin-top:24px;color:#64748b;font-size:13px;'>버튼이 클릭되지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요.<br>" +
            "<a href='" + link + "' style='color:#10b981;'>" + link + "</a></p>" +
            "</div>";
        sendHtml(to, "[쉼표] 이메일 인증을 완료해주세요", html);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String link = frontUrl + "/password-reset?token=" + token;
        String html =
            "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;'>" +
            "<h2 style='color:#10b981;'>쉼표(,) 비밀번호 재설정</h2>" +
            "<p>안녕하세요, 쉼표입니다.<br>아래 버튼을 클릭해 비밀번호를 재설정해주세요.<br>링크는 30분 동안 유효합니다.</p>" +
            "<a href='" + link + "' style='display:inline-block;margin-top:16px;padding:12px 24px;" +
            "background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;'>" +
            "비밀번호 재설정하기</a>" +
            "<p style='margin-top:24px;color:#64748b;font-size:13px;'>본인이 요청하지 않았다면 이 메일을 무시하세요.</p>" +
            "</div>";
        sendHtml(to, "[쉼표] 비밀번호 재설정", html);
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("메일 발송 실패: " + e.getMessage(), e);
        }
    }
}
