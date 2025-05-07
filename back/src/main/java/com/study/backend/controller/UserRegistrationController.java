package com.study.backend.controller;

import com.study.backend.service.UserRegistrationService;
import com.study.backend.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.annotation.Validated;

/**
 * 사용자 회원가입을 처리하는 컨트롤러입니다.
 *
 * 사용자가 회원가입을 요청할 때, 해당 요청을 UserRegistrationService로 전달하여 사용자 정보를 저장합니다.
 */
@RestController
@RequestMapping("/api/users")
@Validated
public class UserRegistrationController {
    private static final Logger log = LoggerFactory.getLogger(UserRegistrationController.class);

    private final UserRegistrationService userRegistrationService;

    // UserRegistrationService를 주입받아 사용자 등록 요청을 처리합니다.
    public UserRegistrationController(UserRegistrationService userRegistrationService) {
        this.userRegistrationService = userRegistrationService;
    }

    /**
     * 회원가입 요청을 처리하는 엔드포인트입니다.
     *
     * 클라이언트로부터 사용자 정보를 받아 UserRegistrationService를 통해 DB에 저장합니다.
     *
     * @param user 요청 본문에 포함된 사용자 정보
     * @return 저장된 사용자 정보를 포함한 응답
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody User user) {
        return userRegistrationService.registerUser(user);
    }

    @PostMapping("/verify-email/{email}")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @PathVariable String email,
            @RequestParam String token) {
        return userRegistrationService.verifyEmail(email, token);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("예외 발생", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "서버 오류가 발생했습니다: " + e.getMessage()));
    }
}
