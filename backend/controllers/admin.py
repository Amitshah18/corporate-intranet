from flask import Blueprint, request, jsonify
from config import supabase

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/pending', methods=['GET'])
def get_pending_posts():
    try:
        response = supabase.table('posts') \
            .select('id, content, type, created_at, profiles(role, department_id)') \
            .eq('is_approved', False) \
            .order('created_at', desc=True) \
            .execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/moderate/<post_id>', methods=['PATCH'])
def moderate_post(post_id):
    try:
        data = request.json
        action = data.get('action') # 'approve' or 'reject'
        
        if action == 'approve':
            response = supabase.table('posts').update({'is_approved': True}).eq('id', post_id).execute()
        else:
            response = supabase.table('posts').delete().eq('id', post_id).execute()
            
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500