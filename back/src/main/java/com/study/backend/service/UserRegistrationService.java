package com.study.backend.service;

import com.study.backend.entity.User;
import com.study.backend.repository.UserRepository;
import com.study.backend.component.JwtToken;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserRegistrationService {
    private static final Logger log = LoggerFactory.getLogger(UserRegistrationService.class);

    private final UserRepository userRepository;
    private final JwtToken jwtToken;
    private final PasswordEncoder passwordEncoder;

    public UserRegistrationService(UserRepository userRepository,
                                 JwtToken jwtToken,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtToken = jwtToken;
        this.passwordEncoder = passwordEncoder;
    }




    @Transactional
    public ResponseEntity<Map<String, String>> registerUser(User user) {
        try {
            log.info("회원가입 요청 - email: {}", user.getuEmail());

            Optional<User> existingUser = userRepository.findByuEmail(user.getuEmail());
            if (existingUser.isPresent()) {
                log.error("이미 존재하는 이메일입니다: {}", user.getuEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "이미 존재하는 이메일입니다."));
            }

            user.setuRole("USER");
            user.setuPassword(passwordEncoder.encode(user.getuPassword()));
            userRepository.save(user);
            log.info("회원가입 완료 - email: {}", user.getuEmail());

            return ResponseEntity.ok(Map.of(
                    "message", "회원가입이 완료되었습니다. 로그인해주세요."
            ));
        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "회원가입 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }


    @Transactional
    public ResponseEntity<Map<String, String>> verifyEmail(String email, String token) {
        try {
            log.info("이메일 인증 요청 - email: {}", email);

            Optional<User> userOpt = userRepository.findByuEmail(email);
            if (userOpt.isEmpty()) {
                log.error("사용자를 찾을 수 없습니다: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "사용자를 찾을 수 없습니다."));
            }

            User user = userOpt.get();

            log.info("이메일 인증 완료 - email: {}", email);

            // 이메일 인증 완료 후 JWT 발급
            String jwt = jwtToken.generateTokenWithClaims(user.getuEmail(), user.getuName(), user.getuRole());

            return ResponseEntity.ok(Map.of(
                    "message", "이메일 인증이 완료되었습니다.",
                    "token", jwt
            ));
        } catch (Exception e) {
            log.error("이메일 인증 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "이메일 인증 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
} 