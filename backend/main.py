import os
import io
import base64
import uuid
import json
import tempfile
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from PIL import Image

from core.models import DetectResponse, PhotoCheckResult, DetectionResult, SeverityLevel
from core.detector import DentalDetector
from core.face_check import FaceChecker
from core.rule_engine import calculate_severity

app = FastAPI(
    title="🦷 Claw Fix - 口腔AI筛查API",
    description="拍照 → 检测 → 报告",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局模型实例
detector = None
face_checker = None

# 简单的内存存储（生产环境应使用数据库）
reports_store = {}

def get_detector():
    global detector
    if detector is None:
        detector = DentalDetector()
    return detector

def get_face_checker():
    global face_checker
    if face_checker is None:
        face_checker = FaceChecker()
    return face_checker

def read_image(file_bytes):
    """将上传的文件转为OpenCV格式"""
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        # 尝试用PIL
        pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    return img

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Claw Fix Dental API", "version": "2.0.0"}

@app.post("/api/check-photo")
async def check_photo(file: UploadFile = File(...)):
    """前置检查: 人脸+牙齿"""
    try:
        contents = await file.read()
        image = read_image(contents)
        
        checker = get_face_checker()
        det = get_detector()
        result = checker.check(image, det.model)
        
        return {"status": "success", "check": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/detect")
async def detect(file: UploadFile = File(...)):
    """完整检测流程"""
    try:
        contents = await file.read()
        image = read_image(contents)
        
        # Step 1: 前置检查
        checker = get_face_checker()
        det = get_detector()
        photo_check = checker.check(image, det.model)
        
        photo_result = PhotoCheckResult(
            is_face_detected=photo_check["is_face_detected"],
            is_teeth_detected=photo_check["is_teeth_detected"],
            face_confidence=photo_check["face_confidence"],
            teeth_confidence=photo_check["teeth_confidence"],
            message=photo_check["message"],
        )
        
        if not photo_check["is_face_detected"]:
            return DetectResponse(
                status="invalid_photo",
                photo_check=photo_result,
                detections=[],
                overall_severity=SeverityLevel.HEALTHY,
                severity_score=0,
                advice="请正对镜头拍摄，确保面部清晰可见",
                detail="未检测到人脸",
                detected_classes=[],
            )
        
        if not photo_check["is_teeth_detected"]:
            return DetectResponse(
                status="invalid_photo",
                photo_check=photo_result,
                detections=[],
                overall_severity=SeverityLevel.HEALTHY,
                severity_score=0,
                advice="请张大嘴巴，露出牙齿后重新拍照",
                detail="未检测到牙齿区域",
                detected_classes=[],
            )
        
        # Step 2: AI检测
        detections = det.detect(image, conf=0.25)
        
        # Step 3: 规则引擎
        rule_result = calculate_severity(detections)
        
        # 转换检测结果格式
        det_results = []
        for d in detections:
            # 计算每个检测的严重程度
            from core.rule_engine import SEVERITY_BASE, _get_severity_label
            base = SEVERITY_BASE.get(d["class_name"], 30)
            score = base + d["confidence"] * 15 + min(d["area_ratio"] * 200, 20)
            
            det_results.append(DetectionResult(
                class_name=d["class_name"],
                class_id=d["class_id"],
                confidence=d["confidence"],
                area_ratio=d["area_ratio"],
                bbox=d["bbox"],
                severity=_map_score_to_severity(score),
            ))
        
        # 生成报告ID
        report_id = str(uuid.uuid4())[:8]
        report = {
            "id": report_id,
            "timestamp": datetime.now().isoformat(),
            "photo_check": photo_result.model_dump(),
            "detections": [d.model_dump() for d in det_results],
            **rule_result,
        }
        reports_store[report_id] = report
        
        response = DetectResponse(
            status="success",
            photo_check=photo_result,
            detections=det_results,
            overall_severity=SeverityLevel(rule_result["overall_severity"]),
            severity_score=rule_result["severity_score"],
            advice=rule_result["advice"],
            detail=rule_result["detail"],
            detected_classes=rule_result["detected_classes"],
        )
        
        return response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/report/{task_id}")
async def get_report(task_id: str):
    """获取历史报告"""
    if task_id not in reports_store:
        raise HTTPException(status_code=404, detail="报告不存在")
    return reports_store[task_id]

def _map_score_to_severity(score):
    if score < 15: return SeverityLevel.HEALTHY
    if score < 35: return SeverityLevel.MILD
    if score < 60: return SeverityLevel.MEDIUM
    return SeverityLevel.SEVERE

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
