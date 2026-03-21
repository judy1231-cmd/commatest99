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
}
