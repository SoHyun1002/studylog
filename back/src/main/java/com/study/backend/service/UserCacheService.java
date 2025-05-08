package com.study.backend.service;

import com.study.backend.dto.RedisUserInfo;
import com.study.backend.entity.User;
import com.study.backend.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.Optional;
import java.util.Set;

@Service
public class UserCacheService {
    private final UserRepository userRepository;
    private final RedisTemplate<String, User> redisTemplate;

    public UserCacheService(UserRepository userRepository,
                            RedisTemplate<String, User> redisTemplate) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
    }

    /**
     * 사용자 정보를 캐시에서 조회하거나, 없으면 DB에서 조회 후 캐시에 저장함
     * @param uId 사용자 ID
     * @return User 객체
     */
    public User getUserById(Long uId) {
        // Redis 캐시에서 사용자 정보 조회
        User cached = redisTemplate.opsForValue().get("user:" + uId);
        if (cached != null) {
            // 탈퇴 처리된 사용자일 경우 예외 발생
            if (cached.getDeletedAt() != null) {
                throw new RuntimeException("User is marked for deletion");
            }
            return cached;
        }

        // 캐시에 없으면 DB에서 사용자 정보 조회
        User user = userRepository.findById(uId).orElseThrow();
        if (user.getDeletedAt() != null) {
            // 탈퇴 처리된 사용자일 경우 예외 발생
            throw new RuntimeException("User is marked for deletion");
        }
        // 조회된 사용자 정보를 캐시에 저장하지 않음 (필요시 추가 가능)
        return user;
    }

    /**
     * 사용자 정보를 업데이트하고 캐시도 갱신함
     * @param uEmail 사용자 Email
     * @param updatedUser 변경할 사용자 정보
     * @return 업데이트된 User 객체
     */
    public User updateUser(String uEmail, User updatedUser) {
        // DB에서 사용자 정보 조회
        User user = userRepository.findByuEmail(uEmail)
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        // 삭제된 사용자인 경우 수정 금지
        if (user.getDeletedAt() != null) {
            throw new RuntimeException("삭제된 사용자는 수정할 수 없습니다.");
        }

        // 사용자 이름만 변경 (이메일은 변경하지 않음)
        if (updatedUser.getuName() == null || updatedUser.getuName().trim().isEmpty()) {
            throw new RuntimeException("사용자 이름은 비어 있을 수 없습니다.");
        }

        user.setuName(updatedUser.getuName());

        // 변경된 사용자 정보를 DB에 저장
        userRepository.save(user);

        // 🔥 Redis 업데이트 (refreshToken 키 찾아서 수정)
        Set<String> keys = redisTemplate.keys("refreshToken:*");
        if (keys != null) {
            for (String key : keys) {
                RedisUserInfo userInfo = (RedisUserInfo) redisTemplate.opsForValue().get(key);
                if (userInfo != null && userInfo.getuEmail().equals(user.getuEmail())) {
                    // 이름만 수정
                    userInfo.setuName(user.getuName());
                    redisTemplate.opsForValue().set(key, userInfo);
                    break; // 찾았으면 더 찾을 필요 없음
                }
            }
        }
        redisTemplate.opsForValue().set("user:email:" + uEmail, user);

        return user;
    }



    public Optional<User> findByuEmail(String uEmail) {
        // Redis 캐시에서 사용자 정보 조회
        User cached = redisTemplate.opsForValue().get("user:email:" + uEmail);
        if (cached != null) {
            System.out.println("캐시에서 찾은 사용자 deletedAt: " + cached.getDeletedAt());
            return Optional.of(cached);
        }

        // 캐시에 없으면 DB에서 사용자 정보 조회
        Optional<User> user = userRepository.findByuEmail(uEmail);
        if (user.isPresent()) {
            User foundUser = user.get();
            System.out.println("DB에서 찾은 사용자 deletedAt: " + foundUser.getDeletedAt());
            // 조회된 사용자 정보를 캐시에 저장
            redisTemplate.opsForValue().set("user:email:" + uEmail, foundUser);
        }
        return user;
    }
}
