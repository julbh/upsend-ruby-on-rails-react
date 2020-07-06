# frozen_string_literal: true

class CampaignMailer < ApplicationMailer
  layout 'mailer'
  # default delivery_method: :ses
  #default "Message-ID" => lambda {"<#{SecureRandom.uuid}@davelocalhost>"}

  def newsletter(campaign, subscriber)
    return if subscriber.blank?

    content_type = 'text/html'

    headers 'X-SES-CONFIGURATION-SET' => ENV['SNS_CONFIGURATION_SET']
    # Rails.application.credentials.dig(:sns, :configuration_set)

    attrs = subscriber.attributes

    @campaign = campaign

    @subscriber = subscriber

    @body = campaign.compiled_template_for(subscriber).html_safe

    mail(from: "#{campaign.from_name}<#{campaign.from_email}>",
         to: subscriber.email,
         subject: campaign.subject,
         content_type: content_type,
         return_path: campaign.reply_email)
  end

  def test(campaign, to_addresses = nil, sender, opts)
    content_type = 'text/html'
    #@subscriber = Lead.find_by_email "x.dave@gmail.com"
    email_addresses = to_addresses.present? ? to_addresses.split(/[,\s]+/) : ''
    @campaign = campaign 
    @subscriber = to_addresses.present? ? Lead.new(dummy_subscriber) : nil   
    campaign.apply_premailer(sender: sender, **opts)
    @body = campaign.compiled_template_for(@subscriber).html_safe
    content_type = 'text/html'
    if email_addresses.present?
      mail(from: "#{campaign.from_name}<#{campaign.from_email}>",
           to: email_addresses,
           subject: campaign.subject,
           return_path: campaign.reply_email,
           content_type: content_type) do |format|
        format.html { render 'newsletter' }
      end
    end 
  end

  def import_processed(import)
    to = import.agent.email  
    if import.errored_data.present? 
      @message = "Your import file has some unprocessed records. Please check the attached file with this email." 
      attachments["data.csv"] = open(import.error_file_path).read
    else 
      @message = "Your CSV import has completed successfully!" 
    end 

    mail(from: "contact@upsend.io",
         to: to,
         subject: "CSV import processed") 

  end


  private

  def dummy_subscriber
    { 
      name: 'Ruby', first_name: 'Ruby', last_name: 'Russel', city: 'Santa Monica', region: 'us-west', country: 'United States', 
      postal: '00000', browser: 'Safari', os: 'Mac OS', os_version: '10.15.4', web_sessions: '1', browser_version: "13.1", 
      first_seen: DateTime.now, last_seen: DateTime.now, signed_up: DateTime.now, last_contacted: DateTime.now, 
      last_heard_from: DateTime.now, email: 'ruby@example.com', created_at: DateTime.new
    }
  end


end
