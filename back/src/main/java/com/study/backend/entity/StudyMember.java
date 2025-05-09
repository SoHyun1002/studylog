package com.example.study_group_page.entity;

import com.study.backend.entity.StudyGroup;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class StudyMember {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private StudyGroup study;


    private Long userId; // 실제 유저 테이블이 있다면 @ManyToOne(User)로 변경 가능

    private String status; // "대기", "수락"

    private LocalDateTime appliedAt;

    @PrePersist
    public void setAppliedAt() {
        this.appliedAt = LocalDateTime.now();
    }
}
