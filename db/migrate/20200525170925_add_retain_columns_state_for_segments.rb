class AddRetainColumnsStateForSegments < ActiveRecord::Migration[6.0]
  def change 
    add_column :segments, :config_table_columns, :jsonb 
  end
end
