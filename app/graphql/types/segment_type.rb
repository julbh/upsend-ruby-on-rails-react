# frozen_string_literal: true

module Types
  class SegmentType < Types::BaseObject
    field :id, Int, null: true
    # field :app, [Types::AppType], null: true
    field :name, String, null: true
    field :properties, Types::JsonType, null: true
    field :predicates, [Types::PredicateType], null: true
    field :config_table_columns, Types::JsonType, null: true
  end
end
