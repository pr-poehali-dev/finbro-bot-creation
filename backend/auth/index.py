import json
import os
import hashlib
import secrets
import psycopg2
from typing import Dict, Any, Optional

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User registration and authentication
    Args: event with httpMethod, body for auth operations
    Returns: HTTP response with user data and token
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action: str = body_data.get('action', '')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if action == 'register':
        email: str = body_data.get('email', '').lower().strip()
        password: str = body_data.get('password', '')
        username: str = body_data.get('username', '').strip()
        
        if not email or not password or not username:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Email, password and username are required'})
            }
        
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        existing = cur.fetchone()
        
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Email already registered'})
            }
        
        password_hash = hash_password(password)
        token = generate_token()
        
        cur.execute(
            "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id",
            (email, password_hash, username)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user_id,
                    'email': email,
                    'username': username,
                    'token': token
                }
            })
        }
    
    elif action == 'login':
        email: str = body_data.get('email', '').lower().strip()
        password: str = body_data.get('password', '')
        
        if not email or not password:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Email and password are required'})
            }
        
        password_hash = hash_password(password)
        
        cur.execute(
            "SELECT id, username FROM users WHERE email = %s AND password_hash = %s",
            (email, password_hash)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Invalid email or password'})
            }
        
        token = generate_token()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user[0],
                    'email': email,
                    'username': user[1],
                    'token': token
                }
            })
        }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Invalid action'})
    }
