# 🦷 Claw Fix — 口腔AI智能筛查系统

> 微信小程序 + FastAPI后端 + YOLO多类别检测，拍照即可筛查口腔问题

## ⚠️ 重要须知（必读）

### 当前状态
- ✅ 代码完整：前端、后端、训练脚本全部写好
- ✅ 可直接运行：用现有数据微调后就能用
- ⚠️ **数据限制**：现有数据集仅含2类（龋齿、牙齿），需要补充多类别数据才能检测牙菌斑、牙结石、缺牙、牙龈炎等

### 你必须做的事情
1. **准备数据**（最关键！）— 详见下方「数据准备」章节
2. **注册 Roboflow** 获取免费数据集（推荐）
3. **填写小程序 appid** — 在 `frontend/project.config.json` 中填写你的微信小程序 AppID
4. **配置后端地址** — 部署后修改 `frontend/app.js` 中的 `baseUrl`

### 免责声明
本工具仅供口腔健康**初筛参考**，**不能替代专业牙科医生的临床诊断**。

---


---

## 📖 关于本项目

**Claw Fix** 是一款面向普通用户的**居家口腔健康AI初筛工具**，以微信小程序为载体，用户只需用手机拍一张牙齿照片，系统即可自动识别潜在的口腔问题并给出建议。

### 为什么做这个项目？

我国口腔健康问题普遍且重视不足。根据《第四次全国口腔健康流行病学调查》，超过90%的成年人存在不同程度的牙周问题，但大多数人只有在疼痛严重时才就医，往往错过了最佳治疗时机。早期龋齿、牙龈炎等如果能在早期发现，治疗简单、费用低、痛苦小。

本项目的目标是让普通人**在家就能做初步的口腔健康筛查**，降低就医门槛，提高早期发现率。

### 核心功能

- 📷 **拍照即检** — 打开小程序，拍一张牙齿照片，AI自动分析
- 🦷 **7类口腔问题识别** — 龋齿、缺牙、牙菌斑、牙结石、牙龈炎、釉质磨损等
- 📊 **严重程度分级** — 健康 / 轻度 / 中度 / 重度，直观评分
- 💡 **个性化建议** — 根据检测结果给出具体的护理和就医建议
- 📋 **历史记录** — 追踪口腔健康变化趋势
- 🔒 **隐私保护** — 照片仅在本地处理，不上传云端（本地部署模式）

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | 微信小程序 (原生) | 轻量、无需安装、用户门槛低 |
| 后端 | FastAPI + Python | 高性能异步API，支持GPU加速推理 |
| AI模型 | YOLOv11 (Ultralytics) | 实时目标检测，支持多类别 |
| 前置检查 | MediaPipe Face Detection | 确保照片包含人脸和牙齿，减少无效检测 |
| 部署 | Docker / 云服务器 | 一键部署，支持CPU和GPU |

### 适用场景

- 🏠 家庭日常口腔健康自检
- 👶 关注孩子牙齿发育情况的家长
- 👴 老年人居家口腔监测
- 📱 口腔健康意识提升和科普
- 🏥 牙科诊所的初步筛查辅助工具

### 局限性

- ⚠️ 本工具**仅用于初筛参考**，不能替代专业牙科诊断
- ⚠️ 检测精度依赖训练数据量，当前数据集有限
- ⚠️ 拍照角度、光线等外部因素会影响检测效果
- ⚠️ 对于早期微小病变的识别能力有限

## 📁 项目结构

