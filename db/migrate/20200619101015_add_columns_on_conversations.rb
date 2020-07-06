class AddColumnsOnConversations < ActiveRecord::Migration[6.0]
  def change
  	add_column :app_users, :import_id, :string
  	add_column :conversations, :import_id, :string
  	add_column :conversation_parts, :import_id, :string
  end
end
