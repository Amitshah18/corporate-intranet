from flask import Blueprint, request, jsonify
from config import supabase

users_bp = Blueprint('users', __name__)

@users_bp.route('/provision', methods=['POST'])
def provision_user():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password') # In production, auto-generate and email invite link
        full_name = data.get('full_name')
        role = data.get('role', 'Employee')
        department_id = data.get('department_id')

        # 1. Create Auth User (Requires Service Role Key)
        auth_response = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        
        new_user_id = auth_response.user.id

        # 2. Create Profile Record
        profile_data = {
            "id": new_user_id,
            "full_name": full_name,
            "role": role,
            "department_id": department_id
        }
        supabase.table('profiles').insert(profile_data).execute()

        return jsonify({"message": "User provisioned successfully", "user_id": new_user_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/directory', methods=['GET'])
def get_directory():
    try:
        response = supabase.table('profiles') \
            .select('id, full_name, role, points, departments(name)') \
            .order('full_name') \
            .execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500