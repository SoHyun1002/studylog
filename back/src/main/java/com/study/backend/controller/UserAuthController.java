/**
 * 사용자 인증 관련 요청을 처리하는 컨트롤러입니다.
 *
 * 로그인, 리프레시 토큰을 통한 액세스 토큰 재발급, 로그아웃, 사용자 정보 조회 기능을 포함합니다.
 */
package com.study.backend.controller;

import com.study.backend.dto.LoginRequest;
import com.study.backend.entity.User;
import com.study.backend.service.AuthService;
import com.study.backend.service.UserCacheService;
import com.study.backend.component.JwtToken;
import com.study.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.time.LocalDateTime;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import com.study.backend.entity.RefreshToken;
import com.study.backend.repository.RefreshTokenRepository;
import com.study.backend.dto.RedisUserInfo;

@RestController
@RequestMapping("/api/users")
public class UserAuthController {

    private final AuthService authService;
    private final UserCacheService userCacheService;
    private final UserRepository userRepository;
    private final JwtToken jwtToken;
    private static final Logger log = LoggerFactory.getLogger(UserAuthController.class);
    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final RefreshTokenRepository refreshTokenRepository;

    // 인증 서비스와 사용자 조회 서비스 주입
    public UserAuthController(AuthService authService, 
                            UserCacheService userCacheService, 
                            UserRepository userRepository,
                            JwtToken jwtToken, 
                            ObjectMapper objectMapper, 
                            RedisTemplate<String, String> redisTemplate, 
                            RefreshTokenRepository refreshTokenRepository) {
        this.authService = authService;
        this.userCacheService = userCacheService;
        this.userRepository = userRepository;
        this.jwtToken = jwtToken;
        this.objectMapper = objectMapper;
        this.redisTemplate = redisTemplate;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * 사용자 로그인 요청을 처리합니다.
     * 이메일과 비밀번호를 검증하고, 액세스 토큰 및 리프레시 토큰을 쿠키에 저장합니다.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request, HttpServletResponse httpResponse) {
        ResponseEntity<Map<String, Object>> loginResponse = authService.handleLogin(request, httpResponse);

        ResponseCookie cookie = ResponseCookie.from("cookieName", "cookieValue")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .build();
        httpResponse.addHeader("Set-Cookie", cookie.toString());

        return loginResponse;
    }



    /**
     * 리프레시 토큰을 사용해 새로운 액세스 토큰을 발급받는 요청을 처리합니다.
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshAccessToken(
            @CookieValue(value = "refreshToken", required = false) String refreshToken) {
        return authService.handleRefreshToken(refreshToken);
    }


    /**˜
     * 로그아웃 요청을 처리합니다.
     * 쿠키에서 액세스 토큰을 제거하여 클라이언트 측 인증 상태를 만료시킵니다.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse httpResponse) {
        authService.handleLogout(request, httpResponse);
        return ResponseEntity.ok().build();
    }

    /**
     * 사용자 ID를 이용해 사용자 정보를 조회합니다.
     *
     * @param uId 사용자 ID
     * @return 사용자 정보
     */
    @GetMapping("/{uId}")
    public ResponseEntity<User> getUser(@PathVariable("uId") Long uId) {
        return ResponseEntity.ok(userCacheService.getUserById(uId));
    }


    @PostMapping("/{uEmail}")
    public ResponseEntity<User> getUserByEmail(@PathVariable("uEmail") String uEmail) {
        Optional<User> user = userCacheService.findByuEmail(uEmail);
        return ResponseEntity.ok(user.orElse(null));
    }

    /**
     * 현재 로그인한 사용자의 정보를 조회합니다.
     * JWT 토큰에서 사용자 이메일을 추출하여 사용자 정보를 반환합니다.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        token = token.substring(7);
        
        try {
            if (!jwtToken.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String email = jwtToken.getUserEmail(token);
            System.out.println("Extracted email from token: " + email);
            
            Optional<User> userOpt = userCacheService.findByuEmail(email);
            if (userOpt.isEmpty()) {
                System.out.println("User not found for email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("uEmail", user.getuEmail());
            response.put("uName", user.getuName());
            response.put("uRole", user.getuRole());
            
            // deletedAt이 null이 아닐 경우에만 추가
            if (user.getDeletedAt() != null) {
                response.put("deletedAt", user.getDeletedAt().toString());
            } else {
                response.put("deletedAt", null);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error in getCurrentUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 현재 로그인한 사용자의 비밀번호를 검증합니다.
     */
    @PostMapping("/verify-password")
    public ResponseEntity<Map<String, Boolean>> verifyPassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = token.substring(7);
        String email = jwtToken.getUserEmail(accessToken);
        Optional<User> user = userCacheService.findByuEmail(email);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        boolean verified = authService.checkPassword(request.get("password"), user.get().getuPassword());
        return ResponseEntity.ok(Map.of("verified", verified));
    }

    /**
     * 현재 로그인한 사용자의 비밀번호를 변경합니다.
     */
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = token.substring(7);
        String email = jwtToken.getUserEmail(accessToken);
        Optional<User> userOpt = userCacheService.findByuEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOpt.get();
        String newPassword = request.get("newPassword");
        
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "새 비밀번호를 입력해주세요."));
        }

        // 새 비밀번호로 업데이트
        user.setuPassword(authService.encodePassword(newPassword));
        userCacheService.updateUser(user.getuId(), user);

        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateUser(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = token.substring(7);
        String email = jwtToken.getUserEmail(accessToken);
        Optional<User> userOpt = userCacheService.findByuEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOpt.get();
        String newName = request.get("uName");
        
        // 사용자 이름만 업데이트
        user.setuName(newName);
        userCacheService.updateUser(user.getuId(), user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "회원정보가 수정되었습니다.");
        return ResponseEntity.ok(response);
    }
}
