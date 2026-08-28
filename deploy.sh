#!/bin/bash
# ============================================================
# 下一站·启航 - 全自动部署脚本（零交互）
# 适用于：Ubuntu / Debian / CentOS / Alibaba Cloud Linux
# 使用方式：bash deploy.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_KEY="sk-yvzibyfpatmnspsywtjaddtkjxbqticlquionzbvvaegnecm"

echo -e "${GREEN}"
echo "========================================"
echo "  下一站·启航 - 全自动部署中..."
echo "========================================"
echo -e "${NC}"

# 检测系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}无法识别操作系统${NC}"
    exit 1
fi

echo -e "${YELLOW}系统: $OS ${NC}"

# ---- 1. 安装 Node.js 20 ----
echo -e "${GREEN}[1/5] 安装 Node.js 20...${NC}"
if command -v node &> /dev/null; then
    NODE_VER=$(node -v | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_VER" -ge 18 ]; then
        echo -e "${YELLOW}  Node.js $(node -v) 已安装，跳过${NC}"
    else
        echo -e "${RED}  Node.js 版本过低，需要 18+${NC}"
        exit 1
    fi
else
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt update -y && apt install -y curl
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    else
        yum install -y curl
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi
    echo -e "${GREEN}  Node.js 安装完成: $(node -v)${NC}"
fi

# ---- 2. 安装 PM2 + Nginx ----
echo -e "${GREEN}[2/5] 安装 PM2 + Nginx...${NC}"
command -v pm2 &> /dev/null || npm install -g pm2
echo -e "${YELLOW}  PM2 就绪${NC}"

if ! command -v nginx &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt install -y nginx
    else
        yum install -y nginx
    fi
    systemctl enable nginx
    echo -e "${GREEN}  Nginx 安装完成${NC}"
else
    echo -e "${YELLOW}  Nginx 已安装${NC}"
fi

# ---- 3. 部署应用 ----
echo -e "${GREEN}[3/5] 构建项目...${NC}"
APP_DIR="/opt/nextstep"
mkdir -p $APP_DIR

# 如果当前目录有 package.json，复制过去
if [ -f ./package.json ] && [ "$(pwd)" != "$APP_DIR" ]; then
    echo "  复制项目文件到 $APP_DIR ..."
    cp -r ./* $APP_DIR/ 2>/dev/null || true
    cp -r ./.[!.]* $APP_DIR/ 2>/dev/null || true
fi

cd $APP_DIR

if [ ! -f package.json ]; then
    echo -e "${RED}  未找到 package.json！请先上传代码到 $APP_DIR${NC}"
    echo "  上传命令（在你本地电脑执行）:"
    echo "    scp -r 项目目录/* root@你的IP:/opt/nextstep/"
    exit 1
fi

echo "  安装依赖..."
npm ci --production=false 2>&1 | tail -3

echo "  构建生产版本..."
npm run build 2>&1 | tail -5

# ---- 4. 配置环境变量 ----
echo -e "${GREEN}[4/5] 配置环境变量...${NC}"
echo "SILICONFLOW_API_KEY=$API_KEY" > .env.local
echo -e "${GREEN}  API Key 已写入${NC}"

# ---- 5. 启动服务 ----
echo -e "${GREEN}[5/5] 启动服务...${NC}"
pm2 delete nextstep 2>/dev/null || true
pm2 start npm --name "nextstep" -- start
pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || true

# ---- 配置 Nginx ----
echo -e "${GREEN}配置 Nginx 反向代理...${NC}"
cat > /etc/nginx/conf.d/nextstep.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# 移除可能冲突的默认配置
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm -f /etc/nginx/sites-enabled/default
fi

nginx -t 2>&1 && systemctl restart nginx
echo -e "${GREEN}  Nginx 配置完成${NC}"

# ---- 完成 ----
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "========================================"
echo -e "${GREEN}  🎉 部署完成！${NC}"
echo "========================================"
echo ""
echo "  访问地址: http://$SERVER_IP"
echo "  (Nginx 80 端口，直接访问即可)"
echo ""
echo "  常用命令:"
echo "    pm2 status          查看状态"
echo "    pm2 logs nextstep   查看日志"
echo "    pm2 restart nextstep 重启"
echo ""
echo "========================================"
