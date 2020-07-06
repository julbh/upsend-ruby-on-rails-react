module Mutations
  class Apps::ImportContact < Mutations::BaseMutation

    field :import_contact, Types::JsonType, null: false 
    field :errors, Types::JsonType, null: true

    argument :params, Types::JsonType, required: true
    argument :app_key, String, required: true
    

    def resolve(app_key:, params:)  
      current_user = context[:current_user] 
      @app = current_user.apps.find_by(key: app_key)
      
      import_contact = ImportContact.new(params.permit(:avatar, :column_separator, :skip_header, :mapping_model, mapping_fields: [:value, :label, :index]))
      import_contact.app_id = @app.id
      import_contact.agent_id = current_user.id
      import_contact.perfom_csv_job if import_contact.save

      @app.add_custom_fields_from(import_contact)

      { import_contact: import_contact, errors: import_contact.errors.full_messages.to_sentence }
    end 
    
  end
end
