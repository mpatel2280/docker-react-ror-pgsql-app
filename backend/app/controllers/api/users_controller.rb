module Api
  class UsersController < ApplicationController
    before_action :authenticate_request!
    before_action :set_user, only: [:show, :update, :destroy]
    before_action :authorize_user, only: [:update, :destroy]
    before_action :require_admin, only: [:index]

    # GET /api/users (Admin only)
    def index
      @users = User.select(:id, :email, :is_admin, :created_at, :updated_at)
      render json: @users
    end

    # GET /api/users/:id
    def show
      render json: @user.as_json(only: [:id, :email, :is_admin, :created_at, :updated_at])
    end

    # PUT/PATCH /api/users/:id
    def update
      # If not admin and updating password, require current password
      if !current_user.admin? && user_params[:password].present?
        unless @user.authenticate(user_params[:current_password])
          render json: { errors: ['Current password is incorrect'] }, status: :unauthorized
          return
        end
      end

      update_params = user_params.except(:current_password)

      if @user.update(update_params)
        render json: @user.as_json(only: [:id, :email, :is_admin, :created_at, :updated_at])
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
      # Admins can manage any user, regular users can only manage themselves
      unless current_user.admin? || @user.id == current_user.id
        render json: { errors: ['Unauthorized to perform this action'] }, status: :forbidden
      end
    end

    def require_admin
      unless current_user.admin?
        render json: { errors: ['Admin access required'] }, status: :forbidden
      end
    end

    def user_params
      # Admins can update is_admin field, regular users cannot
      if current_user.admin?
        params.require(:user).permit(:email, :password, :password_confirmation, :current_password, :is_admin)
      else
        params.require(:user).permit(:email, :password, :password_confirmation, :current_password)
      end
    end
  end
end

