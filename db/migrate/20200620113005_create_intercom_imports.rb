class CreateIntercomImports < ActiveRecord::Migration[6.0]
  def change
    create_table :intercom_imports do |t|

      t.integer :app_id
      t.integer :agent_id
      t.integer :integration_id

      t.string :name
      t.string :token

      t.boolean :import_contacts
      t.boolean :import_conversations
      t.boolean :contacts_imported, default: false
      t.boolean :conversations_imported, default: false

      t.string :state, default: "pending"
      t.string :errored_with_message
      t.string :last_processed_page
      t.string :last_processed_table_name

      
      
      t.jsonb :last_processed_page_field 
      t.text :failed_rows
      
      t.timestamps
    end
  end
end
