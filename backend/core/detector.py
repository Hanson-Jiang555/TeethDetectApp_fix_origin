import os
import cv2
import numpy as np
from ultralytics import YOLO

# 类别定义
CLASS_NAMES = ["Tooth", "Caries", "Missing_Tooth", "Plaque", "Calculus", "Gingivitis", "Enamel_Wear"]

class DentalDetector:
    """YOLO 口腔检测器"""
    
    def __init__(self, model_path=None):
        if model_path is None:
            # 默认路径
            candidates = [
                os.path.join(os.path.dirname(__file__), "..", "models", "dental_detector_v2.pt"),
                os.path.join(os.path.dirname(__file__), "..", "best.pt"),
                r"D:\4444444\TeethDetectedApp\best.pt",
            ]
            for p in candidates:
                if os.path.exists(p):
                    model_path = p
                    break
            else:
                # 使用预训练模型
                model_path = "yolo11n-seg.pt"
                print("⚠️ 未找到训练好的模型，使用预训练模型（仅用于测试）")
        
        print(f"📦 加载模型: {model_path}")
        self.model = YOLO(model_path)
        self.class_names = CLASS_NAMES[:self.model.nc]
        print(f"✅ 模型已加载，类别: {self.class_names}")
    
    def detect(self, image, conf=0.3):
        """
        检测图片中的口腔问题
        返回: list of dict
        """
        results = self.model(image, conf=conf, verbose=False)
        detections = []
        img_h, img_w = image.shape[:2]
        
        for r in results:
            boxes = r.boxes
            for i in range(len(boxes)):
                cls_id = int(boxes.cls[i])
                conf_val = float(boxes.conf[i])
                xyxy = boxes.xyxy[i].cpu().numpy()
                
                # 计算面积占比
                x1, y1, x2, y2 = xyxy
                area = (x2 - x1) * (y2 - y1)
                area_ratio = area / (img_w * img_h)
                
                class_name = self.class_names[cls_id] if cls_id < len(self.class_names) else f"class_{cls_id}"
                
                detections.append({
                    "class_name": class_name,
                    "class_id": cls_id,
                    "confidence": round(conf_val, 4),
                    "area_ratio": round(area_ratio, 4),
                    "bbox": [round(float(x1), 2), round(float(y1), 2), round(float(x2), 2), round(float(y2), 2)],
                })
        
        # 按置信度排序
        detections.sort(key=lambda d: d["confidence"], reverse=True)
        return detections
