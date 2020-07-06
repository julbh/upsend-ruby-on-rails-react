class CreateImportContacts < ActiveRecord::Migration[6.0]
  def change
    create_table :import_contacts do |t|
      t.integer :app_id
      t.integer :agent_id
      t.string :column_separator
      t.boolean :skip_header
      t.jsonb :mapping_fields
      t.string :mapping_model
      t.text :failed_rows
      t.string :state 
      t.timestamps
    end
  end
end
