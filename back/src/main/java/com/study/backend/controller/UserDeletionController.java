package com.study.backend.controller;

import com.study.backend.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserDeletionController {
    private static final Logger log = LoggerFactory.getLogger(UserDeletionController.class);

    private final AccountService accountService;

    public UserDeletionController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/delete/{uEmail}")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @PathVariable String uEmail,
            @RequestHeader("Authorization") String token) {
        return accountService.deleteAccount(null, uEmail, token);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("예외 발생", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "서버 오류가 발생했습니다: " + e.getMessage()));
    }
}
