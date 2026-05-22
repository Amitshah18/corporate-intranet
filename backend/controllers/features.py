import random
from flask import Blueprint, request, jsonify
from config import supabase

features_bp = Blueprint('features', __name__)

@features_bp.route('/dashboard/init', methods=['GET'])
def get_dashboard_data():
    try:
        users_count = supabase.table('profiles').select('id', count='exact').execute().count
        posts_count = supabase.table('posts').select('id', count='exact').eq('is_approved', True).execute().count
        leadership = supabase.table('leadership_messages').select('quote, month_year, profiles(full_name, role)').limit(1).execute()
        events = supabase.table('events').select('*').order('date').limit(3).execute()
        
        return jsonify({
            "stats": {"users": users_count, "posts": posts_count},
            "leadership": leadership.data[0] if leadership.data else None,
            "events": events.data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@features_bp.route('/recognition', methods=['POST'])
def send_recognition():
    try:
        data = request.json
        receiver_id = data.get('receiver_id')
        points = 10
        
        supabase.table('recognitions').insert({
            "sender_id": data.get('sender_id'),
            "receiver_id": receiver_id,
            "message": data.get('message'),
            "points_awarded": points
        }).execute()
        
        user_data = supabase.table('profiles').select('points').eq('id', receiver_id).single().execute()
        current_points = user_data.data.get('points', 0)
        
        supabase.table('profiles').update({'points': current_points + points}).eq('id', receiver_id).execute()
        return jsonify({"success": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@features_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        response = supabase.table('profiles') \
            .select('id, full_name, role, department_id, points') \
            .order('points', desc=True) \
            .limit(10) \
            .execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@features_bp.route('/knowledge', methods=['GET'])
def get_knowledge():
    try:
        docs = supabase.table('knowledge_docs').select('*').order('updated_at', desc=True).execute()
        threads = supabase.table('forum_threads').select('*, profiles(full_name)').order('created_at', desc=True).execute()
        return jsonify({"documents": docs.data, "forums": threads.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@features_bp.route('/events', methods=['GET'])
def get_events():
    try:
        events = supabase.table('events').select('*').order('date').execute()
        return jsonify(events.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@features_bp.route('/events', methods=['POST'])
def create_event():
    try:
        data = request.json
        event_type = data.get('type', 'Meeting')
        colors = {
            'Meeting': '#3B7DD8',
            'Town Hall': '#7C3AED',
            'Workshop': '#059669',
            'Social': '#EC4899',
            'Deadline': '#EF4444'
        }
        
        assigned_color = colors.get(event_type, '#3B7DD8')

        new_event = {
            "title": data.get('title'),
            "date": data.get('date'),
            "time": data.get('time'),
            "type": event_type,
            "color": assigned_color
        }
        
        response = supabase.table('events').insert(new_event).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@features_bp.route('/gallery', methods=['GET'])
def get_gallery():
    try:
        albums = supabase.table('gallery_albums').select('*').order('id', desc=True).execute()
        return jsonify(albums.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- THE MISSING ROUTE FOR GALLERY UPLOADS ---
@features_bp.route('/gallery', methods=['POST'])
def create_gallery_album():
    try:
        data = request.json
        gradients = [
            'from-blue-600 to-indigo-500', 
            'from-pink-500 to-rose-500', 
            'from-emerald-500 to-teal-500', 
            'from-amber-500 to-orange-500', 
            'from-purple-600 to-pink-500'
        ]
        
        new_album = {
            "title": data.get('title'),
            "emoji": data.get('emoji', '📸'),
            "department": data.get('department', 'All'),
            "color": random.choice(gradients),
            "photo_count": int(data.get('photo_count', 0))
        }
        
        response = supabase.table('gallery_albums').insert(new_album).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500