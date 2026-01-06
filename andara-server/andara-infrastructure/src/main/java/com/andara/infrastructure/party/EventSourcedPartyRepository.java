package com.andara.infrastructure.party;

import com.andara.domain.AggregateId;
import com.andara.domain.AggregateType;
import com.andara.domain.DomainEvent;
import com.andara.domain.party.Party;
import com.andara.domain.party.PartyId;
import com.andara.infrastructure.EventPublisher;
import com.andara.infrastructure.eventstore.EventStore;
import com.andara.infrastructure.repository.AbstractEventSourcedRepository;
import com.andara.infrastructure.snapshot.SnapshotRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Event-sourced repository implementation for Party aggregate.
 */
@Repository
public class EventSourcedPartyRepository 
    extends AbstractEventSourcedRepository<Party, PartyId>
    implements PartyRepository {

    private static final AggregateType PARTY_TYPE = AggregateType.of("Party");

    public EventSourcedPartyRepository(
        EventStore eventStore, 
        EventPublisher eventPublisher,
        SnapshotRepository snapshotRepository,
        @Value("${eventstore.snapshot.threshold:100}") int snapshotThreshold
    ) {
        super(eventStore, eventPublisher, snapshotRepository, snapshotThreshold);
    }

    @Override
    public void save(Party party) {
        List<DomainEvent> events = party.getUncommittedEvents();
        save(party, events);
    }

    @Override
    protected AggregateId toAggregateId(PartyId id) {
        return AggregateId.of(id.value().toString());
    }

    @Override
    protected AggregateType getAggregateType() {
        return PARTY_TYPE;
    }

    @Override
    protected Party createEmpty(PartyId id) {
        return Party.empty(id);
    }
}
