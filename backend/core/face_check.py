import os
import cv2
import numpy as np

class FaceChecker:
    """人脸+牙齿前置检查"""
    
    def __init__(self):
        self.face_detector = None
        self._init_mediapipe()
    
    def _init_mediapipe(self):
        try:
            import mediapipe as mp
            self.mp_face = mp.solutions.face_detection
            self.face_detector = self.mp_face.FaceDetection(
                model_selection=1,  # 1=短距离, 0=远距离
                min_detection_confidence=0.5
            )
            print("✅ MediaPipe 人脸检测已加载")
        except ImportError:
            print("⚠️ MediaPipe 未安装，使用 OpenCV 级联分类器")
            self.face_detector = None
    
    def check_face(self, image):
        """检测图片中是否有人脸"""
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        if self.face_detector:
            results = self.face_detector.process(rgb)
            if results.detections:
                best = max(results.detections, key=lambda d: d.score[0])
                return True, best.score[0], "检测到人脸"
            return False, 0.0, "未检测到人脸，请正对镜头拍摄"
        else:
            # OpenCV fallback
            cascade = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            if os.path.exists(cascade):
                detector = cv2.CascadeClassifier(cascade)
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                faces = detector.detectMultiScale(gray, 1.1, 4)
                if len(faces) > 0:
                    return True, 0.8, "检测到人脸"
            return False, 0.0, "未检测到人脸，请正对镜头拍摄"
    
    def check_teeth(self, image, yolo_model=None):
        """检测图片中是否有牙齿区域"""
        if yolo_model is None:
            # 简单的颜色检测: 牙齿通常是白色/浅色区域
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            # 白色/浅色范围
            lower = np.array([0, 0, 150])
            upper = np.array([180, 50, 255])
            mask = cv2.inRange(hsv, lower, upper)
            white_ratio = np.sum(mask > 0) / mask.size
            
            if white_ratio > 0.02:  # 至少2%是白色区域
                return True, min(white_ratio * 5, 0.95), "检测到牙齿区域"
            return False, white_ratio, "未检测到牙齿，请张大嘴巴，露出牙齿"
        
        # 用YOLO模型检测
        results = yolo_model(image, conf=0.3)
        for r in results:
            for c in r.boxes.cls:
                if int(c) == 0:  # Tooth class
                    return True, float(r.boxes.conf[0]), "检测到牙齿区域"
        return False, 0.0, "未检测到牙齿，请张大嘴巴，露出牙齿"
    
    def check(self, image, yolo_model=None):
        """完整的前置检查"""
        face_ok, face_conf, face_msg = self.check_face(image)
        
        if not face_ok:
            return {
                "is_face_detected": False,
                "is_teeth_detected": False,
                "face_confidence": face_conf,
                "teeth_confidence": 0.0,
                "message": face_msg
            }
        
        teeth_ok, teeth_conf, teeth_msg = self.check_teeth(image, yolo_model)
        
        if not teeth_ok:
            return {
                "is_face_detected": True,
                "is_teeth_detected": False,
                "face_confidence": face_conf,
                "teeth_confidence": teeth_conf,
                "message": teeth_msg
            }
        
        return {
            "is_face_detected": True,
            "is_teeth_detected": True,
            "face_confidence": face_conf,
            "teeth_confidence": teeth_conf,
            "message": "拍照成功，正在分析..."
        }
