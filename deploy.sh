#!/bin/bash
# Green Matchers - Production Deployment Script
# This script deploys the application to a production server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="green-matchers"
DEPLOY_USER="www-data"
DEPLOY_PATH="/var/www/${PROJECT_NAME}"
BACKEND_PATH="${DEPLOY_PATH}/backend"
FRONTEND_PATH="${DEPLOY_PATH}/frontend"
VENV_PATH="${BACKEND_PATH}/venv"

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_requirements() {
    print_header "Checking Requirements"
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
    
    # Check Python version
    if ! command -v python3.13 &> /dev/null; then
        print_error "Python 3.13 not found. Please install it first."
        exit 1
    fi
    print_success "Python 3.13 found"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install it first."
        exit 1
    fi
    print_success "Node.js found"
    
    # Check MariaDB
    if ! command -v mysql &> /dev/null; then
        print_error "MariaDB/MySQL not found. Please install it first."
        exit 1
    fi
    print_success "MariaDB found"
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx not found. Please install it first."
        exit 1
    fi
    print_success "Nginx found"
}

create_directories() {
    print_header "Creating Directories"
    
    mkdir -p ${DEPLOY_PATH}
    mkdir -p ${BACKEND_PATH}
    mkdir -p ${FRONTEND_PATH}
    mkdir -p ${BACKEND_PATH}/logs
    
    print_success "Directories created"
}

deploy_backend() {
    print_header "Deploying Backend"
    
    # Copy backend files
    print_warning "Copying backend files..."
    cp -r ./apps/backend/* ${BACKEND_PATH}/
    
    # Create virtual environment
    print_warning "Creating virtual environment..."
    python3.13 -m venv ${VENV_PATH}
    
    # Install dependencies
    print_warning "Installing Python dependencies..."
    ${VENV_PATH}/bin/pip install --upgrade pip
    ${VENV_PATH}/bin/pip install -r ${BACKEND_PATH}/requirements.txt
    
    # Copy .env.production
    if [ -f "./apps/backend/.env.production" ]; then
        cp ./apps/backend/.env.production ${BACKEND_PATH}/.env.production
        print_success "Environment file copied"
    else
        print_error ".env.production not found!"
        exit 1
    fi
    
    print_success "Backend deployed"
}

deploy_frontend() {
    print_header "Deploying Frontend"
    
    # Build frontend
    print_warning "Building frontend..."
    cd ./apps/web
    npm install
    npm run build
    cd ../..
    
    # Copy build files
    print_warning "Copying frontend build..."
    cp -r ./apps/web/dist/* ${FRONTEND_PATH}/
    
    print_success "Frontend deployed"
}

setup_database() {
    print_header "Setting Up Database"
    
    print_warning "Please run database migrations manually:"
    echo "  mysql -u root -p < setup-database.sql"
    echo "  cd ${BACKEND_PATH} && ${VENV_PATH}/bin/python scripts/seed_database.py"
}

setup_nginx() {
    print_header "Setting Up Nginx"
    
    # Copy nginx config
    if [ -f "./nginx-config.conf" ]; then
        cp ./nginx-config.conf /etc/nginx/sites-available/${PROJECT_NAME}
        
        # Create symlink
        ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/${PROJECT_NAME}
        
        # Test nginx config
        if nginx -t; then
            print_success "Nginx configuration valid"
        else
            print_error "Nginx configuration invalid"
            exit 1
        fi
    else
        print_warning "nginx-config.conf not found. Please configure Nginx manually."
    fi
}

setup_systemd() {
    print_header "Setting Up Systemd Service"
    
    # Copy service file
    if [ -f "./green-matchers.service" ]; then
        cp ./green-matchers.service /etc/systemd/system/
        
        # Reload systemd
        systemctl daemon-reload
        
        # Enable service
        systemctl enable ${PROJECT_NAME}
        
        print_success "Systemd service configured"
    else
        print_warning "green-matchers.service not found. Please configure systemd manually."
    fi
}

set_permissions() {
    print_header "Setting Permissions"
    
    # Set ownership
    chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_PATH}
    
    # Set permissions
    chmod -R 755 ${DEPLOY_PATH}
    chmod 600 ${BACKEND_PATH}/.env.production
    
    print_success "Permissions set"
}

setup_ssl() {
    print_header "SSL Setup"
    
    print_warning "To set up SSL with Let's Encrypt:"
    echo "  1. Update nginx-config.conf with your domain"
    echo "  2. Run: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
    echo "  3. Restart Nginx: sudo systemctl restart nginx"
}

start_services() {
    print_header "Starting Services"
    
    # Start backend
    systemctl start ${PROJECT_NAME}
    print_success "Backend started"
    
    # Reload nginx
    systemctl reload nginx
    print_success "Nginx reloaded"
}

print_completion() {
    print_header "Deployment Complete!"
    
    echo -e "${GREEN}✓ Backend deployed to: ${BACKEND_PATH}${NC}"
    echo -e "${GREEN}✓ Frontend deployed to: ${FRONTEND_PATH}${NC}"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "  1. Update .env.production with production values"
    echo "  2. Update nginx-config.conf with your domain"
    echo "  3. Set up SSL certificate"
    echo "  4. Run database migrations"
    echo "  5. Restart services: sudo systemctl restart ${PROJECT_NAME}"
    echo -e "\n${YELLOW}Service Management:${NC}"
    echo "  Status:  sudo systemctl status ${PROJECT_NAME}"
    echo "  Logs:    sudo journalctl -u ${PROJECT_NAME} -f"
    echo "  Restart: sudo systemctl restart ${PROJECT_NAME}"
}

# Main deployment flow
main() {
    print_header "Green Matchers - Production Deployment"
    
    check_requirements
    create_directories
    deploy_backend
    deploy_frontend
    setup_database
    setup_nginx
    setup_systemd
    set_permissions
    setup_ssl
    start_services
    print_completion
}

# Run deployment
main
