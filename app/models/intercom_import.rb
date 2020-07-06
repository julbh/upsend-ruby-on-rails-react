class IntercomImport < ApplicationRecord

  has_one_attached :avatar
  has_one_attached :errored_data
  belongs_to :app
  belongs_to :agent
  belongs_to :app_package_integration 
  


  def generate_errored_csv
    if failed_rows.present?
      failed = eval(self.failed_rows)
      f = CSV.open("data.csv", "wb") do |csv|
        failed.each do |hash|
          csv << hash.values
        end
      end
      self.errored_data.attach(io: File.open('data.csv'), filename: "data.csv")
      self.save
    end  
  end



  def error_file_path 
    if Rails.application.config.active_storage.service == :amazon  
      errored_data.service_url
    else
      ActiveStorage::Blob.service.path_for(errored_data.key) 
    end
  end

end
