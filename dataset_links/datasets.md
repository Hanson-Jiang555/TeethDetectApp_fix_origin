# 📦 公开数据集 & 预训练模型汇总

## ⭐ 快速上手推荐（最快方案）

### 方案1: Roboflow 在线合并（推荐新手）
1. 注册 https://app.roboflow.com
2. 搜索 "dental" → 找到以下项目并Fork到自己的workspace：
   - dental-caries-detection (你当前用的)
   - dental-disease-detection
   - teeth-orthodontics
3. 在你的workspace创建新项目，合并这些数据集
4. 统一类别名，导出 YOLOv8 格式
5. 用导出的数据直接训练

### 方案2: 用脚本自动准备
`ash
cd D:\4444444\Claw_fix
python scripts/prepare_data.py  # 会自动复制现有数据并转为多类别格式
python scripts/augment_data.py  # 数据增强
python scripts/train_model.py   # 开始训练
`

---

## 📊 数据集清单

### 已标注（YOLO格式，可直接用）

| # | 名称 | 类别 | 来源 | 链接 |
|---|------|------|------|------|
| 1 | Dental Caries | Caries, Tooth | Roboflow | https://universe.roboflow.com/dental-caries-ywg6c/dental-caries-k6zz1/dataset/6 |
| 2 | Dental Disease | cavity, calculus | Roboflow | https://universe.roboflow.com/search?q=dental+disease |
| 3 | Teeth Detection | teeth, brackets | Roboflow | https://universe.roboflow.com/search?q=teeth+detection |
| 4 | Oral Health | multi-class | Roboflow | https://universe.roboflow.com/search?q=oral+health |

### 需要转换（其他格式）

| # | 名称 | 说明 | 链接 |
|---|------|------|------|
| 5 | Dental Caries Dataset (Kaggle) | X光片，龋齿标注 | https://www.kaggle.com/datasets/datamunge/dental-caries-dataset |
| 6 | Teeth Segmentation | 牙齿分割 | https://www.kaggle.com/datasets/shsyanimatenetooth/teeth-segmentation-dataset |
| 7 | Dental X-ray | 牙科X光 | kaggle搜索 "dental x-ray" |
| 8 | Roboflow Universe | 大量牙科项目合集 | https://universe.roboflow.com/search?q=dental |

### 下载方式

**Roboflow (推荐):**
`python
pip install roboflow
from roboflow import Roboflow
rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("dental-caries-ywg6c").project("dental-caries-k6zz1")
version = project.version(6)
dataset = version.download("yolov8")
`

**Kaggle:**
`ash
pip install kaggle
# 先到 kaggle.com 设置 API token
kaggle datasets download -d datamunge/dental-caries-dataset
`

---

## 🧠 GitHub 预训练模型 & 项目

### 搜索关键词
在 GitHub 搜索以下关键词可找到预训练模型：
- dental caries detection yolov8
- 	ooth detection yolo
- oral health detection
- dental disease classification

### 知名项目（搜索GitHub）

1. **dental-caries-detection**
   - 搜索: github dental caries yolov8
   - 多个项目包含训练好的 .pt 权重文件

2. **Teeth Detection & Classification**
   - 搜索: github teeth detection yolo
   - 有些项目提供 Google Drive 链接下载权重

3. **Oral Disease Detection**
   - 搜索: github oral disease detection deep learning
   - 有用 ResNet/EfficientNet 的分类方案

### 使用预训练模型微调
`python
from ultralytics import YOLO
# 如果下载到了别人训练好的 dental.pt
model = YOLO("dental.pt")
# 用你的数据微调
model.train(data="dental.yaml", epochs=100, lr0=0.001)
`

---

## 📏 数据标注指南

如果需要自己标注，推荐工具：

### Label Studio (免费)
- 官网: https://labelstud.io/
- 支持图像分割标注
- 可导出 YOLO 格式
- 教程: https://labelstud.io/guide/

### Roboflow Online (免费额度)
- 官网: https://roboflow.com
- 在线标注+数据增强+导出
- 最省事

### 标注规范
1. 每颗牙齿单独标注
2. 龋齿区域框出来
3. 牙菌斑/牙结石单独标注
4. 缺牙位置标为 Missing_Tooth
5. 牙龈红肿区域标为 Gingivitis

---

## 💡 数据增强策略

运行 python scripts/augment_data.py --multiplier 5 会自动做：
- 水平翻转
- 亮度/对比度变化（模拟不同光线）
- 高斯模糊（模拟手抖）
- 色温偏移（模拟不同手机屏幕）
- YOLO内置: Mosaic, MixUp, HSV变换

目标：每类至少 500 张
