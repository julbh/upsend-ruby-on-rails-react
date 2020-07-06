class Agents::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def doorkeeper
    @user = Agent.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted?
      @user.update_doorkeeper_credentials(request.env["omniauth.auth"])
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: "Doorkeeper") if is_navigational_format?
    else
      session["devise.doorkeeper_data"] = request.env["omniauth.auth"]
      redirect_to new_agent_registration_url
    end
  end

  def linkedin 
    @user = Agent.from_omniauth(request.env["omniauth.auth"])
    if @user.persisted? 
      sign_in(:agent, @user, {store: true})
      @user.sign_in_count = @user.sign_in_count + 1
      @user.last_sign_in_at = DateTime.current
      @user.save!

      redirect_to "/authlogin"
    else 
      session["devise.linkedin_data"] = request.env["omniauth.auth"] 
      redirect_to new_agent_registration_url 
    end
  end

  def google_oauth2
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    @user = Agent.from_omniauth(request.env['omniauth.auth'])
    if @user.persisted?
      sign_in(:agent, @user, {store: true})
      @user.sign_in_count = @user.sign_in_count + 1
      @user.last_sign_in_at = DateTime.current
      @user.save!

      redirect_to "/authlogin"
    else
      session['devise.google_data'] = request.env['omniauth.auth'].except(:extra) # Removing extra as it can overflow some session stores
      redirect_to new_agent_registration_url, alert: @user.errors.full_messages.join("\n")
    end
  end

  def failure
    redirect_to root_path
  end
end
