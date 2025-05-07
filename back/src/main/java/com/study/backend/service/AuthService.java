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
import java.util.HashMap;
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
     * AccessToken에는 uEmail, uName, uRole을 claims로 포함합니다.
     * Redis에는 RefreshToken과 사용자 정보를 저장합니다.
     *
     * @param request 로그인 요청 정보(이메일, 비밀번호)
     * @param httpResponse 쿠키를 추가할 HttpServletResponse
     * @return 로그인 성공/실패에 따른 ResponseEntity를 반환합니다.
     */
    public ResponseEntity<Map<String, Object>> handleLogin(LoginRequest request, HttpServletResponse httpResponse) {
        Optional<User> userOptional = findByuEmail(request.getuEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "잘못된 이메일 또는 비밀번호입니다."));
        }

        User user = userOptional.get();
        if (!checkPassword(request.getuPassword(), user.getuPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "잘못된 이메일 또는 비밀번호입니다."));
        }

        String accessToken = jwtToken.generateTokenWithClaims(user.getuEmail(), user.getuName(), user.getuRole());
        String refreshToken = jwtToken.generateRefreshToken(user.getuEmail());

        try {
            RedisUserInfo redisUserInfo = new RedisUserInfo(user.getuEmail(), user.getuName(), user.getuRole());
            String redisValue = objectMapper.writeValueAsString(redisUserInfo);
            redisTemplate.opsForValue().set("refresh:" + refreshToken, redisValue, java.time.Duration.ofDays(7));
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "서버 내부 오류가 발생했습니다."));
        }

        RefreshToken tokenEntity = new RefreshToken();
        tokenEntity.setToken(refreshToken);
        tokenEntity.setuId(user.getuId());
        tokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(tokenEntity);

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
        httpResponse.addCookie(refreshTokenCookie);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("uEmail", user.getuEmail());
        response.put("uName", user.getuName());
        response.put("uRole", user.getuRole());

        return ResponseEntity.ok(response);
    }







    /**
     * 리프레시 토큰을 검증하고 새로운 액세스 토큰을 발급합니다.
     *
     * @param refreshToken 클라이언트로부터 전달받은 리프레시 토큰
     * @return 새로 발급된 액세스 토큰 또는 오류 메시지를 담은 ResponseEntity를 반환합니다.
     */
    public ResponseEntity<Map<String, Object>> handleRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "리프레시 토큰이 존재하지 않습니다."));
        }

        String redisKey = "refresh:" + refreshToken;
        String redisValue = redisTemplate.opsForValue().get(redisKey);

        if (redisValue == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "유효하지 않거나 만료된 리프레시 토큰입니다."));
        }

        try {
            RedisUserInfo userInfo = objectMapper.readValue(redisValue, RedisUserInfo.class);
            String newAccessToken = jwtToken.generateTokenWithClaims(userInfo.getuEmail(), userInfo.getuName(), userInfo.getuRole());

            System.out.println("🔄 새로운 AccessToken 발급 완료: " + newAccessToken);

            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "토큰 역직렬화에 실패했습니다."));
        }
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

    /**
     * 비밀번호를 인코딩합니다.
     */
    public String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }

}