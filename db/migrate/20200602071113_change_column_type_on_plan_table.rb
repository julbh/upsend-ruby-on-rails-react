class ChangeColumnTypeOnPlanTable < ActiveRecord::Migration[6.0]
  def change
  	change_column :plans, :seats, :string
  	remove_column :plans, :category
	remove_column :plans, :contacts
  	remove_column :plans, :emails
  	remove_column :plans, :additional_contacts
  	remove_column :plans, :additional_price_cents
  	remove_column :plans, :additional_emails
  	remove_column :plans, :parent_stripe_plan_id
  	remove_column :plans, :plan_type 
  	remove_column :plans, :amount_decimal  
  end
 

end
