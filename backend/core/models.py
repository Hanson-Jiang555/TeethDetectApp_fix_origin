from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class SeverityLevel(str, Enum):
    HEALTHY = "healthy"
    MILD = "mild"
    MEDIUM = "medium"
    SEVERE = "severe"

class DetectionResult(BaseModel):
    class_name: str
    class_id: int
    confidence: float
    area_ratio: float          # 检测区域占图片比例
    bbox: List[float]          # [x1, y1, x2, y2]
    severity: SeverityLevel

class PhotoCheckResult(BaseModel):
    is_face_detected: bool
    is_teeth_detected: bool
    face_confidence: float
    teeth_confidence: float
    message: str               # 给用户的提示

class DetectResponse(BaseModel):
    status: str
    photo_check: PhotoCheckResult
    detections: List[DetectionResult]
    overall_severity: SeverityLevel
    severity_score: float      # 0-100
    advice: str                # 中文建议
    detail: str                # 详细描述
    detected_classes: List[str]
