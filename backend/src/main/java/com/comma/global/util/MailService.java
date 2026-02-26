package com.comma.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.front-url:http://localhost:3000}")
    private String frontUrl;

    public void sendVerificationEmail(String to, String token) {
        String link = baseUrl + "/api/auth/email/verify?token=" + token;
        send(to,
                "[쉼표] 이메일 인증을 완료해주세요",
                "안녕하세요, 쉼표입니다.\n\n" +
                "아래 링크를 클릭해 이메일 인증을 완료해주세요.\n" +
                "링크는 24시간 동안 유효합니다.\n\n" +
                link);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String link = frontUrl + "/password-reset?token=" + token;
        send(to,
                "[쉼표] 비밀번호 재설정",
                "안녕하세요, 쉼표입니다.\n\n" +
                "비밀번호 재설정 링크입니다. (유효시간: 30분)\n\n" +
                link + "\n\n" +
                "본인이 요청하지 않았다면 이 메일을 무시하세요.");
    }

    private void send(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
