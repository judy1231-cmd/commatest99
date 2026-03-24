package com.comma.domain.challenge.service;

import com.comma.domain.challenge.mapper.ChallengeMapper;
import com.comma.domain.challenge.model.Challenge;
import com.comma.domain.challenge.model.ChallengeParticipant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeMapper challengeMapper;

    public List<Challenge> getChallenges(String commaNo) {
        return challengeMapper.findAll(commaNo);
    }

    public Challenge getChallenge(Long id, String commaNo) {
        Challenge challenge = challengeMapper.findById(id, commaNo);
        if (challenge == null) throw new IllegalArgumentException("챌린지를 찾을 수 없습니다.");
        return challenge;
    }

    public List<Challenge> getMyChallenges(String commaNo) {
        return challengeMapper.findMyJoined(commaNo);
    }

    @Transactional
    public Map<String, Object> toggleJoin(Long challengeId, String commaNo) {
        boolean alreadyJoined = challengeMapper.countParticipant(challengeId, commaNo) > 0;
        if (alreadyJoined) {
            challengeMapper.deleteParticipant(challengeId, commaNo);
            return Map.of("joined", false);
        } else {
            ChallengeParticipant participant = new ChallengeParticipant();
            participant.setChallengeId(challengeId);
            participant.set쉼표번호(commaNo);
            participant.setAchievedDays(0);
            participant.setStatus("ongoing");
            challengeMapper.insertParticipant(participant);
            return Map.of("joined", true);
        }
    }

    // 관리자
    public List<Challenge> getAllForAdmin() {
        return challengeMapper.findAllForAdmin();
    }

    @Transactional
    public void updateIsActive(Long id, boolean isActive) {
        challengeMapper.updateIsActive(id, isActive);
    }

    // ==================== 인증 ====================

    @Transactional
    public Map<String, Object> certifyToday(Long challengeId, String commaNo, String memo, String photoUrl) {
        Long participantId = challengeMapper.findParticipantId(challengeId, commaNo);
        if (participantId == null) throw new IllegalArgumentException("참여 중인 챌린지가 아닙니다.");

        if (challengeMapper.findTodayProgress(participantId) != null)
            throw new IllegalStateException("오늘은 이미 인증하셨습니다.");

        challengeMapper.insertProgress(participantId, memo != null ? memo : "", photoUrl);
        challengeMapper.incrementAchievedDays(participantId);
        challengeMapper.completeIfDone(participantId);

        Challenge updated = challengeMapper.findById(challengeId, commaNo);
        boolean completed = "completed".equals(updated.getMyStatus());
        return Map.of(
            "achievedDays", updated.getMyAchievedDays() != null ? updated.getMyAchievedDays() : 0,
            "durationDays", updated.getDurationDays(),
            "completed", completed,
            "todayCertified", true
        );
    }

    public Map<String, Object> getCertifyStatus(Long challengeId, String commaNo) {
        Long participantId = challengeMapper.findParticipantId(challengeId, commaNo);
        if (participantId == null) return Map.of("joined", false);

        boolean todayCertified = challengeMapper.findTodayProgress(participantId) != null;
        List<String> dates = challengeMapper.findProgressDates(participantId);
        return Map.of("joined", true, "todayCertified", todayCertified, "certifiedDates", dates);
    }
}
