@echo off
chcp 65001 >nul
echo ══════════════════════════════════════════════
echo   🦷 Claw Fix - 口腔AI筛查系统 - 环境安装
echo ══════════════════════════════════════════════
echo.

echo [1/4] 检查 Python...
python --version 2>nul || (
    echo ❌ 未检测到 Python，请先安装 Python 3.9+
    pause
    exit /b
)

echo [2/4] 安装依赖...
pip install ultralytics opencv-python pillow mediapipe fastapi uvicorn python-multipart -q

echo [3/4] 准备数据（复制现有数据集）...
python scripts/prepare_data.py --input data/raw --output data/processed

echo [4/4] 数据增强（5倍扩充）...
python scripts/augment_data.py --input data/processed --output data/augmented --multiplier 5

echo.
echo ══════════════════════════════════════════════
echo   ✅ 环境准备完成！
echo.
echo   下一步:
echo     训练模型: python scripts/train_model.py --finetune
echo     启动后端: cd backend ^&^& uvicorn main:app --port 8000
echo ══════════════════════════════════════════════
pause
