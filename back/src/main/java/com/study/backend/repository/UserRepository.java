package com.study.backend.repository;

import com.study.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByuEmail(String uEmail);
    Optional<User> findByuId(Long uId);

}
