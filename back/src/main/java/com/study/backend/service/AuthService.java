package com.study.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.study.backend.component.JwtToken;
import com.study.backend.dto.LoginRequest;
import com.study.backend.dto.RedisUserInfo;
import com.study.backend.entity.RefreshToken;
import com.study.backend.entity.User;
import com.study.backend.repository.RefreshTokenRepository;
import com.study.backend.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtToken jwtToken;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;


    /**
     * 의존성 주입을 위한 생성자입니다.
     * UserRepository, JwtToken, PasswordEncoder, RefreshTokenRepository를 주입받아 필드에 할당합니다.
     */
    public AuthService(UserRepository userRepository,
                       JwtToken jwtToken,
                       PasswordEncoder passwordEncoder,
                       RefreshTokenRepository refreshTokenRepository,
                       RedisTemplate<String, String> redisTemplate,
                       ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.jwtToken = jwtToken;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 사용자가 입력한 비밀번호와 DB에 저장된 암호화된 비밀번호가 일치하는지 확인합니다.
     *
     * @param rawPassword 사용자가 입력한 비밀번호(평문)
     * @param encodedPassword DB에 저장된 암호화된 비밀번호
     * @return 비밀번호가 일치하면 true, 아니면 false 반환
     */
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            throw new IllegalArgumentException("Password cannot be null");
        }
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * 이메일로 사용자 정보를 조회합니다.
     *
     * @param uEmail 조회할 사용자의 이메일
     * @return 해당 이메일을 가진 사용자가 있으면 Optional<User> 반환, 없으면 Optional.empty() 반환
     */
    public Optional<User> findByuEmail(String uEmail) {
        return userRepository.findByuEmail(uEmail);
    }

    /**
     * 로그인 처리를 담당하는 메서드입니다.
     * 로그인 성공 시 액세스 토큰과 리프레시 토큰을 생성하여 쿠키로 응답에 포함합니다.
     *
     * @param request 로그인 요청 정보(이메일, 비밀번호)
     * @param httpResponse 쿠키를 추가할 HttpServletResponse
     * @return 로그인 성공/실패에 따른 ResponseEntity를 반환합니다.
     */
    public ResponseEntity<Map<String, Object>> handleLogin(LoginRequest request, HttpServletResponse httpResponse) {
        Optional<User> userOptional = findByuEmail(request.getuEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error",  "Invalid email"));
        }

        User user = userOptional.get();
        if (!checkPassword(request.getuPassword(), user.getuPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid password"));
        }

        String accessToken = jwtToken.generateToken(user.getuEmail());
        String refreshToken = jwtToken.generateRefreshToken(user.getuEmail());

        RedisUserInfo redisUserInfo = new RedisUserInfo(
              user.getuEmail(),
              user.getuName()
        );

        try {
            String redisValue = objectMapper.writeValueAsString(redisUserInfo); //직렬화

            // Store both accessToken and refreshToken in Redis
            redisTemplate.opsForValue().set(accessToken, redisValue);
            redisTemplate.opsForValue().set(refreshToken, redisValue);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }


        System.out.println("✅ AccessToken: " + accessToken);
        System.out.println("✅ RefreshToken: " + refreshToken);

        // 리프레시 토큰을 저장합니다.
        RefreshToken tokenEntity = new RefreshToken();
        tokenEntity.setToken(refreshToken);
        tokenEntity.setUId(user.getuId());
        tokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(tokenEntity);

        System.out.println("📝 Redis에 저장된 RefreshToken: user:token:" + user.getuId() + " = " + refreshToken);

        // 리프레시 토큰만 HttpOnly 쿠키에 저장
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
        httpResponse.addCookie(refreshTokenCookie);

        // 응답 본문에 AccessToken만 반환
        return ResponseEntity.ok(
                Map.of("accessToken", accessToken)
        );
    }

    /**
     * 리프레시 토큰을 검증하고 새로운 액세스 토큰을 발급합니다.
     *
     * @param refreshToken 클라이언트로부터 전달받은 리프레시 토큰
     * @return 새로 발급된 액세스 토큰 또는 오류 메시지를 담은 ResponseEntity를 반환합니다.
     */
    public ResponseEntity<Map<String, Object>> handleRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token is missing"));
        }

        Optional<RefreshToken> tokenOptional = refreshTokenRepository.findByToken(refreshToken);
        if (tokenOptional.isEmpty() || tokenOptional.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired refresh token"));
        }

        RefreshToken token = tokenOptional.get();
        User user = userRepository.findByuId(token.getuId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtToken.generateToken(user.getuEmail());

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    /**
     * 요청으로부터 accessToken 쿠키 값을 추출합니다.
     *
     * @param request HttpServletRequest 객체
     * @return accessToken 쿠키 값이 있으면 반환, 없으면 null 반환
     */
    public String resolveToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    /**
     * 로그아웃 처리를 담당하는 메서드입니다.
     * 액세스 토큰, 리프레시 토큰 쿠키를 만료시킵니다.
     *
     * @param request  HttpServletRequest 객체
     * @param response HttpServletResponse 객체
     */
    public void handleLogout(HttpServletRequest request, HttpServletResponse response) {
        String token = resolveToken(request);
        System.out.println("Resolved token: " + token);

        // 쿠키 제거: 유효시간 0으로 설정
        Cookie jwtCookie = new Cookie("accessToken", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // 즉시 만료
        response.addCookie(jwtCookie);

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0); // 즉시 만료
        response.addCookie(refreshCookie);
    }

}