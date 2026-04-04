
import jwt  # PyJWT
import datetime

# Secret key to encode and decode the JWT
SECRET_KEY = 'your_secret_key'

# Function to generate a new token

def generate_token(user_id):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
    token = jwt.encode({'user_id': user_id, 'exp': expiration_time}, SECRET_KEY, algorithm='HS256')
    return token

# Function to verify the token

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return 'Token expired. Please log in again.'
    except jwt.InvalidTokenError:
        return 'Invalid token. Please log in again.'

