require 'rubygems'
require 'base64'
require 'json'

class IntercomController < ApplicationController
    $client = "3b48c63e-a1a8-4bb8-b9b1-e495173c90f6"
    $secret = "381660d4-5e9e-4dad-b1fa-2f996e6e55f3"  

  # redirect function ask for permission scope
  # update http://localhost:3000 in the redirect_uri with your base uri
  def index
    session[:import_to_app] = params[:app]
    @url = "https://app.intercom.com/oauth?client_id=" + $client + "&secret_id=" + $secret + "&redirect_uri=http://localhost:3000/intercom/auth"
    redirect_to @url
  end

  

  # callback function 
  def auth
    app_key = session[:import_to_app]
    #We can do a Post now to get the access token
    uri = URI.parse("https://api.intercom.io/auth/eagle/token")
    response = Net::HTTP.post_form(uri, {"code" => params[:code],"client_id" => $client,"client_secret" => $secret})

    if response.kind_of? Net::HTTPSuccess      
      body = JSON.parse(response.body)             
      bearer_token = body['access_token']      
              
      headers = {
        "Authorization" => "Bearer #{bearer_token}",
        "Content-Type" => "application/json"
      }

      # get all contact
      url = "https://api.intercom.io/contacts"  

      res = HTTParty.get(url, headers: headers)
      
      if res.success?      
        # Save contact to data  base
        contacts = JSON.parse(res.body)      
        
        contacts['data'].each do |contact|
          if AppUser.where(:id => contact['id']).blank?
            user = AppUser.new
            

            @app = App.find_by(key: app_key)
           
            user.app_id = @app.id

            #user.id = contact['id']  #rails reserverd column it cannot be populated. 
            user.key = contact['id']            
            #'properties' = contact['properties'],
            #'referre' = contact['referre'],
            user.state = contact['state']
            #'ip' = contact['ip']
            user.city = contact['city']
            user.region = contact['region']
            user.country = contact['country']
            # 'subscription_state' = contact['subscription_state']
            #'session_id' = contact['session_id']      
            user.email = contact['email']
            user.lat = contact['lat']
            user.lng = contact['lng']
            user.postal = contact['postal']
            user.web_sessions = contact['web_session']
            user.timezone = contact['timezone']
            user.browser = contact['browser']
            user.browser_version = contact['browser_version']
            user.os = contact['os']
            user.os_version = contact['os_version']
            user.browser_language = contact['browser_language']
            #user.type =  contact['role']  #rails reserverd column it cannot be populated. 
            user.lang = contact['language_override']      
            user.last_visited_at =  contact['last_visited_at']      
            user.created_at =  contact['created_at']
            user.updated_at =  contact['updated_at']
            user.signed_up =  contact['signed_up_at']
            user.first_seen =  contact['first_seen']
            user.last_seen =  contact['last_seen_at']
            user.last_heard_from =  contact['last_heard_from']
            user.last_contacted =  contact['last_contacted']        
            user.save!
            p user
          end
        end      
      else
        p "response failed: do logging here to check"
      end
      
      url = "https://api.intercom.io/conversations" 
      res = HTTParty.get(url, headers: headers)
      puts res
      if res.success? 
        conversations = JSON.parse(res.body)   
      end 
      
      render text: "Ok"
    end
  end

end
