package com.example.entity.repair;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;


public class RepairFile {
    private Long fileId;       // 文件ID
    private Long orderId;      // 所属报修单ID
    private Long userID;      // ID
    private String fileUrl;    // 文件路径或URL
    private String fileType;   // 文件类型（image/video/other）
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime uploadedAt;   // 上传时间
    public RepairFile() {}
    public Long getFileId() {
        return fileId;
    }

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    // JSON/MyBatis compatibility: some clients use userId while the legacy
    // field is named userID.
    public Long getUserId() {
        return userID;
    }

    public void setUserId(Long userId) {
        this.userID = userId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    @Override
    public String toString() {
        return "RepairFile{" +
                "fileId=" + fileId +
                ", orderId=" + orderId +
                ", userID=" + userID +
                ", fileUrl='" + fileUrl + '\'' +
                ", fileType='" + fileType + '\'' +
                ", uploadedAt=" + uploadedAt +
                '}';
    }
}
