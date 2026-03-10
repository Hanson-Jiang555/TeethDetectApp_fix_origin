"""
规则引擎: AI检测结果 → 严重程度 → 就医建议
"""

# 每个类别的默认严重程度基数 (0-100)
SEVERITY_BASE = {
    "Tooth": 0,
    "Caries": 45,
    "Missing_Tooth": 55,
    "Plaque": 25,
    "Calculus": 30,
    "Gingivitis": 50,
    "Enamel_Wear": 35,
}

# 严重程度分级阈值
SEVERITY_LEVELS = {
    (0, 15): ("healthy", "🟢", "口腔状态良好"),
    (15, 35): ("mild", "🟡", "轻度问题"),
    (35, 60): ("medium", "🟠", "中度问题"),
    (60, 101): ("severe", "🔴", "重度问题"),
}

# 就医建议模板
ADVICE_TEMPLATES = {
    "healthy": "您的口腔状态良好，建议保持日常刷牙习惯，每半年做一次常规口腔检查。",
    "mild": "检测到轻微口腔问题，建议在1-3个月内做一次口腔检查，保持良好口腔卫生习惯。",
    "medium": "检测到口腔问题需要关注，建议2周内前往牙科做详细检查和治疗。",
    "severe": "检测到较严重的口腔问题，请尽快就医，不要拖延！建议预约口腔科或专科医院。",
}

# 类别中文描述
CLASS_DESC = {
    "Caries": "龋齿（蛀牙）",
    "Missing_Tooth": "缺牙",
    "Plaque": "牙菌斑",
    "Calculus": "牙结石",
    "Gingivitis": "牙龈炎",
    "Enamel_Wear": "釉质磨损",
}

def calculate_severity(detections):
    """
    根据检测结果计算整体严重程度
    detections: list of dict (from detector.detect())
    """
    if not detections:
        return {
            "overall_severity": "healthy",
            "severity_score": 0,
            "advice": ADVICE_TEMPLATES["healthy"],
            "detail": "未检测到明显口腔问题",
            "detected_classes": [],
        }
    
    total_score = 0
    detected_classes = []
    details = []
    
    for det in detections:
        cls = det["class_name"]
        if cls == "Tooth":
            continue
        
        base = SEVERITY_BASE.get(cls, 30)
        # 置信度加成
        conf_bonus = det["confidence"] * 15
        # 面积加成（问题区域越大越严重）
        area_bonus = min(det["area_ratio"] * 200, 20)
        
        score = base + conf_bonus + area_bonus
        total_score = max(total_score, score)  # 取最严重的
        
        if cls not in detected_classes:
            detected_classes.append(cls)
            cn_name = CLASS_DESC.get(cls, cls)
            severity_label = _get_severity_label(score)
            details.append(f"{cn_name}（{severity_label}，置信度 {det['confidence']:.0%}）")
    
    # 综合评分: 取最高分 * 检测问题数量系数
    count_factor = 1.0 + (len(detected_classes) - 1) * 0.1
    final_score = min(int(total_score * count_factor), 100)
    
    level, emoji, label = _get_level(final_score)
    
    return {
        "overall_severity": level,
        "severity_score": final_score,
        "emoji": emoji,
        "advice": ADVICE_TEMPLATES[level],
        "detail": "，".join(details) if details else "未检测到明显口腔问题",
        "detected_classes": detected_classes,
    }

def _get_severity_label(score):
    for (low, high), (level, emoji, label) in SEVERITY_LEVELS.items():
        if low <= score < high:
            return label
    return "重度问题"

def _get_level(score):
    for (low, high), (level, emoji, label) in SEVERITY_LEVELS.items():
        if low <= score < high:
            return level, emoji, label
    return "severe", "🔴", "重度问题"
