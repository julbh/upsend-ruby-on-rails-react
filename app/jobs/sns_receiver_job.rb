# frozen_string_literal: true

class SnsReceiverJob < ApplicationJob
  queue_as :default

  # Receive hook
  def perform(track_type, m, _referrer)
    
    part = conversation_part_header = m["mail"]["headers"].find{|o| 
      o["name"] == "X-UPSEND-PART-ID" 
    }

    # handle conversation and exit
    if part.present? 
      handle_chat_message(track_type, m, part["value"]) 
      return
    end

    # handle campaign
    handle_campaign_message(track_type, m, _referrer)

  end

  def handle_campaign_message(track_type, m, _referrer)
    data = m[track_type]
    message_id = parsed_message_id(m)
    metric = Metric.find_by(message_id: message_id)
    return if metric.blank?

    campaign = metric.trackable
    app_user = metric.app_user

    # TODO: unsubscribe on spam (complaints that are non no-spam!)
    #Bounces – The recipient's mail server permanently rejected the email. This event corresponds to hard bounces. Soft bounces are only included when Amazon SES fails to deliver the email after retrying for a period of time.
    #Complaints – The email was successfully delivered to the recipient. The recipient marked the email as spam.

    #app_user.unsubscribe! if ["complaint", "bounce"].include?(track_type) && app_user && app_user.may_unsubscribe?
    
    app_user.complaint! if track_type == "complaint" && app_user.may_complaint?
    app_user.bounce! if track_type == "bounce" && app_user.may_bounce? 

    app_user.send("track_#{track_type}".to_sym,
                  host: data['ipAddress'],
                  trackable: campaign,
                  message_id: message_id,
                  data: data)
  end

  def handle_chat_message(track_type, m, part_id)
    return unless track_type == "open"
    recipient = m["mail"]["headers"].find{|o| o["name"] == "Return-Path" }["value"]
    recipient_parts = URLcrypt.decode(recipient.split('@').first.split('+').last)
    app_id, conversation_id = recipient_parts.split('+')
    Conversation.find(conversation_id).messages.find(part_id).read!
  end

  def parsed_message_id(m)
    #m['mail']['headers'].find { |o| o['name'] == 'Message-ID' }['value'].split('@').first.gsub('<', '')
    m['mail']['messageId'] 
  end
end
