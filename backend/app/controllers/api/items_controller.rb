module Api
  class ItemsController < ApplicationController
    before_action :authenticate_request!
    before_action :set_item, only: [:show, :update, :destroy]

    # GET /api/items
    def index
      @items = current_user.items
      render json: @items
    end

    # GET /api/items/:id
    def show
      render json: @item
    end

    # POST /api/items
    def create
      @item = current_user.items.build(item_params)
      if @item.save
        render json: @item, status: :created
      else
        render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PUT /api/items/:id
    def update
      if @item.update(item_params)
        render json: @item
      else
        render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/items/:id
    def destroy
      @item.destroy
      head :no_content
    end

    private

    def set_item
      @item = current_user.items.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ['Item not found'] }, status: :not_found
    end

    def item_params
      params.require(:item).permit(:title, :description)
    end
  end
end

