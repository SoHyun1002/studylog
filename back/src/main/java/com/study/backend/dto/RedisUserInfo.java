package com.study.backend.dto;

public class RedisUserInfo {
    private String uEmail;
    private String uName;
    private String uRole;

    public RedisUserInfo(String uEmail) {
        this.uEmail = uEmail;
    }

    public String getuEmail() {
        return uEmail;
    }

    public void setuEmail(String uEmail) {
        this.uEmail = uEmail;
    }

    public String getuName() {
        return uName;
    }

    public void setuName(String uName) {
        this.uName = uName;
    }

    public String getuRole() {
        return uRole;
    }

    public void setuRole(String uRole) {
        this.uRole = uRole;
    }

    // 모든 필드를 받는 생성자
    public RedisUserInfo(String uEmail, String uName, String uRole) {
        this.uEmail = uEmail;
        this.uName = uName;
        this.uRole = uRole;
    }



}