# frozen_string_literal: true

class ExportUsersMailer < ApplicationMailer
  layout 'mailer'
  # default delivery_method: :ses
  #default "Message-ID" => lambda {"<#{SecureRandom.uuid}@davelocalhost>"}

  def export(user, file_name, file_path)
    return if user.blank?

    content_type = 'text/html'

    headers 'X-SES-CONFIGURATION-SET' => ENV['SNS_CONFIGURATION_SET']

    attachments[file_name] = File.read(file_path)
    
    mail(to: user.email,
         subject: "Your CSV Export is ready #{file_name}",
         content_type: content_type)
  end



  def intercom_import_complete(import_id)
    import = IntercomImport.find(import_id)

    to = import.agent.email
    app = import.app  
    @message = "#{app.name.to_s.capitalize}:  Your intercom import has been completed successfully. You will be able to access all the contacts on the platform page."
    if import.errored_with_message.present?
      @message = "#{app.name.to_s.capitalize}: Import from intercom has failed to process. #{import.errored_with_message}"
    end

    mail(from: "contact@upsend.io", to: to, subject: "Intercom import completed successfully") 

  end




end
