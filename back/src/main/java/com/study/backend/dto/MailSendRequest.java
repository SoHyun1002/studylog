package com.study.backend.dto;

public class MailSendRequest {
    private String to;
    private String subject;
    private String content;

    public MailSendRequest() {
        // 기본 생성자 (RequestBody 매핑용)
    }

    public MailSendRequest(String to, String subject, String content) {
        this.to = to;
        this.subject = subject;
        this.content = content;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}