package com.comma.domain.report.service;

import com.comma.domain.report.mapper.ReportMapper;
import com.comma.domain.report.model.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportMapper reportMapper;

    @Transactional
    public void submitReport(String reporterId, String targetType, Long targetId, String reason) {
        if (reportMapper.countByReporterAndTarget(reporterId, targetType, targetId) > 0) {
            throw new IllegalStateException("이미 신고한 콘텐츠예요.");
        }
        Report report = new Report();
        report.setReporterId(reporterId);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        reportMapper.insertReport(report);
    }

    public Map<String, Object> getReports(String status, int page, int size) {
        int offset = (page - 1) * size;
        List<Report> reports = reportMapper.findAll(status, offset, size);
        int total = reportMapper.countAll(status);
        return Map.of(
            "reports", reports,
            "total", total,
            "page", page,
            "totalPages", (int) Math.ceil((double) total / size)
        );
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        reportMapper.updateStatus(id, status);
    }
}
