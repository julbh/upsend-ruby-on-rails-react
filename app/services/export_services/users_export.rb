# frozen_string_literal: true

module ExportServices
  class UsersExport
    attr_accessor :app_key, :users_id, :all_selected

    # initialize with
    # ExportServices::UserExport.new(app_key: "122334456", users_id: [21, 23])

    # ExportServices::UserExport.new(app_key: "122334456", users_id: [21, 23]).call
    HEADERS = ["Name", "Type", "Owner", "Conversation Rating", "Email", "Phone", "User Id", "First seen", "Last seen"]
    
    FILE_PATH = "#{Rails.root}/public/user_data.csv"

    def initialize(app_key:, users_id:, all_selected:)
      @app_key = app_key
      @users_id = users_id
      @all_selected = all_selected
    end

    def call
      app = App.find_by(key: app_key)
      @app_users = if all_selected
        app.app_users.unarchived
      else
        app.app_users.where(id: users_id)
      end
      generate_csv_file
    end

    private

    def generate_csv_file
      CSV.open(FILE_PATH, 'w', write_headers: true, headers: HEADERS) do |writer|
        @app_users.each do |app_user|
          writer << [
            app_user.name,
            app_user.type,
            "",
            "",
            app_user.email,
            "Unknown",
            app_user.id,
            to_iso8601(app_user.first_seen),
            to_iso8601(app_user.last_seen)
          ]
        end
      end
    end

    def to_iso8601(data)
      data.present? ? data.iso8601 : "" 
    end
  end
end