```
Claw_fix/
├── README.md                    # 项目说明文件
├── .gitignore                   # Git忽略规则
├── setup.bat                    # Windows一键环境安装脚本
├── dataset_links/               # 数据集资源
│   ├── datasets.md              # 公开数据集清单（含下载方式）
│   └── pretrained_models.md     # 预训练模型方案
├── scripts/                     # 训练脚本
│   ├── collect_datasets.py      # 数据集下载引导
│   ├── prepare_data.py          # 数据格式转换
│   ├── augment_data.py          # 数据增强（5倍扩充）
│   ├── train_model.py           # 模型训练
│   ├── export_model.py          # 模型导出（ONNX）
│   └── evaluate.py              # 模型评估
├── data/                        # 数据目录（运行脚本后生成）
├── models/                      # 模型权重（训练后生成）
├── backend/                     # FastAPI 后端
│   ├── requirements.txt
│   ├── main.py                  # API 入口
│   ├── Dockerfile               # Docker部署
│   └── core/
│       ├── detector.py          # YOLO检测器
│       ├── face_check.py        # 人脸+牙齿前置检查
│       ├── rule_engine.py       # 规则引擎（分级+建议）
│       └── models.py            # 数据模型定义
├── frontend/                    # 微信小程序
│   ├── app.js / app.json / app.wxss
│   ├── project.config.json      # ⚠️ 需要填写你的AppID
│   ├── pages/
│   │   ├── index/               # 首页
│   │   ├── camera/              # 拍照页（含重拍引导）
│   │   ├── result/              # 检测结果页（评分+建议）
│   │   └── history/             # 历史记录
│   └── utils/api.js             # API调用封装
└── docs/
    └── deployment.md            # 部署指南
```

---

## 🚀 完整执行步骤

