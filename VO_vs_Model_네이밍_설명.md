# VO vs Model — 왜 `model` 패키지 이름을 썼나

> 작성일: 2026-03-23
> 질문: "VO가 있는데 왜 model이라는 이름을 썼어?"

---

## 1. 엄밀한 정의 차이

| 이름 | 정의 | 핵심 특징 |
|------|------|----------|
| **VO** (Value Object) | 값 자체가 동일성인 객체 | **불변(immutable)**, setter 없음, equals/hashCode를 값으로 비교 |
| **Entity** | DB 테이블에 대응하는 식별자 있는 객체 | PK 있음, 가변 |
| **DTO** (Data Transfer Object) | 계층 간 데이터 전달 전용 객체 | 비즈니스 로직 없음, 계층 사이 이동용 |
| **Model** | MVC에서 데이터를 담는 일반 용어 | 느슨한 개념, 위의 모두를 포괄 |

---

## 2. `User.java`는 사실 VO가 아니다

```java
@Data           // ← setter 자동 생성 → 가변(mutable) → VO 조건 위반
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String 쉼표번호;   // PK 있음 → Entity에 가까움
    private String nickname;   // user.setNickname("변경") 가능 → 불변 아님
}
```

**진짜 VO 예시:**
```java
// VO는 이런 것이다 — 불변, setter 없음, 값으로 비교
public final class Money {
    private final int amount;
    private final String currency;

    public Money(int amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }
    // getter만 있고 setter 없음
    // equals()는 amount + currency 값으로 비교
}
// Money(1000, "KRW") == Money(1000, "KRW") → true (같은 값 = 같은 것)
```

`User.java`는:
- PK(`쉼표번호`)로 동일성을 판단한다 → **Entity 특성**
- `setNickname()` 같은 setter가 있다 → **가변(mutable)** → VO 조건 위반
- API 요청/응답에도 그대로 쓰인다 → **DTO 특성**

즉, `User.java`는 **Entity + DTO 혼합**에 가까운 객체다.

---

## 3. 그럼 왜 `model`로 이름 붙였나

### 이유 1 — MyBatis 프로젝트의 관례

```
JPA 사용할 때    → @Entity 어노테이션 붙여서 → entity/ 패키지
MyBatis 사용할 때 → @Entity 개념이 없어서    → model/ 또는 vo/ 를 관례로 씀
```

JPA는 `@Entity`가 붙은 클래스가 명확히 DB 테이블과 매핑되는 "Entity"임을 선언한다.
MyBatis는 그런 어노테이션이 없기 때문에 "DB와 매핑되는 클래스"를 부를 공식 이름이 없다.
그래서 MyBatis 프로젝트에서는 `model/`, `vo/`, `dto/` 중 팀 관례에 따라 아무거나 쓴다.

### 이유 2 — 한국 SI/교육 환경의 관례

한국 개발 환경에서는 **VO를 "데이터를 담는 클래스" 라는 넓은 의미**로 쓰는 경우가 많다.
엄밀한 DDD(도메인 주도 설계) 정의와 다르게, "그냥 getter/setter 있는 데이터 클래스" = VO 로 통용된다.
교재, 강의, SI 프로젝트에서 이 관례가 오래 이어져 왔다.

### 이유 3 — `model`이 가장 안전한 표현

```
이 프로젝트의 User.java를 어떻게 부를까?

VO라고 부르면   → 틀림 (가변이니까)
Entity라고 부르면 → 맞는데 JPA 없으니 어색
DTO라고 부르면  → 맞는데 DB 매핑도 하니까 애매
Model          → "다 담는 클래스"라는 가장 안전한 표현 ✅
```

---

## 4. 엄밀하게 리팩토링한다면

MVP 이후 코드 품질을 올릴 때는 아래처럼 분리하는 게 이상적이다:

```
domain/auth/
├── entity/                     ← DB 매핑 전용 (진짜 Entity)
│   └── User.java               ← @Id, 가변, DB 컬럼 매핑
│
├── dto/                        ← 계층 간 데이터 전달 전용
│   ├── request/
│   │   ├── SignupRequest.java  ← 회원가입 요청 { email, username, password }
│   │   └── LoginRequest.java   ← 로그인 요청 { identifier, password }
│   └── response/
│       ├── LoginResponse.java  ← 로그인 응답 { accessToken, refreshToken, user }
│       └── UserResponse.java   ← 사용자 정보 응답 (password 필드 없음)
│
└── vo/                         ← 진짜 VO (있다면)
    └── 쉼표번호.java             ← 불변 값 객체
```

**왜 지금은 안 했나:**
- MVP 단계에서 분리하면 파일 수가 3~4배 늘어난다
- 15개 도메인 × (entity + request DTO + response DTO) = 수십 개 추가
- 지금 당장 필요한 기능보다 구조 정리에 시간이 더 걸린다
- MVP 완성 후 리팩토링 계획에 포함되어 있다

---

## 5. 정리

| 질문 | 답 |
|------|-----|
| `User.java`가 진짜 VO인가? | 아니다. 가변 객체라서 VO 정의에 맞지 않는다. |
| `model`이라는 이름이 틀렸나? | 아니다. MyBatis 관례상 가장 흔한 표현이다. |
| 이상적인 이름은? | Entity 역할이면 `entity/`, 응답용이면 `dto/response/` |
| 지금 당장 바꿔야 하나? | MVP 완성 후 리팩토링 단계에서 개선 예정 |

---

*관련 파일: `코드_설계_이유.md`, `코드_한줄씩_설명.md`*
