package com.example.modules.system.stats.service;

import com.example.modules.system.stats.mapper.StatsMapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {
    @Resource
    private StatsMapper statsMapper;

    public Map<String, Object> overview() {
        Map<String, Object> map = new HashMap<>();
        map.put("userCount", statsMapper.countUsers());
        map.put("adminCount", statsMapper.countAdmins());
        return map;
    }

    public Map<String, Object> trend(Integer days) {
        Map<String, Object> map = new HashMap<>();
        map.put("login", normalize(statsMapper.loginTrend(days)));
        return map;
    }

    private List<Map<String, Object>> normalize(List<Map<String, Object>> list) {
        return list;
    }
}