### 前置要求
- **Python 3.9+**（推荐 3.10）
- **显卡**: 有NVIDIA GPU更好，没有也能跑（CPU模式，慢一些）
- **微信开发者工具**: [下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- **Roboflow账号**: https://app.roboflow.com （免费，用于获取数据集）

---

### Step 0: 安装环境

**方式A（推荐）: 双击一键脚本**

```
双击运行: setup.bat
```

**方式B: 手动安装**

```bash
# 创建虚拟环境（推荐）
conda create -n clawfix python=3.10
conda activate clawfix

# 安装核心依赖
pip install ultralytics opencv-python pillow mediapipe
pip install fastapi uvicorn python-multipart

# 如果有GPU，安装对应版本的PyTorch
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

---

### Step 1: 准备数据（⚠️ 最关键步骤）

#### 方案A: 先用现有数据跑通（快速验证）

```bash
cd D:\4444444\Claw_fix
python scripts/prepare_data.py
python scripts/augment_data.py --multiplier 5
```

> 这会把你现有的 TeethDetectedApp 数据复制过来并增强，**但只有2类**

#### 方案B: 获取多类别数据（正式使用）

**1. 注册 Roboflow 并获取 API Key**
- 打开 https://app.roboflow.com 注册
- 点右上角头像 → Settings → API Keys → Copy

**2. 搜索并下载牙科数据集**

在 Roboflow Universe 搜索以下关键词：
- dental caries — 龋齿
- dental plaque — 牙菌斑
- dental calculus — 牙结石
- tooth missing — 缺牙
- gingivitis — 牙龈炎
- oral health — 口腔健康

选择标注质量高、类别多的项目，Fork到自己的workspace

**3. 用Python下载数据**

```python
pip install roboflow
python -c "
from roboflow import Roboflow
rf = Roboflow(api_key='你的API_KEY')
# 搜索后替换为实际项目名
project = rf.workspace('xxx').project('xxx')
version = project.version(1)
dataset = version.download('yolov8')
"
```

**4. 将下载的数据放到 data/raw/ 目录**

**5. 统一类别名**

确保所有数据集的 data.yaml 中类别名一致：

```yaml
names: ['Tooth', 'Caries', 'Missing_Tooth', 'Plaque', 'Calculus', 'Gingivitis', 'Enamel_Wear']
```

**6. 转换格式**

```bash
python scripts/prepare_data.py --input data/raw --output data/processed
python scripts/augment_data.py --input data/processed --output data/augmented --multiplier 5
```

> 💡 **数据量建议**: 每个类别至少 500 张图。数据越多，检测越准。

---

### Step 2: 训练模型

```bash
cd D:\4444444\Claw_fix

# 用现有模型微调（推荐，收敛快）
python scripts/train_model.py --finetune --epochs 100 --batch 16

# 或从头训练（数据够多时）
python scripts/train_model.py --data data/augmented/dental.yaml --epochs 150 --batch 16

# 评估模型效果
python scripts/evaluate.py --weights models/dental_detector_v2.pt

# 导出为ONNX（部署用）
python scripts/export_model.py --weights models/dental_detector_v2.pt --format onnx
```

**训练参数说明：**

| 参数 | 说明 | 建议 |
|------|------|------|
| --epochs | 训练轮数 | 数据少100轮，数据多150-200轮 |
| --batch | 批次大小 | GPU显存8G用16，显存小用8 |
| --imgsz | 图片大小 | 默认640，够用 |
| --finetune | 微调模式 | 用现有模型继续训练 |

**训练输出在：**

```
runs/segment/train/weights/best.pt  → 自动复制到 models/dental_detector_v2.pt
```

---

### Step 3: 启动后端

```bash
cd D:\4444444\Claw_fix\backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/api/health

**测试上传检测：**

```bash
curl -X POST http://localhost:8000/api/detect -F "file=@test_photo.jpg"
```

---

### Step 4: 配置小程序

**必须修改的文件：**

1. `frontend/app.js` → 修改 `baseUrl` 为你的后端地址

```js
baseUrl: 'https://your-domain.com'  // 部署后的线上地址
```

2. `frontend/project.config.json` → 填写你的 AppID

```json
"appid": "wx1234567890abcdef"  // 你的小程序AppID
```

3. 用微信开发者工具打开 `frontend/` 目录
4. 点击「预览」或「真机调试」

---

### Step 5: 正式部署

详见 [docs/deployment.md](docs/deployment.md)

**快速部署（Docker）：**

```bash
cd D:\4444444\Claw_fix\backend
docker build -t clawfix-api .
docker run -d -p 8000:8000 --gpus all clawfix-api  # GPU版
docker run -d -p 8000:8000 clawfix-api              # CPU版
```

---

## 📊 检测类别

| 类别ID | 英文名 | 中文 | 说明 |
|--------|--------|------|------|
| 0 | Tooth | 健康牙齿 | 基准类别 |
| 1 | Caries | 龋齿/蛀牙 | 含早期龋 |
| 2 | Missing_Tooth | 缺牙 | 牙齿缺失 |
| 3 | Plaque | 牙菌斑 | 需大量数据 |
| 4 | Calculus | 牙结石 | 较易识别 |
| 5 | Gingivitis | 牙龈炎 | 红肿出血 |
| 6 | Enamel_Wear | 釉质磨损 | 牙齿磨损 |

---

## 🏗️ 系统流程

```
用户拍照
  │
  ▼
[1] 人脸检测 (MediaPipe)
  │ 没人脸 → "请正对镜头拍摄"
  ▼
[2] 牙齿区域检测 (YOLO)
  │ 没牙齿 → "请张大嘴巴，露出牙齿"
  ▼
[3] 多类别检测 (YOLOv11)
  │
  ▼
[4] 规则引擎 → 严重程度分级
  │  🟢 健康  🟡 轻度  🟠 中度  🔴 重度
  ▼
[5] 生成报告 + 就医建议
```

---

## 🌐 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| POST | /api/check-photo | 前置检查（人脸+牙齿） |
| POST | /api/detect | 完整检测（上传图片→返回报告） |
| GET | /api/report/{id} | 查询历史报告 |

---

## ❓ 常见问题

### Q: 训练很慢怎么办？
A: 减小 --batch，或加 --epochs 少训几轮先看效果。有GPU一定要装CUDA版PyTorch。

### Q: 精度不够怎么办？
A: 增加数据量！每类至少500张。数据质量比模型架构更重要。

### Q: 只能检测重度龋齿？
A: 因为现有数据以重度为主。需要补充早期龋齿的标注数据。

### Q: 小程序连不上后端？
A: 检查 `app.js` 中的 `baseUrl`，本地调试用 http://localhost:8000，正式发布需要HTTPS域名。

### Q: 没有 GPU 怎么办？
A: CPU也能跑，就是推理慢一些（1-3秒 vs 0.1秒）。可以用 Google Colab 免费 GPU 训练。

---

## 📝 License

MIT