module Api
  class UsersController < ApplicationController
    before_action :authenticate_request!
    before_action :set_user, only: [:show, :update, :destroy]
    before_action :authorize_user, only: [:update, :destroy]

    # GET /api/users
    def index
      @users = User.select(:id, :email, :created_at, :updated_at)
      render json: @users
    end

    # GET /api/users/:id
    def show
      render json: @user.as_json(only: [:id, :email, :created_at, :updated_at])
    end

    # PUT/PATCH /api/users/:id
    def update
      if user_params[:password].present?
        # If updating password, require current password
        unless @user.authenticate(user_params[:current_password])
          render json: { errors: ['Current password is incorrect'] }, status: :unauthorized
          return
        end
      end

      update_params = user_params.except(:current_password)
      
      if @user.update(update_params)
        render json: @user.as_json(only: [:id, :email, :created_at, :updated_at])
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/users/:id
    def destroy
      @user.destroy
      head :no_content
    end

    private

    def set_user
      @user = User.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ['User not found'] }, status: :not_found
    end

    def authorize_user
      unless @user.id == current_user.id
        render json: { errors: ['Unauthorized to perform this action'] }, status: :forbidden
      end
    end

    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation, :current_password)
    end
  end
end

