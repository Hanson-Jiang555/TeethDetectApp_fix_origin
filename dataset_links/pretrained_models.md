# 🔧 预训练模型汇总

## 一、可直接微调的模型

### 1. Ultralytics YOLOv11 (推荐)
- **链接**: https://github.com/ultralytics/ultralytics
- **安装**: pip install ultralytics
- **使用**: 
  `python
  from ultralytics import YOLO
  model = YOLO("yolo11n-seg.pt")  # 预训练分割模型
  model.train(data="dental.yaml", epochs=150)
  `
- **说明**: 最新版YOLO，精度最好，支持分割

### 2. YOLOv8-seg (你目前在用的)
- **链接**: https://github.com/ultralytics/ultralytics
- **模型**: yolo8n-seg.pt, yolo8s-seg.pt, yolo8m-seg.pt
- **说明**: 你已有 best.pt 可作为微调起点

### 3. SAM (Segment Anything Model)
- **链接**: https://github.com/facebookresearch/segment-anything
- **用途**: 先用SAM精确分割每颗牙齿，再分类
- **微调版**: https://github.com/z-x-yang/Segment-and-Track-Anything

### 4. GitHub 口腔检测项目
- **Dental-Caries-Detection**: https://github.com/topics/dental-caries
- **Oral-Health**: 搜索 github "dental detection yolov8"
- **Teeth Detection**: https://github.com/topics/teeth-detection

---

## 二、推荐方案

### 🥇 首选: YOLOv11-seg + 你的现有数据微调
`
yolo11n-seg.pt (预训练) → 用你的 dental.yaml 微调 → dental_detector_v2.pt
`
优势: 
- 有COCO预训练权重，收敛快
- 支持分割，可以精确定位问题区域
- 部署简单（ONNX导出）

### 🥈 备选: 两阶段方案
`
Stage1: YOLO检测牙齿区域 (你已有)
Stage2: EfficientNet-B3 分类每颗牙齿 (7分类)
`
优势: 每个阶段更简单，分类精度可能更高

### 🥉 快速方案: 直接用 Roboflow 训练
在 Roboflow 网页上合并数据集 → 训练 → 下载权重
