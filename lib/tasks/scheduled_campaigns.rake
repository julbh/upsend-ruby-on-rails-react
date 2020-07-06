namespace :scheduled_campaigns do
  desc "Campaign scheduled newsletters"
  task :execute => :environment do 
    Campaign.scheduled_newsletters_job
  end
end