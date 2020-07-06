module Types
  class PlanType < Types::BaseObject 
    field :id, ID, null: false
    field :name, String, null: false
    field :stripe_plan_id, String, null: false  
    field :amount, String, null: false 
    field :seats, String, null: true 

    def seats
      object.seats.blank? ? 0 : object.seats 
    end

    def amount
      object.amount 
    end

  end
end
