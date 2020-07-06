class AddSourceToAppUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :app_users, :source, :string
  end
end
