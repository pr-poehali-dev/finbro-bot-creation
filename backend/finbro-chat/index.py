import json
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Proxy requests to FinBro AI API with authentication
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with bot answer
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        message: str = body_data.get('message', '')
        chat_id: str = body_data.get('chat_id', '')
        
        if not message or not chat_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'status': False,
                    'error': 'Missing message or chat_id'
                })
            }
        
        api_url = 'https://app.myjedai.ru/api/rest/85d6f91bb1e70414414cd0bb3ca059be'
        
        response = requests.post(
            api_url,
            json={
                'message': message,
                'chat_id': chat_id,
                'password': '1234512345'
            },
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        api_response = response.json()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(api_response)
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'status': False, 'error': 'Method not allowed'})
    }