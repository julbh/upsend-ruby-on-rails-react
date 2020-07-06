# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    field :email, String, null: true
    field :avatar_url, String, null: true
    field :first_name, String, null: true
    field :last_name, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
  end
end
