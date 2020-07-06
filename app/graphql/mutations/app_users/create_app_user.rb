# frozen_string_literal: true

module Mutations
  module AppUsers
    class CreateAppUser < Mutations::BaseMutation
      field :app_user, Types::AppUserType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :options, Types::JsonType, required: true

      def resolve(app_key:, options:)
        app = current_user.apps.find_by(key: app_key)

        permitted_options = options.permit(
          ["name", "email"]
        )

        app_user = app.app_users.build(permitted_options)
        app_user.type = "AppUser"
        app_user.save
        { app_user: app_user, errors: app_user.errors.full_messages }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end