from flask import Blueprint, request, jsonify
from config import supabase

feed_bp = Blueprint('feed', __name__)

@feed_bp.route('/feed', methods=['GET'])
def get_feed():
    try:
        # Relational fetch: Posts + Author details (Role & Dept for multi-tenancy)
        response = supabase.table('posts') \
            .select('id, content, type, created_at, profiles(role, department_id)') \
            .eq('is_approved', True) \
            .order('created_at', desc=True) \
            .execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@feed_bp.route('/feed', methods=['POST'])
def create_post():
    try:
        data = request.json
        # Enforce moderation flag based on role before insert
        data['is_approved'] = True if data.get('role') in ['Admin', 'HR'] else False 
        
        response = supabase.table('posts').insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500