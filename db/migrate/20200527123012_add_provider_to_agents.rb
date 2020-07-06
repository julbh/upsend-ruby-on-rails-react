class AddProviderToAgents < ActiveRecord::Migration[6.0]
  def change
    add_column :agents, :provider, :string
    add_column :agents, :uid, :string
  end
end
