# frozen_string_literal: true

module Mutations
  module Leads
    class CreateLead < Mutations::BaseMutation
      field :lead, Types::AppUserType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :options, Types::JsonType, required: true

      def resolve(app_key:, options:)
        find_app(app_key)
        permitted_options = options.permit(["name", "email"])
        @lead = Lead.new(permitted_options)
        @lead.app = @app
        @lead.save
        { lead: @lead, errors: @lead.errors.full_messages }
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end
