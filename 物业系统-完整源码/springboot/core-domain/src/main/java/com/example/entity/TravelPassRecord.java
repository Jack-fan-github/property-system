package com.example.entity;

import lombok.Data;
import java.util.Date;

@Data
public class TravelPassRecord {
    private Long id;
    private Long userId;
    private String username;
    private String nickname;
    private String avatar;
    private Long employeeId;
    private Boolean hasVehicle;
    private String plateNumber;
    private Date issueTime;
    private Date expireTime;
    private Date entryTime;
    private Date exitTime;
    private String status;
}
