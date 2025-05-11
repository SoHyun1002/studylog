package com.study.backend.service;

import com.study.backend.entity.User;
import com.study.backend.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserDeletionSchedulerService {
    private static final Logger log = LoggerFactory.getLogger(UserDeletionSchedulerService.class);
    private static final int RETENTION_PERIOD_DAYS = 30;

    private final UserRepository userRepository;

    public UserDeletionSchedulerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    @Transactional
    public void processSoftDeletedUsers() {
        log.info("소프트 삭제된 사용자 처리 시작");
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(RETENTION_PERIOD_DAYS);
        List<User> usersToDelete = userRepository.findByDeletedAtBefore(cutoffDate);
        
        for (User user : usersToDelete) {
            log.info("사용자 삭제 처리: userId={}, email={}, deletedAt={}", 
                    user.getuId(), user.getuEmail(), user.getDeletedAt());
            userRepository.delete(user);
        }
        
        log.info("소프트 삭제된 사용자 처리 완료: {}명 삭제됨", usersToDelete.size());
    }
} 