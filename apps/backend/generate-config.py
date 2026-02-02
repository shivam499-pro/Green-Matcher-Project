#!/usr/bin/env python3
"""
Green Matchers - Quick Production Config Generator
Generates secure production environment variables
"""

import secrets
import sys

def generate_jwt_secret():
    """Generate a secure JWT secret key"""
    return secrets.token_urlsafe(32)

def generate_db_password():
    """Generate a secure database password"""
    return secrets.token_urlsafe(24)

def main():
    print("=" * 60)
    print("Green Matchers - Production Configuration Generator")
    print("=" * 60)
    print()
    
    # Get user input
    print("Please provide the following information:")
    print()
    
    domain = input("Your domain (e.g., greenmatchers.com): ").strip()
    if not domain:
        print("Error: Domain is required")
        sys.exit(1)
    
    db_host = input("Database host [localhost]: ").strip() or "localhost"
    db_user = input("Database user [green_user]: ").strip() or "green_user"
    db_name = input("Database name [green_matchers]: ").strip() or "green_matchers"
    
    print("\nGenerating secure credentials...")
    
    # Generate secrets
    jwt_secret = generate_jwt_secret()
    db_password = generate_db_password()
    
    # Generate .env.production content
    env_content = f"""# Green Matchers - Production Environment Configuration
# Generated on: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# Database Configuration
DATABASE_URL=mariadb+pymysql://{db_user}:{db_password}@{db_host}:3306/{db_name}

# JWT Authentication
JWT_SECRET_KEY={jwt_secret}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS Settings
CORS_ORIGINS=https://{domain},https://www.{domain}

# Application Settings
APP_NAME=Green Matchers
APP_VERSION=1.0.0
APP_DESCRIPTION=AI-native green-jobs platform for India

# Environment
ENVIRONMENT=production
"""
    
    # Save to file
    output_file = ".env.production.generated"
    with open(output_file, 'w') as f:
        f.write(env_content)
    
    print()
    print("=" * 60)
    print("✓ Configuration generated successfully!")
    print("=" * 60)
    print()
    print(f"File saved as: {output_file}")
    print()
    print("IMPORTANT: Save these credentials securely!")
    print("-" * 60)
    print(f"Database Password: {db_password}")
    print(f"JWT Secret Key:    {jwt_secret}")
    print("-" * 60)
    print()
    print("Next steps:")
    print(f"1. Review {output_file}")
    print("2. Create database user with the generated password:")
    print(f"   CREATE USER '{db_user}'@'{db_host}' IDENTIFIED BY '{db_password}';")
    print(f"   GRANT ALL PRIVILEGES ON {db_name}.* TO '{db_user}'@'{db_host}';")
    print(f"3. Rename to .env.production: mv {output_file} .env.production")
    print("4. Secure the file: chmod 600 .env.production")
    print()

if __name__ == "__main__":
    main()
