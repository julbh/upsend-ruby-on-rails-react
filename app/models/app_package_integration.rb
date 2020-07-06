# frozen_string_literal: true

class AppPackageIntegration < ApplicationRecord
  belongs_to :app_package
  belongs_to :app
  has_one :intercom_import

  after_create :handle_registration

  # possible names for api requirements, 
  # it also holds a credentials accessor in which can hold a hash
  store :settings, accessors: %i[
    api_key
    api_secret
    project_id
    report_id
    access_token
    access_token_secret
    user_id
    user_token
    credentials,
    verify_token,
    intercom_token
    import_contacts
    import_conversations
  ], coder: JSON

  validate do
    app_package.definitions.each do |definition|
      key = definition[:name].to_sym
      next unless self.class.stored_attributes[:settings].include?(key)
      errors.add(key, "#{key} is required") if send(key).blank?
    end
  end

  def message_api_klass
    @message_api_klass ||= "MessageApis::#{app_package.name.capitalize}".constantize.new(config: self.settings) rescue nil
  end

  def trigger(event)
    klass = message_api_klass
    klass.trigger(event) if klass.respond_to?(:trigger)
  end

  def handle_registration
    register_hook if message_api_klass and message_api_klass.respond_to?(:register_webhook)
  end

  def register_hook
    klass = message_api_klass
    response = klass.register_webhook(app_package, self)
    klass.subscribe_to_events if klass.respond_to?(:subscribe_to_events)
    response
  end

  def get_webhooks
    klass = message_api_klass
    response = klass.get_webhooks
  end

  def delete_webhooks
    klass = message_api_klass
    response = klass.delete_webhooks
  end

  def create_hook_from_params(params)
    klass = message_api_klass.create_hook_from_params(params, self)
  end

  def process_event(params)
    klass = message_api_klass.enqueue_process_event(params, self)
  end

  def send_message(conversation, options)
    klass = message_api_klass.send_message(conversation, options)
  end

  def oauth_authorize
    klass = message_api_klass.oauth_authorize(self.app, self)
  end

  def hook_url
    "#{ENV['HOST']}/api/v1/hooks/#{app.key}/#{app_package.name.downcase}/#{self.id}"
  end

  def oauth_url
    "#{ENV['HOST']}/api/v1/oauth/#{app.key}/#{app_package.name.downcase}/#{self.id}"
  end

  def receive_oauth_code(params)
    klass = message_api_klass.receive_oauth_code(params, self)
  end

  def intercom_import_job(current_user)
    token = settings["intercom_token"]
    import_contacts = settings["import_contacts"]
    import_conversations = settings["import_conversations"]
    import = intercom_import
    if import.blank?
      import = IntercomImport.create(name: "Intercom import", app_id: app.id, agent_id: current_user.id, app_package_integration_id: id, token: token, import_contacts: import_contacts, import_conversations: import_conversations)
    elsif import
      import.update_attributes({state: "pending", token: token, import_conversations: import_conversations, import_contacts: import_contacts})
      
    end

    IntercomImportJob.perform_later(import.id) if ["pending", "failed"].include?(import.state)
  end

  
end
