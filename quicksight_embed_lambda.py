import json
import boto3
import os
from datetime import datetime

def lambda_handler(event, context):
    """
    QuickSight Embed URL Lambda Function
    Replaces the /get-embed-url endpoint from Express.js
    """
    try:
        print('Received request for QuickSight embed URL')
        
        # Initialize QuickSight client
        quicksight = boto3.client('quicksight', region_name='us-east-1')
        
        # QuickSight configuration - Using QUICKSIGHT identity type
        params = {
            'AwsAccountId': os.environ.get('AWS_ACCOUNT_ID', '761386521687'),
            'DashboardId': os.environ.get('QUICKSIGHT_DASHBOARD_ID', 'e098949c-c065-42b6-a884-ac41d4167ad5'),
            'IdentityType': 'QUICKSIGHT',
            'UserArn': os.environ.get('QUICKSIGHT_USER_ARN', 
                'arn:aws:quicksight:us-east-1:761386521687:user/default/AWSReservedSSO_awsisb_IsbUsersPS_2adaac1b09fb84e1/22004840@siswa.um.edu.my'),
            'SessionLifetimeInMinutes': 600,  # 10 hours
            'UndoRedoDisabled': False,
            'ResetDisabled': False,
            'StatePersistenceEnabled': True
        }
        
        print(f"QuickSight parameters: Account={params['AwsAccountId']}, Dashboard={params['DashboardId']}")
        
        # Get the embed URL from QuickSight
        result = quicksight.get_dashboard_embed_url(**params)
        
        print('Successfully retrieved embed URL')
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'embedUrl': result['EmbedUrl'],
                'requestId': result['RequestId'],
                'status': result.get('Status'),
                'timestamp': datetime.now().isoformat()
            })
        }
        
    except Exception as error:
        print(f'Error getting QuickSight embed URL: {error}')
        
        # Handle specific AWS errors
        status_code = 500
        error_message = 'Internal server error'
        
        if hasattr(error, 'response'):
            error_code = error.response.get('Error', {}).get('Code', '')
            
            if error_code == 'ResourceNotFoundException':
                status_code = 404
                error_message = 'Dashboard not found'
            elif error_code == 'AccessDeniedException':
                status_code = 403
                error_message = 'Access denied to QuickSight resource'
            elif error_code == 'ThrottlingException':
                status_code = 429
                error_message = 'Request rate limit exceeded'
            elif error_code == 'InvalidParameterValueException':
                status_code = 400
                error_message = 'Invalid parameters provided'
        
        return {
            'statusCode': status_code,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'error': error_message,
                'code': getattr(error, 'response', {}).get('Error', {}).get('Code', 'UnknownError'),
                'timestamp': datetime.now().isoformat(),
                # Only include detailed error in development
                'details': str(error) if os.environ.get('NODE_ENV') == 'development' else None
            })
        }