import json
import os
import psycopg2
from typing import Dict, Any, List

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save and retrieve chat history for users
    Args: event with httpMethod, body, headers with X-User-Id
    Returns: HTTP response with chat history or save confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'User ID required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action: str = body_data.get('action', '')
        
        if action == 'save_message':
            chat_id: str = body_data.get('chat_id', '')
            message_text: str = body_data.get('message', '')
            is_user: bool = body_data.get('is_user', True)
            
            if not chat_id or not message_text:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'chat_id and message required'})
                }
            
            cur.execute("SELECT id FROM chats WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
            chat = cur.fetchone()
            
            if not chat:
                cur.execute(
                    "INSERT INTO chats (user_id, chat_id, title) VALUES (%s, %s, %s) RETURNING id",
                    (user_id, chat_id, 'Новый чат')
                )
                chat_db_id = cur.fetchone()[0]
            else:
                chat_db_id = chat[0]
            
            cur.execute(
                "INSERT INTO messages (chat_id, message_text, is_user) VALUES (%s, %s, %s)",
                (chat_db_id, message_text, is_user)
            )
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
                'body': json.dumps({'success': True})
            }
        
        elif action == 'update_chat_title':
            chat_id: str = body_data.get('chat_id', '')
            title: str = body_data.get('title', '')
            
            cur.execute(
                "UPDATE chats SET title = %s WHERE chat_id = %s AND user_id = %s",
                (title, chat_id, user_id)
            )
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
                'body': json.dumps({'success': True})
            }
    
    elif method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        chat_id = query_params.get('chat_id')
        
        if chat_id:
            cur.execute(
                """SELECT m.message_text, m.is_user, m.created_at 
                   FROM messages m 
                   JOIN chats c ON m.chat_id = c.id 
                   WHERE c.chat_id = %s AND c.user_id = %s 
                   ORDER BY m.created_at ASC""",
                (chat_id, user_id)
            )
            messages = cur.fetchall()
            
            result = [{
                'text': msg[0],
                'isUser': msg[1],
                'timestamp': msg[2].isoformat()
            } for msg in messages]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'messages': result})
            }
        else:
            cur.execute(
                """SELECT chat_id, title, created_at 
                   FROM chats 
                   WHERE user_id = %s 
                   ORDER BY updated_at DESC""",
                (user_id,)
            )
            chats = cur.fetchall()
            
            result = [{
                'chat_id': chat[0],
                'title': chat[1],
                'created_at': chat[2].isoformat()
            } for chat in chats]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'chats': result})
            }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
