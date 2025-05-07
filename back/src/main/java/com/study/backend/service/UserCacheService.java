package com.study.backend.service;

import com.study.backend.entity.User;
import com.study.backend.repository.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.Optional;

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
     * @param uId 사용자 ID
     * @param updatedUser 변경할 사용자 정보
     * @return 업데이트된 User 객체
     */
    public User updateUser(Long uId, User updatedUser) {
        // DB에서 사용자 정보 조회
        User user = userRepository.findById(uId).orElseThrow();
        // 사용자 이름과 이메일을 변경
        user.setuName(updatedUser.getuName());
        user.setuEmail(updatedUser.getuEmail());
        user.setDeletedAt(updatedUser.getDeletedAt());  // deletedAt 필드 업데이트
        // 변경된 사용자 정보를 DB에 저장
        userRepository.save(user);
        // 캐시에도 사용자 정보 갱신
        redisTemplate.opsForValue().set("user:" + uId, user);
        redisTemplate.opsForValue().set("user:email:" + user.getuEmail(), user);  // 이메일로 조회하는 캐시도 갱신
        return user;
    }

    /**
     * 사용자 정보를 DB와 캐시에서 모두 삭제함
     * @param uId 사용자 ID
     */
    public void deleteUser(Long uId) {
        userRepository.deleteById(uId);
        redisTemplate.delete("user:" + uId); // 사용자 캐시 삭제
        redisTemplate.delete("user:token:" + uId); // ✅ 로그인 토큰 삭제
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
