package com.study.backend.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public class UserCacheDto implements Serializable {
    private Long uId;
    private String uName;
    private String uEmail;
    private String uRole;
    private LocalDateTime deletedAt;

    public UserCacheDto() {}

    public UserCacheDto(Long uId, String uName, String uEmail, String uRole, LocalDateTime deletedAt) {
        this.uId = uId;
        this.uName = uName;
        this.uEmail = uEmail;
        this.uRole = uRole;
        this.deletedAt = deletedAt;
    }

    public static UserCacheDto fromUser(com.study.backend.entity.User user) {
        return new UserCacheDto(
            user.getuId(),
            user.getuName(),
            user.getuEmail(),
            user.getuRole(),
            user.getDeletedAt()
        );
    }

    // Getters and Setters
    public Long getUId() { return uId; }
    public void setUId(Long uId) { this.uId = uId; }
    public String getUName() { return uName; }
    public void setUName(String uName) { this.uName = uName; }
    public String getUEmail() { return uEmail; }
    public void setUEmail(String uEmail) { this.uEmail = uEmail; }
    public String getURole() { return uRole; }
    public void setURole(String uRole) { this.uRole = uRole; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
} 