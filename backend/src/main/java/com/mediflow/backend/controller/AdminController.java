package com.mediflow.backend.controller;

import com.mediflow.backend.dto.AdminStats;
import com.mediflow.backend.service.AdminStatsService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminStatsService adminStatsService;

    public AdminController(AdminStatsService adminStatsService) {
        this.adminStatsService = adminStatsService;
    }

    @GetMapping("/stats")
    public AdminStats getStats() {
        return adminStatsService.getStats();
    }
}