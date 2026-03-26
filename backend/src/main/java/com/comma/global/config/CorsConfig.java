package com.comma.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
// CORS 규칙을 등록하는 레지스트리
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
// CORS(Cross-Origin Resource Sharing): 다른 출처(origin)에서 오는 요청을 허용하는 설정.
// 브라우저는 보안상 다른 출처의 API를 기본으로 차단한다.
// 프론트(localhost:3000)가 백엔드(localhost:8080)로 요청하면 CORS 에러가 난다.

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
        // "/api/"로 시작하는 모든 경로에 CORS 규칙을 적용한다.
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                // 이 출처(origin)에서 오는 요청만 허용한다.
                // 3000: React 기본 개발서버 포트
                // 5173: Vite 기반 개발서버 포트 (혹시 Vite 쓸 경우 대비)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // 허용할 HTTP 메서드. OPTIONS는 CORS Preflight에 필요해서 반드시 포함.
                .allowedHeaders("*")
                // 모든 요청 헤더를 허용한다. Authorization, Content-Type 등 모두 포함.
                .exposedHeaders("Authorization")
                // 브라우저 JavaScript에서 읽을 수 있는 응답 헤더를 지정한다.
                // 기본적으로 브라우저는 응답 헤더를 못 읽는다. 이걸 허용해야 토큰을 꺼낼 수 있다.
                .allowCredentials(true)
                // 쿠키, Authorization 헤더 등 인증 정보를 포함한 요청을 허용한다.
                .maxAge(3600);
                // Preflight 응답을 3600초(1시간) 동안 브라우저가 캐시한다.
                // 1시간 안에는 같은 경로에 OPTIONS 요청을 다시 보내지 않아도 된다.
    }
}
