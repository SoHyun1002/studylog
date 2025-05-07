package com.study.backend.controller;

import com.study.backend.dto.MailSendRequest;
import com.study.backend.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling mail-related API requests.
 */
@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    @PostMapping("/send-verification")
    public ResponseEntity<String> sendVerificationCode(@RequestParam String email) {
        mailService.sendVerificationCode(email);
        return ResponseEntity.ok("인증 코드가 이메일로 발송되었습니다.");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestParam String email, @RequestParam String code) {
        boolean result = mailService.verifyCode(email, code);
        if (result) {
            return ResponseEntity.ok("이메일 인증 성공");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패");
        }
    }
}
