package com.comma.domain.contents.service;

import com.comma.domain.contents.mapper.ContentsMapper;
import com.comma.domain.contents.model.Contents;
import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.diagnosis.model.DiagnosisResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentsService {

    private final ContentsMapper contentsMapper;
    private final DiagnosisMapper diagnosisMapper;

    public List<Contents> getContents(String category) {
        if (category == null || category.isBlank() || category.equals("all")) {
            return contentsMapper.findAll();
        }
        return contentsMapper.findByCategory(category);
    }

    // 진단 결과 기반 맞춤 추천 — 주요 유형 콘텐츠 우선, 나머지 보완
    public List<Contents> getRecommended(String 쉼표번호) {
        DiagnosisResult latest = diagnosisMapper.findLatestBy쉼표번호(쉼표번호);
        if (latest == null) {
            return contentsMapper.findAll();
        }

        String primaryType = latest.getPrimaryRestType();
        List<Contents> result = new ArrayList<>();

        // 주요 유형 콘텐츠 먼저
        result.addAll(contentsMapper.findByCategory(primaryType));

        // 나머지 유형 중 3개씩 보완
        List<String> otherTypes = List.of(
            "physical", "mental", "sensory", "emotional", "social", "nature", "creative"
        ).stream().filter(t -> !t.equals(primaryType)).toList();

        List<Contents> others = contentsMapper.findByCategories(otherTypes);
        // 각 유형별로 최대 1개씩만 추가 (다양성)
        java.util.Map<String, Boolean> seen = new java.util.HashMap<>();
        for (Contents c : others) {
            if (!seen.containsKey(c.getCategory())) {
                result.add(c);
                seen.put(c.getCategory(), true);
            }
        }
        return result;
    }
}
