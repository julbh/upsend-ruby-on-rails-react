class IntercomImportJob < ApplicationJob
  queue_as :import

  def perform(import_id)
    max_retries = 5
    import = IntercomImport.find(import_id) 
     
    import.update_attributes({state: "processing", errored_with_message: ""})
    app = import.app
    token = import.token
    app_package_integration = import.app_package_integration 

    begin 
      service = DataEnrichmentService::Intercom.new(token: token, app: app, import: import) 
      service.run
 
      import.update_attributes({state: "completed"})
      ExportUsersMailer.intercom_import_complete(import.id).deliver_later
      #app_package_integration.delete
    rescue Intercom::AuthenticationError
      import.update_attributes({state: "failed", errored_with_message: "The provided Access Token is not authorized to retrieve data."})
      ExportUsersMailer.intercom_import_complete(import.id).deliver_later
    rescue Intercom::ServiceConnectionError
      sleep 10
      p "ServiceConnetionError: SLEEP 10" 
      service.run
      #import.update_attributes({state: "failed", errored_with_message: e.message})
      #p "RETRIED EXHAUSTED" 
  

    rescue => e
      import.update_attributes({state: "failed", errored_with_message: e.message})
      p "FAILED"
    end

  end
end
