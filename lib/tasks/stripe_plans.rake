namespace :stripe_plans do
  desc "Creating stripe account plans"
  task :create => :environment do
    if Rails.env.development?
      Plan.delete_all
       

      loop do
        splans = Stripe::Plan.list 
        Stripe::Plan.list.each{|pl| pl.delete}  
        finished = splans.blank? || (splans && !splans.has_more)
        puts "deleting plans"
        if finished 
          break       
        end
      end

      loop do
        sproducts = Stripe::Product.list 
        Stripe::Product.list.each{|pl| pl.delete} 
        finished = sproducts.blank? || (sproducts && !sproducts.has_more)
        puts "deleting products"
        if finished 
          break        
        end
      end 
    end


    [{
      name: "Basic",
      interval: 0,
      amount_cents: 0,
      amount_currency: "USD", 
      trial_days: 0,
      stripe_plan_id: "free-plan",
      stripe_product_id: "product-free-monthly", 
      seats: "2"
    },
    {
      name: "Pro", 
      interval: 0,
      amount_cents: (25*100),
      amount_currency: "USD", 
      trial_days: ENV["TRIAL_DAYS"],
      stripe_plan_id: "standard-monthly",
      stripe_product_id: "product-standard-monthly",
      seats: "4", 
    },
    {
      name: "Unlimited", 
      interval: 0, 
      amount_cents: (95 * 100),
      amount_currency: "USD", 
      trial_days: ENV["TRIAL_DAYS"],
      stripe_plan_id: "premium-monthly",
      stripe_product_id: "product-premium-monthly",
      seats: "unlimited" 
    }].each do |product| 
      Plan.create!(product) 
    end



    Plan.all.each do |plan|
        # try to create a plan
        interval = "month" if plan.interval == "monthly"
        interval = "year" if plan.interval == "yearly"
        
        nickname = plan.name + " Plan (#{plan.interval})" 
        begin
            my_plan = Stripe::Plan.create(
              :id => plan.stripe_plan_id,
              :amount => plan.amount_cents,
              :interval => interval,
              :nickname => nickname,
              :product => { id: plan.stripe_product_id, name: nickname},
              :currency => "usd", 
              :trial_period_days => plan.trial_days
            )
            puts my_plan
            # catch any invalid request errors
        rescue Stripe::InvalidRequestError => e
            puts e.json_body[:error]
        end
    end


  end
end

 