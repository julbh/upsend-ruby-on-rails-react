class AddColumnsStatesCampaigns < ActiveRecord::Migration[6.0]
  def change
    add_column :campaigns, :config_table_columns, :jsonb
  end
end
