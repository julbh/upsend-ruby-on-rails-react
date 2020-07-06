class RenameColumnsOnIntercomImport < ActiveRecord::Migration[6.0]
  def change
  	rename_column :intercom_imports, :integration_id, :app_package_integration_id
  	remove_column :intercom_imports, :last_processed_page_field 
  end
end
