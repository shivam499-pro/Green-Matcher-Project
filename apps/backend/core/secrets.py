"""
Green Matchers - Secrets Manager Integration
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

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
        logger.debug(f"Secret '{secret_name}' found in environment")
        return value
    
    logger.debug(f"Secret '{secret_name}' not in environment, trying AWS Secrets Manager")
    
    # Try AWS Secrets Manager
    try:
        import boto3  # type: ignore
        client = boto3.client('secretsmanager')
        response = client.get_secret_value(SecretId=f'green-matchers/{secret_name}')
        logger.info(f"Secret '{secret_name}' retrieved from AWS Secrets Manager")
        return response['SecretString']
    except Exception as e:
        logger.warning(f"Failed to get '{secret_name}' from AWS Secrets Manager: {e}")
    
    logger.debug(f"Secret '{secret_name}' not in AWS, trying Azure Key Vault")
    
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
        logger.info(f"Secret '{secret_name}' retrieved from Azure Key Vault")
        return secret.value
    except Exception as e:
        logger.warning(f"Failed to get '{secret_name}' from Azure Key Vault: {e}")
    
    # Return default if available
    if default:
        logger.debug(f"Returning default value for secret '{secret_name}'")
        return default
    
    logger.error(f"Secret '{secret_name}' not found in any source")
    raise ValueError(f"Secret '{secret_name}' not found")
