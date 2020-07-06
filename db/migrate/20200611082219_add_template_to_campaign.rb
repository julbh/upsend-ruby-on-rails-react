class AddTemplateToCampaign < ActiveRecord::Migration[6.0]
  def change
    add_column :campaigns, :template, :integer
  end
end
