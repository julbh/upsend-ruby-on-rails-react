# frozen_string_literal: true

module Mutations
  module AppUsers
    class ArchivedUsers < Mutations::BaseMutation
      field :app_users, [Types::AppUserType], null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :users_id, [Int], required: true
      argument :all_selected, Boolean, required: true

      def resolve(app_key:, users_id:, all_selected:)
        app = App.find_by(key: app_key)
        app_users = if all_selected
          app.app_users.unarchived
        else
          app.app_users.where(id: users_id)
        end
        app_users.each do |app_user|
          if !app_user.archived?
            app_user.archive!
          end
        end
        { app_users: app_users, errors: "" }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
