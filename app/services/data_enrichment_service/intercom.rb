# frozen_string_literal: true
require 'intercom'

module DataEnrichmentService
  class Intercom < DataEnrichmentService::Base
    attr_accessor :token, :app, :intercom_admins, :app_agents, :intercom, :import, :restart, :skip_existing_record

    # initialize with
    # DataEnrichmentService::FullContact.new(token: "122334456", app: app, import: import) 

    def initialize(token:, app:, import:, restart:false, skip_existing_record:false) 
      @token = token
      @app = app
      @import = import 
      @restart = restart
      @skip_existing_record = skip_existing_record 
      @intercom = ::Intercom::Client.new(token: @token) 
    end 

    def get_client(params: {}) 
      intercom = ::Intercom::Client.new(token: @token)
      intercom
    end

    def run
      
      if @import.import_contacts && !@import.contacts_imported
        import_contacts
        @import.update({contacts_imported: true}) 
      end
      if @import.import_conversations && !@import.conversations_imported
        import_conversations 
        @import.update({conversations_imported: true}) 
      end

      log_info "Contacts imported!" if @import.contacts_imported
      log_info "Conversations imported!" if import.conversations_imported  

    end


    def contact_model_fields
      [
        "android_app_name", "android_app_version", "android_device", "android_last_seen_at", "android_os_version", "android_sdk_version", 
        "ios_app_name", "ios_app_version", "ios_device", "ios_last_seen_at", "ios_os_version", "ios_sdk_version", 
        "avatar", "browser", "browser_language", "browser_version", "created_at",  "external_id", "id",
        "has_hard_bounced", "language_override", "last_contacted_at", "last_email_clicked_at", "last_email_opened_at", "last_replied_at", "last_seen_at", 
        "marked_email_as_spam", "name", "os", "owner_id", "phone", "role", "signed_up_at", 
        "unsubscribed_from_emails", "workspace_id"] 
    end

    def contact_location_fields
      ["city", "region", "country"]
    end

    def exclude_for_app_user_properties
      ["android_app_name", "android_app_version", "android_device", "android_last_seen_at", "android_os_version", "android_sdk_version", 
        "ios_app_name", "ios_app_version", "ios_device", "ios_last_seen_at", "ios_os_version", "ios_sdk_version", 
        "last_seen_at", "last_contacted_at", "signed_up_at", "avatar", "created_at", "updated_at", "id", "social_profiles", "type", "location", "workspace_id"
      ]
    end 

    def app_user_columns
      ["browser", "browser_language", "browser_version", "os", "os_version",
        "city", "country", "state",  "region", 
        "email", 
        "first_seen", "ip", "lang", "last_contacted", 
        "last_heard_from", "last_seen", "last_visited_at", "lat", "lng", "postal", "properties", "referrer", 
        "session_id", "signed_up", "source",  "subscription_state", "timezone", "web_sessions"] 
    end 


    def get_page_url_for(name)
      current_page_url = get_last_processed_page

      if current_page_url.present? && !restart
        result = get_next_page(name,current_page_url) 
        current_page = current_page_url.instance_of?(Hash) ? current_page_url["page"].to_i : Rack::Utils.parse_query(URI(current_page_url).query)["page"].to_i
        total = (result["pages"]["per_page"] * result["pages"]["total_pages"]).to_i
        count = total - (result["pages"]["per_page"].to_i * current_page)
      else
        result = get_first_page("/#{name}") 
        current_page = 1
        count = 1
        total = result["pages"]["per_page"] * result["pages"]["total_pages"] #not accurate
      end
      [result,current_page,count,total]
    end

    def import_contacts  
      p "skip_existing: #{@skip_existing_record}"
      
      result,current_page,count,total = get_page_url_for("contacts")
      
      until current_page.nil? do
        result["data"].each do |contact_hash|
          contact = ::Intercom::Contact.new(contact_hash)
          create_contact(contact) 
          count +=1
        end
        log_info "PAGINATION: page #{result['pages']['page']} of #{result["pages"]["total_pages"]}"
        
        current_page = result['pages']['next']
        save_current_page(current_page, "contacts")
        
        
        break if current_page.nil?
        result = get_next_page("contacts",result['pages']['next'])
      end 
    end


    # def import_contacts_archived
    #   client = get_client

    #   # contact_data_attr = []
    #   # customer_attributes_incl_archived = client.data_attributes.find_all({"model": "contact", "include_archived": true})
    #   # customer_attributes_incl_archived.each { |attribute| contact_data_attr << attribute.name }


    #   #role: String : The role of the contact - user or lead.


    #   # means an error, escape it
    #   #return if response.status.present? && response.status >= 400
    #   index = 0
    #   client.contacts.all.each do |contact|
    #     break if index == 10 && Rails.env.development? 
    #     index = index + 1
    #     create_contact(contact)
    #   end
    # end

    def fetch_admins
      client = get_client
      @intercom_admins = [] 
      client.admins.all.each do |admin|
        agent = Agent.where(email: admin.email).first
        agent = Agent.invite_agent(admin.email, @app) if agent.blank?
        @intercom_admins  << {email: admin.email, intercom_id: admin.id, id: agent.id}  
      end 
    end

    def init_app_agents
      @app_agents = []
      @app.agents.each do |admin|
        @app_agents  << {email: admin.email, id: admin.id} 
      end
    end

    def import_conversations
      client = get_client
      fetch_admins
      init_app_agents

      result,current_page,count,total = get_page_url_for("conversations")
      
      until current_page.nil? do
        result["conversations"].each do |inter_conversation|
          conv = ::Intercom::Contact.new(inter_conversation)
          create_conversation(conv)
          #puts "Exporting conversation #{count} of #{total} : #{contact.location.country}"
          #convo_parser.parse_conversation_parts(get_single_convo(single_convo['id']))
          count +=1
        end
        log_info "PAGINATION: page #{result['pages']['page']} of #{result["pages"]["total_pages"]}"
        
        current_page = result['pages']['next']
        save_current_page(current_page, "conversations")
        
        
        break if current_page.nil?
        result = get_next_page("conversations",result['pages']['next'])
      end 

    end


    # def import_conversations
    #   client = get_client
    #   fetch_admins
    #   init_app_agents

    #   index = 0
    #   #result = client.get("/conversations", {per_page:50})
    #   #result["conversations"]
    #   client.conversations.all.each do |inter_conversation|
    #     break if index == 10 && Rails.env.development? 
    #     index = index + 1
    #     import_id = "intercom_#{inter_conversation.id}"
    #     conversation = Conversation.where(import_id: import_id).first_or_initialize(app_id: @app.id)
    #     next if conversation.persisted?
    #     #####fetch all fields including conversation parts. listing only has metadata
    #     inter_conversation = client.conversations.find(id: inter_conversation.id)
    #     ########################################
    #     conversation.app_id = @app.id
    #     conversation.import_id = import_id
    #     conversation.state = inter_conversation.open ? "opened" : "closed"
    #     conversation.parts_count = inter_conversation.statistics.count_conversation_parts  rescue nil
        
    #     conversation.read_at = inter_conversation.read ? inter_conversation.statistics.first_contact_reply_at : nil
    #     #conversation.main_participant_id = inter_conversation.statistics.first_contact_reply_at
    #     conversation.latest_admin_visible_comment_at = inter_conversation.statistics.last_assignment_admin_reply_at
    #     conversation.latest_user_visible_comment_at = inter_conversation.statistics.last_contact_reply_at
    #     conversation.first_agent_reply = inter_conversation.statistics.first_admin_reply_at

    #     conversation.assignee_id = get_assignee(inter_conversation.assignee)

        
    #     conversation.main_participant_id = get_contact(inter_conversation.contacts.first)
    #     if conversation.main_participant_id && conversation.save
    #       #fetch parts
    #       import_conversation_parts(conversation, inter_conversation) 
    #     else
    #       ##skipped because of participant contact not found.. this usecase raises error in upsend
    #     end

    #   end
    # end



    def import_conversation_parts(local_conversation, intercom_conversation)
     

      intercom_conversation.conversation_parts.each do |inter_conversation_part|
        import_id = generate_import_id(inter_conversation_part)
        
        cp = ConversationPart.where(import_id: import_id).first_or_initialize(conversation_id: local_conversation.id)
        cp = local_conversation.messages.build if cp.blank?

        cp.message = { html_content: inter_conversation_part.body, text_content: inter_conversation_part.body, serialized_content: "" }
        author = get_author(inter_conversation_part.author)
        cp.authorable = author 
        cp.skip_callbacks = true
        cp.save!


      end
    end

    def get_author(author)
      #author -> String -> The type of individual that sent the message (user, admin or bot) and their related id.For Twitter, this will be blank.
      if author.type == "user"
        import_id = generate_import_id(author)
        user = AppUser.where(import_id: import_id).first
      elsif author.type == "admin" || author.type == "bot"
        agent = Agent.where(email: author.email).first
      end
    end


    def get_assignee(assignee)
      #assignee -> Object -> The Admin or Team assigned to the conversation. If it's unassigned it will return null.
      if assignee && assignee.type == "admin"
        assignee_id = @intercom_admins.select {|agent| agent[:intercom_id] == assignee.id }.first[:id]
        return assignee_id
      end

    end

    def get_contact(contact)
      #contact -> Object  

      if contact && contact.type == "contact" 
        import_id = generate_import_id(contact)
        contact = AppUser.where(import_id: import_id).first
        contact.id rescue nil
      end

    end

    private

    def create_contact(contact)
      import_id = generate_import_id(contact) 

      user = AppUser.where(import_id: import_id).or(AppUser.where(:email => contact.email, app_id: @app.id )).first if contact.email.present? && import_id.present?
      user = AppUser.where(import_id: import_id, app_id: @app.id).first if contact.email.blank? && import_id.present?


      return "skipped_existing_record" if @skip_existing_record && user.present?

      user = user.present? ? user : AppUser.new(app_id: @app.id, email: contact.email)
      user.type = contact.role == "user" ? "AppUser" : "Lead" 
      user.import_id = import_id
      user.browser = contact.browser
      user.browser_language = contact.browser_language
      user.browser_version = contact.browser_version
      user.os = contact.os 
      user.city = contact.location.city
      user.country = contact.location.country
      user.region = contact.location.region 

      user.last_contacted = contact.last_contacted_at
      user.last_seen = contact.last_seen_at
      user.signed_up = contact.signed_up_at
      user.source = "intercom_import" 

      user.properties = user.properties.reverse_merge! contact.custom_attributes

      potential_properties = contact_model_fields - exclude_for_app_user_properties
      potential_properties.each do |attribute|
        next if user.has_attribute?(attribute.to_sym)
        user.properties[attribute] = contact.send(attribute)
      end


      if user.save
        #log_info "contact created #{contact.id}"
      else
        log_info "contact creation failed #{contact.id}"
        record_failure("contacts", contact)
      end

    end


    def create_conversation(inter_conversation)
      import_id = generate_import_id(inter_conversation)

      conversation = Conversation.where(import_id: import_id).first_or_initialize(app_id: @app.id)
      return if @skip_existing_record #conversation.persisted?
      #####fetch all fields including conversation parts. listing only has metadata
      check_rate_limit do
        inter_conversation = intercom.conversations.find(id: inter_conversation.id)
      end
      ########################################
      conversation.app_id = @app.id
      conversation.import_id = import_id
      conversation.state = inter_conversation.open ? "opened" : "closed"
      conversation.parts_count = inter_conversation.statistics.count_conversation_parts  rescue nil
      
      conversation.read_at = inter_conversation.read ? inter_conversation.statistics.first_contact_reply_at : nil
      #conversation.main_participant_id = inter_conversation.statistics.first_contact_reply_at
      conversation.latest_admin_visible_comment_at = inter_conversation.statistics.last_assignment_admin_reply_at
      conversation.latest_user_visible_comment_at = inter_conversation.statistics.last_contact_reply_at
      conversation.first_agent_reply = inter_conversation.statistics.first_admin_reply_at

      conversation.assignee_id = get_assignee(inter_conversation.assignee)

      
      conversation.main_participant_id = get_contact(inter_conversation.contacts.first)
      # if conversation.main_participant_id.blank? 
      #   raise StandardError.new("intercom contact not present")
      # end
      if conversation.main_participant_id && conversation.save!
        #fetch parts
        import_conversation_parts(conversation, inter_conversation) 
      else 
        record_failure("conversations", inter_conversation)
        ##skipped because of participant contact not found.. this usecase raises error in upsend
      end    
    end
    def get_first_page(url) 
      check_rate_limit do
        results = intercom.get(url, {per_page: 50})
        results
      end
    end

    def get_next_page(name, next_page_url)
      check_rate_limit do
        if next_page_url.instance_of?(Hash)
          url = "https://api.intercom.io/#{name}"
          results = intercom.get(url, next_page_url.merge({per_page: 50}) )
        else
          results = intercom.get(next_page_url, {per_page: 50})
        end 
        results
      end
    end

    def check_rate_limit
      current_rate = yield  
      if intercom.rate_limit_details[:remaining] < 30
        log_info "RATE LIMIT: #{intercom.rate_limit_details[:remaining]}"
        sleep 10
        log_info "SLEEPING"
      end
      current_rate
    end

    def get_last_processed_page
      @import.last_processed_page.blank? ? "" : JSON.parse(@import.last_processed_page)
    end

    def save_current_page(current_page, table)
      current_page = current_page.to_json
      if current_page
        @import.update!({last_processed_page: current_page, last_processed_table_name: table})
      end
    end 

    def generate_import_id(obj)
      "intercom_#{@import.id}_#{obj.id}"
    end

    def log_info(message)
      Rails.logger.info("INTERCOM_IMPORT: #{message}")
      p message
    end



    def record_failure(name, obj)
      log_info "Skipped #{name} with id #{obj.id}"
      failed_records = import.failed_rows.present? ? JSON.parse(import.failed_rows)  : {"#{name}" => []}
      failed_records[name] << obj.id
      import.update!({failed_rows: failed_records.to_json})

    end



  end
end
