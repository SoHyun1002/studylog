package com.study.backend.service;

import com.study.backend.entity.User;
import com.study.backend.component.JwtToken;
import com.study.backend.repository.UserRepository;
import com.study.backend.repository.RefreshTokenRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;

@Service
public class UserDeletionService {
    private static final Logger log = LoggerFactory.getLogger(UserDeletionService.class);

    private final UserRepository userRepository;
    private final JwtToken jwtToken;
    private final RefreshTokenRepository refreshTokenRepository;

    public UserDeletionService(UserRepository userRepository,
                             JwtToken jwtToken,
                             RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.jwtToken = jwtToken;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public ResponseEntity<Map<String, String>> deleteAccount(String type, String uEmail, String token) {
        try {
            log.info("계정 삭제 요청 - type: {}, email: {}", type, uEmail);

            if (token == null || !token.startsWith("Bearer ")) {
                log.error("인증 토큰이 없거나 잘못된 형식입니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "인증이 필요합니다."));
            }

            String accessToken = token.substring(7);
            String tokenEmail = jwtToken.getUserEmail(accessToken);
            log.info("토큰에서 추출한 이메일: {}", tokenEmail);

            if (!tokenEmail.equals(uEmail)) {
                log.error("토큰의 이메일({})과 요청의 이메일({})이 일치하지 않습니다.", tokenEmail, uEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "다른 사용자의 계정을 삭제할 수 없습니다."));
            }

            Optional<User> userOpt = userRepository.findByuEmail(uEmail);
            if (userOpt.isEmpty()) {
                log.error("사용자를 찾을 수 없습니다: {}", uEmail);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "사용자를 찾을 수 없습니다."));
            }

            User user = userOpt.get();
            if ("SOFT".equalsIgnoreCase(type)) {
                LocalDateTime now = LocalDateTime.now();
                log.info("소프트 삭제 - deletedAt 설정 시간: {}", now);
                user.setDeletedAt(now);
                userRepository.save(user);
                log.info("소프트 삭제 완료 - email: {}, deletedAt: {}", uEmail, user.getDeletedAt());
                
                // 캐시 무효화
                refreshTokenRepository.deleteByuId(user.getuId());
                log.info("리프레시 토큰 삭제 완료 - userId: {}", user.getuId());
                
                return ResponseEntity.ok(Map.of("message", "계정이 삭제되었습니다. 로그아웃됩니다."));
            } else if ("HARD".equalsIgnoreCase(type)) {
                userRepository.delete(user);
                log.info("하드 삭제 완료 - email: {}", uEmail);
                return ResponseEntity.ok(Map.of("message", "계정이 완전히 삭제되었습니다."));
            } else {
                log.error("잘못된 삭제 타입: {}", type);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "잘못된 삭제 타입입니다."));
            }
        } catch (Exception e) {
            log.error("계정 삭제 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "계정 삭제 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}