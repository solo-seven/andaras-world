package com.andara.application.party;

import com.andara.domain.party.Character;
import com.andara.domain.party.CharacterId;

/**
 * Repository interface for Character aggregate.
 */
public interface CharacterRepository {
    void save(Character character);
    Character load(CharacterId characterId);
    boolean exists(CharacterId characterId);
}

