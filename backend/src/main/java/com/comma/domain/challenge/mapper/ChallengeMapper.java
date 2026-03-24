package com.comma.domain.challenge.mapper;

import com.comma.domain.challenge.model.Challenge;
import com.comma.domain.challenge.model.ChallengeParticipant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChallengeMapper {

    // 전체 챌린지 목록 (참여자 수 + 내 참여 여부 포함)
    List<Challenge> findAll(@Param("commaNo") String commaNo);

    // 챌린지 단건
    Challenge findById(@Param("id") Long id, @Param("commaNo") String commaNo);

    // 내가 참여 중인 챌린지
    List<Challenge> findMyJoined(@Param("commaNo") String commaNo);

    // 참여 여부 확인
    int countParticipant(@Param("challengeId") Long challengeId, @Param("commaNo") String commaNo);

    // 참여 등록
    void insertParticipant(ChallengeParticipant participant);

    // 참여 취소 (탈퇴)
    void deleteParticipant(@Param("challengeId") Long challengeId, @Param("commaNo") String commaNo);

    // 관리자용 — 전체 목록 (비활성 포함)
    List<Challenge> findAllForAdmin();

    // 관리자용 — 활성화/비활성화
    void updateIsActive(@Param("id") Long id, @Param("isActive") boolean isActive);

    // ==================== 인증 ====================

    // 참여자 레코드 ID 조회
    Long findParticipantId(@Param("challengeId") Long challengeId, @Param("commaNo") String commaNo);

    // 오늘 인증 여부 확인
    Long findTodayProgress(@Param("participantId") Long participantId);

    // 인증 등록
    void insertProgress(@Param("participantId") Long participantId, @Param("memo") String memo, @Param("photoUrl") String photoUrl);

    // 달성일수 +1
    void incrementAchievedDays(@Param("participantId") Long participantId);

    // 달성일수 충족 시 completed 처리
    void completeIfDone(@Param("participantId") Long participantId);

    // 인증 날짜 목록 (달력용)
    List<String> findProgressDates(@Param("participantId") Long participantId);
}
