# frozen_string_literal: true

class CsvImportJob < ActiveJob::Base
  queue_as :default

  def perform(contacts)
    contacts.process_csv  
  end
end
