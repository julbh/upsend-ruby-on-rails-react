class AddCurrentPlanToApps < ActiveRecord::Migration[6.0]
  def change
  	add_column :apps, :stripe_plan_id, :string
  end
end
