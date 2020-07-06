# frozen_string_literal: true

module Mutations
  class UpdateAccountDetails < Mutations::BaseMutation
    field :current_user, Types::UserType, null: false
    field :errors, Types::JsonType, null: true
    argument :app_key, String, required: true
    argument :options, Types::JsonType, required: true

    def resolve(app_key:, options:)
      app = current_user.apps.find_by(key: app_key)

      if options["remove_photo"] == true
        current_user.avatar.purge
      elsif options["avatar"]
        permitted_options = options.permit(["avatar"])

        current_user.update(permitted_options) 
      else
        if options["first_name"] || options['last_name']
          name = options["first_name"].to_s + " #{options['last_name'].to_s}"
          options["name"] = name
        end

        permitted_options = options.permit(
          ["name", "email", "password", "current_password", "first_name", "last_name"]
        )
        current_user.update_with_password(permitted_options) 
      end
      { current_user: current_user, errors: current_user.errors }
    end

    def current_user
      context[:current_user]
    end
  end
end