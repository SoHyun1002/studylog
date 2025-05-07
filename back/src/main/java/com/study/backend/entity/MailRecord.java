package com.study.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class MailRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String toEmail;
    private String subject;
    private String content;
    private LocalDateTime sentAt;


    public MailRecord(String toEmail, String subject, String content) {
        this.toEmail = toEmail;
        this.subject = subject;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }

    public MailRecord() {

    }

    public Long getId() {
        return id;
    }

    public String getToEmail() {
        return toEmail;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }
}