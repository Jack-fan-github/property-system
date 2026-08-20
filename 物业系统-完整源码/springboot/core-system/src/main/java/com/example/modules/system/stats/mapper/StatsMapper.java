package com.example.modules.system.stats.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface StatsMapper {
    Integer countUsers();
    Integer countAdmins();
    List<Map<String, Object>> loginTrend(@Param("days") Integer days);
}
