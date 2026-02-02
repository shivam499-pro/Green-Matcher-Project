#!/usr/bin/env python3
"""
Green Matchers - Pre-Deployment Verification Script
Checks if the application is ready for production deployment
"""

import os
import sys
import subprocess
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def print_check(passed, message):
    symbol = f"{Colors.GREEN}✓{Colors.RESET}" if passed else f"{Colors.RED}✗{Colors.RESET}"
    status = f"{Colors.GREEN}PASS{Colors.RESET}" if passed else f"{Colors.RED}FAIL{Colors.RESET}"
    print(f"{symbol} [{status}] {message}")
    return passed

def check_python_version():
    """Check Python version >= 3.13"""
    version = sys.version_info
    required = (3, 13)
    passed = version >= required
    print_check(passed, f"Python version: {version.major}.{version.minor}.{version.micro} (Required: 3.13+)")
    return passed

def check_file_exists(filepath, description):
    """Check if a file exists"""
    path = Path(filepath)
    passed = path.exists()
    print_check(passed, f"{description}: {filepath}")
    return passed

def check_env_variables(env_file):
    """Check if .env.production has all required variables"""
    required_vars = [
        'DATABASE_URL',
        'JWT_SECRET_KEY',
        'JWT_ALGORITHM',
        'ACCESS_TOKEN_EXPIRE_MINUTES',
        'CORS_ORIGINS',
        'ENVIRONMENT'
    ]
    
    if not Path(env_file).exists():
        print_check(False, f"Environment file not found: {env_file}")
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    all_present = True
    for var in required_vars:
        present = var in content
        if not present:
            print_check(False, f"Missing environment variable: {var}")
            all_present = False
    
    if all_present:
        print_check(True, "All required environment variables present")
    
    return all_present

def check_security_settings(env_file):
    """Check if production security settings are properly configured"""
    issues = []
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Check for placeholder values
    if 'your-strong-password' in content:
        issues.append("DATABASE_URL still has placeholder password")
    
    if 'your-generated-secret-key-here' in content:
        issues.append("JWT_SECRET_KEY still has placeholder value")
    
    if 'yourdomain.com' in content:
        issues.append("CORS_ORIGINS still has placeholder domain")
    
    if 'localhost' in content:
        issues.append("localhost found in production config")
    
    if issues:
        for issue in issues:
            print_check(False, issue)
        return False
    else:
        print_check(True, "No security placeholders found")
        return True

def check_database_connection():
    """Check if database is accessible"""
    try:
        # This is a placeholder - actual check would require database credentials
        print(f"{Colors.YELLOW}⚠{Colors.RESET}  [SKIP] Database connection check (requires manual verification)")
        return None
    except Exception as e:
        print_check(False, f"Database connection failed: {str(e)}")
        return False

def check_dependencies():
    """Check if all dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        from sentence_transformers import SentenceTransformer
        
        print_check(True, "All core dependencies installed")
        return True
    except ImportError as e:
        print_check(False, f"Missing dependency: {str(e)}")
        return False

def check_frontend_build():
    """Check if frontend is built"""
    dist_path = Path("../web/dist")
    if not dist_path.exists():
        print_check(False, "Frontend not built. Run: npm run build")
        return False
    
    index_html = dist_path / "index.html"
    if not index_html.exists():
        print_check(False, "Frontend build incomplete (missing index.html)")
        return False
    
    print_check(True, "Frontend build exists")
    return True

def check_secret_key_strength(env_file):
    """Check if JWT secret key is strong enough"""
    with open(env_file, 'r') as f:
        for line in f:
            if line.startswith('JWT_SECRET_KEY='):
                secret = line.split('=', 1)[1].strip()
                if len(secret) < 32:
                    print_check(False, f"JWT secret key too short (length: {len(secret)}, minimum: 32)")
                    return False
                print_check(True, f"JWT secret key length OK ({len(secret)} characters)")
                return True
    
    print_check(False, "JWT_SECRET_KEY not found in .env.production")
    return False

def generate_recommendations(results):
    """Generate recommendations based on check results"""
    print_header("RECOMMENDATIONS")
    
    if not results['env_file']:
        print(f"{Colors.YELLOW}📝 Create .env.production file{Colors.RESET}")
        print("   Copy from .env.example and update with production values")
    
    if not results['security']:
        print(f"\n{Colors.YELLOW}🔒 Update security settings:{Colors.RESET}")
        print("   1. Generate strong JWT secret: python -c 'import secrets; print(secrets.token_urlsafe(32))'")
        print("   2. Update DATABASE_URL with production credentials")
        print("   3. Set CORS_ORIGINS to your production domain")
    
    if not results['secret_strength']:
        print(f"\n{Colors.YELLOW}🔑 Generate stronger JWT secret:{Colors.RESET}")
        print("   python -c 'import secrets; print(secrets.token_urlsafe(32))'")
    
    if not results['frontend_build']:
        print(f"\n{Colors.YELLOW}🏗️  Build frontend:{Colors.RESET}")
        print("   cd ../web && npm run build")
    
    if not all([results['env_file'], results['security'], results['secret_strength'], results['frontend_build']]):
        print(f"\n{Colors.RED}❌ NOT READY FOR DEPLOYMENT{Colors.RESET}")
        return False
    else:
        print(f"\n{Colors.GREEN}✅ READY FOR DEPLOYMENT{Colors.RESET}")
        return True

def main():
    print_header("GREEN MATCHERS - DEPLOYMENT READINESS CHECK")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    results = {
        'python': False,
        'dependencies': False,
        'env_file': False,
        'env_vars': False,
        'security': False,
        'secret_strength': False,
        'frontend_build': False,
    }
    
    # System checks
    print_header("SYSTEM CHECKS")
    results['python'] = check_python_version()
    results['dependencies'] = check_dependencies()
    
    # Configuration checks
    print_header("CONFIGURATION CHECKS")
    results['env_file'] = check_file_exists('.env.production', '.env.production file')
    
    if results['env_file']:
        results['env_vars'] = check_env_variables('.env.production')
        results['security'] = check_security_settings('.env.production')
        results['secret_strength'] = check_secret_key_strength('.env.production')
    
    # Build checks
    print_header("BUILD CHECKS")
    results['frontend_build'] = check_frontend_build()
    
    # Database check
    print_header("DATABASE CHECKS")
    check_database_connection()
    
    # Generate recommendations
    ready = generate_recommendations(results)
    
    return 0 if ready else 1

if __name__ == "__main__":
    sys.exit(main())
