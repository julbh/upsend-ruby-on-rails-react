# frozen_string_literal: true

class SegmentFactory
  def self.create_segments_for(app)
    default_predicate = { type: 'match',
                          attribute: 'match',
                          comparison: 'and',
                          value: 'and' }.with_indifferent_access

    user_predicate = {
      attribute: 'type',
      comparison: 'eq',
      type: 'string',
      value: 'AppUser'
    }.with_indifferent_access

    lead_predicate = { attribute: 'type',
                       comparison: 'eq',
                       type: 'string',
                       value: 'Lead' }.with_indifferent_access

    app.segments.create([
                          { name: 'People', predicates: [default_predicate, user_predicate] },

                          { name: 'Companies', predicates: [default_predicate, lead_predicate] },

                          { name: 'Accounts', predicates: [default_predicate, user_predicate,
                                                               { attribute: 'last_visited_at',
                                                                 comparison: 'gt',
                                                                 type: 'date',
                                                                 value: '30 days ago' }.with_indifferent_access] },

                          { name: 'Conversations', predicates: [default_predicate, user_predicate,
                                                                { attribute: 'last_visited_at',
                                                                  comparison: 'gteq',
                                                                  type: 'date',
                                                                  value: '30 days ago' }.with_indifferent_access] }
                        ])
  end
end
