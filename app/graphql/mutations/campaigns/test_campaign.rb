# frozen_string_literal: true

module Mutations
  module Campaigns
    class TestCampaign < Mutations::BaseMutation
      field :campaign, Types::CampaignType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :to_emails, String, required: true
      argument :template, String, required: true
      argument :include_unsubscription_link, Boolean, required: true
      argument :footer_address, String, required: true
      argument :help_email, String, required: true
      argument :help_contact, String, required: true

      def resolve(id:, app_key:, to_emails:, template:, include_unsubscription_link:, footer_address:, help_email:, help_contact:)
        find_app(app_key)
        set_campaign(id) 
        errors = validate_email_addresses(to_emails)
      
        if errors.present?
          message = to_emails.blank? ? errors.join(', ') : "Invalid emails: #{errors.join(', ')} "
          @campaign.errors.add(:email_addresses, message)
        else
          from_user = current_user
          opts = {template: (template || @campaign.template),
                  include_unsubscription_link: include_unsubscription_link,
                  footer_address: footer_address,
                  help_email: help_email,
                  help_contact: help_contact}
          @campaign.test_newsletter(to_emails, from_user, opts)
        end 
        { campaign: @campaign, errors: @campaign.errors }
      end

      def set_campaign(id)
        @campaign = @app.messages.find(id)
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end

      def validate_email_addresses(to_emails)
        errors = []
        errors << "Please enter email address." if to_emails.blank?
        emails = to_emails.split(/[,\s]+/)
        emails && emails.each do |em| 
          errors << em if (em =~ URI::MailTo::EMAIL_REGEXP).nil? 
        end
        errors
      end

    end 
  end
end
