module Mutations
  class Predicates::UpdateSegment < Mutations::BaseMutation

    field :segment, Types::SegmentType, null: false
    field :errors, Types::JsonType, null: true
 
    argument :id, Integer, required: false
    argument :app_key, String, required: false
    argument :segment_params, Types::JsonType, required: true

    def resolve(app_key:, segment_params:, id:) 
      current_user = context[:current_user]
      @app = current_user.apps.find_by(key: app_key)
      @segment = @app.segments.find(id)
      @segment.update(segment_params.permit(:config_table_columns => []))   
      {
        segment: @segment,
        errors: @segment.errors
      }
    end
  end
end
