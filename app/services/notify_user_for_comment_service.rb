class NotifyUserForCommentService < BaseService

  def initialize(conversation:, author:)
    @conversation = conversation
    @author = author
  end

  def notify
    receiver = if @conversation.assignee = @author
      @conversation.main_participant
    else
      @conversation.assignee
    end
    params = {
      "app_id" => ENV['ONESIGNAL_APP_ID'],
      "headings" => { "en": "Upsend" },
      "contents" => { "en": "You have a new message" },
      "url" => "#{ENV['HOST']}/apps/#{@conversation.app.key}/conversations/#{@conversation.key}",
      "include_external_user_ids" => ["User-#{receiver.email}"]
    }
      uri = URI.parse('https://onesignal.com/api/v1/notifications')
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true

      request = Net::HTTP::Post.new(uri.path,
                                'Content-Type'  => 'application/json;charset=utf-8',
                                'Authorization' => "Basic #{ENV['ONESIGNAL_APP_SECERT']}")
      request.body = params.as_json.to_json
      response = http.request(request) 
  end

end