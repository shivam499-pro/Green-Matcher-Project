"""
Green Matchers - Secrets Manager Integration
"""
import os
from typing import Optional

def get_secret(secret_name: str, default: Optional[str] = None) -> str:
    """
    Get secret from environment or secrets manager.
    
    Args:
        secret_name: Name of the secret
        default: Default value if secret not found
        
    Returns:
        Secret value
    """
    # Try environment variable first
    value = os.getenv(secret_name)
    if value:
        return value
    
    # Try AWS Secrets Manager
    try:
        import boto3  # type: ignore
        client = boto3.client('secretsmanager')
        response = client.get_secret_value(SecretId=f'green-matchers/{secret_name}')
        return response['SecretString']
    except Exception:
        pass

    # Try Azure Key Vault
    try:
        from azure.identity import DefaultAzureCredential  # type: ignore
        from azure.keyvault.secrets import SecretClient  # type: ignore
        vault_url = os.getenv('AZURE_KEY_VAULT_URL')
        if not vault_url:
            raise ValueError("AZURE_KEY_VAULT_URL environment variable not set")
        credential = DefaultAzureCredential()
        client = SecretClient(
            vault_url=vault_url,
            credential=credential
        )
        secret = client.get_secret(secret_name)
        return secret.value
    except Exception:
        pass
    
    # Return default if available
    if default:
        return default
    
    raise ValueError(f"Secret '{secret_name}' not found")
