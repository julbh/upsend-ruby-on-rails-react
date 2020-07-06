class ImportContact < ApplicationRecord

  has_one_attached :avatar
  has_one_attached :errored_data
  belongs_to :app
  belongs_to :agent
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i

  def reserved_column?(column_name)
    ["type"].include?(column_name) 
  end

  def process_csv
    #csv_data = avatar.download

    csv_file_path = avatar_path

    if Rails.application.config.active_storage.service == :amazon
      csv_file_path = open(csv_file_path,'r')
    end

    camelcase_headers = Proc.new {|headers|
      headers.map{|x| x.strip.downcase.gsub(/(\s|\-)+/,'_').split('_').map(&:capitalize).join }
    }

    headers = []
    table_columns = {}
    mapping_fields.each do |x| 
      column_name = (x["value"].present? && x["value"] != 'skip_this_field') ? x["value"].strip.downcase : "skip_#{SecureRandom.base64(4)}"
      headers << column_name
      table_columns[column_name] = (!reserved_column?(column_name) && AppUser.column_names.include?(column_name) ) 
    end

    options = { 
      headers_in_file: false,
      user_provided_headers: headers,
      col_sep: column_separator
    }
    set = SmarterCSV.process(csv_file_path, options)
  


    failed_rows = []
    set.each do |row|
      begin
        email_address = row["email"].strip rescue ''
        # if email_address.blank?
        #   email_address = "#{Digest::SHA1.hexdigest("some-random-string")[8..16]}@xyz.com"
        #   row["email"] = email_address
        # end

        raise StandardError.new("Invalid email address") if !valid_email(email_address)
        contact = app.app_users.find_by_email(email_address) if email_address.present?

        contact = app.app_users.find_by_email(email_address) if email_address.present?
        contact = app.app_users.build(type: 'Lead') if !contact
        contact.source = "import_csv"
        contact.skip_callbacks = true

        
        if mapping_model.downcase == "appuser" 
          contact.type = "AppUser" #needs to be set explicitly 
        end


        headers.each do |column_key|   
          column_exists = table_columns[column_key]
          if column_exists  
            if column_key == "email"
              contact[column_key] = email_address
            else
              contact[column_key] = row[column_key] if column_value_valid?(row[column_key])
            end
          elsif !column_key.starts_with?("skip_") 
            contact.properties[column_key] = row[column_key] if column_value_valid?(row[column_key])
          end
        end
        contact.save! if contact.email.present? || contact.properties.present?

      rescue => e 
        p e.message
        failed_rows << row
      end 
    end

    if failed_rows.present?
      self.state = "errors"
      self.failed_rows = failed_rows.to_s 
    else
      self.state = "completed"
    end 
    self.save

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

    CampaignMailer.import_processed(self).deliver_now

  end

  def valid_email(v) 
    v.present? && v.match?(VALID_EMAIL_REGEX)
  end



  def column_value_valid?(v) 
    v.present? && !["nil","NULL"].include?(v.strip)
  end

  def avatar_path  
    if Rails.application.config.active_storage.service == :amazon
      avatar.service_url 
    else
      ActiveStorage::Blob.service.path_for(avatar.key)  
    end
  end

  def error_file_path 
    if Rails.application.config.active_storage.service == :amazon  
      errored_data.service_url
    else
      ActiveStorage::Blob.service.path_for(errored_data.key) 
    end
  end

  def perfom_csv_job
    self.state = 'processing'
    save
    CsvImportJob.perform_later(self)
  end

end
