package com.comma.domain.report.mapper;

import com.comma.domain.report.model.Report;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReportMapper {

    void insertReport(Report report);

    // 중복 신고 방지
    int countByReporterAndTarget(@Param("reporterId") String reporterId,
                                  @Param("targetType") String targetType,
                                  @Param("targetId") Long targetId);

    // 관리자용 목록
    List<Report> findAll(@Param("status") String status,
                          @Param("offset") int offset,
                          @Param("size") int size);

    int countAll(@Param("status") String status);

    void updateStatus(@Param("id") Long id, @Param("status") String status);
}
