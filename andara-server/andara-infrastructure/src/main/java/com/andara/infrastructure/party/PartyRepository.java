package com.andara.infrastructure.party;

import com.andara.domain.party.Party;
import com.andara.domain.party.PartyId;

/**
 * Repository interface for Party aggregate.
 */
public interface PartyRepository {
    void save(Party party);
    Party load(PartyId partyId);
    boolean exists(PartyId partyId);
}
