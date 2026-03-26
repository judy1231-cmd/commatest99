package com.comma.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
// 이 클래스가 Spring 설정 클래스임을 선언한다. @Bean 메서드나 설정 로직을 담는다.
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
// 인터셉터를 등록하는 레지스트리
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
// 정적 리소스 경로를 등록하는 레지스트리
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// Spring MVC 설정을 커스터마이징할 수 있는 인터페이스

import java.nio.file.Paths;
// 파일 시스템 경로를 다루는 유틸. 상대경로 → 절대경로 변환에 사용.

@Configuration
// Spring이 이 클래스를 설정 클래스로 인식한다.
public class WebConfig implements WebMvcConfigurer {
// WebMvcConfigurer를 구현해서 기본 Spring MVC 설정에 원하는 것을 추가한다.

    private final @NonNull JwtInterceptor jwtInterceptor;
    // 등록할 인터셉터. Spring이 자동으로 주입한다.

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    // 업로드 파일 저장 폴더명. application.yml에서 읽어오고, 없으면 "uploads"를 기본값으로 쓴다.

    public WebConfig(@NonNull JwtInterceptor jwtInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
        // 생성자 주입: Spring이 JwtInterceptor Bean을 여기에 넣어준다.
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
    // 인터셉터를 등록하는 메서드. Spring MVC가 시작할 때 한 번 호출한다.
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**");
                // "/api/"로 시작하는 모든 요청에 jwtInterceptor를 적용한다.
                // 정적 리소스(/uploads/**)는 이 패턴에 해당하지 않아서 인터셉터를 거치지 않는다.
    }

    // 업로드된 파일을 정적 리소스로 서빙 — /uploads/** → ./uploads/ 폴더
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
    // 정적 파일(이미지, 동영상 등)을 URL로 서빙하는 설정.
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toString();
        // "uploads" 상대경로를 "/Users/joymin/.../uploads" 같은 절대경로로 변환한다.
        // 절대경로를 써야 어디서 서버를 실행해도 같은 폴더를 가리킨다.
        registry.addResourceHandler("/uploads/**")
        // 브라우저에서 "/uploads/abc.jpg" 로 요청하면
                .addResourceLocations("file:" + absolutePath + "/");
                // 서버 파일시스템의 absolutePath 폴더에서 파일을 찾아서 응답한다.
                // "file:" 접두사 = 로컬 파일시스템 경로임을 Spring에 알린다.
    }
}
