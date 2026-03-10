# 🚀 部署指南

## 本地开发

### 1. 环境安装
`ash
# 建议使用 conda
conda create -n smileguard python=3.10
conda activate smileguard

# 安装依赖
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install ultralytics opencv-python pillow mediapipe
pip install fastapi uvicorn python-multipart
`

### 2. 准备数据
`ash
cd D:\4444444\SmileGuard
python scripts/prepare_data.py
python scripts/augment_data.py
`

### 3. 训练
`ash
# 用现有模型微调（最快出结果）
python scripts/train_model.py --finetune --epochs 100

# 或从头训练
python scripts/train_model.py --epochs 150 --batch 16
`

### 4. 启动后端
`ash
cd D:\4444444\SmileGuard\backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
`

### 5. 小程序
- 用微信开发者工具打开 rontend/ 目录
- 在 pp.js 中修改 aseUrl 为后端地址
- 点击预览

---

## 服务器部署 (Docker)

### 构建镜像
`ash
cd D:\4444444\SmileGuard\backend
docker build -t smileguard-api .
`

### 运行
`ash
# CPU版
docker run -d -p 8000:8000 --name smileguard smileguard-api

# GPU版 (需要nvidia-docker)
docker run -d -p 8000:8000 --gpus all --name smileguard smileguard-api
`

### Nginx 反向代理 (小程序要求HTTPS)
`
ginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        client_max_body_size 10M;
    }
}
`

---

## 微信小程序发布

1. 修改 pp.js 中的 aseUrl 为线上地址
2. 在 project.config.json 中填入真实 appid
3. 微信开发者工具 → 上传
4. 微信公众平台 → 提交审核
5. 注意: 小程序需要备案域名
