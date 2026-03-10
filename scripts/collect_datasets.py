import os, argparse, json

def main():
    print("=" * 60)
    print("🦷 Claw Fix - 口腔数据集收集工具")
    print("=" * 60)
    
    datasets = {
        "dental_caries_roboflow": {
            "url": "roboflow download dental-caries-k6zz1-dataset-6-version --format yolov8",
            "type": "roboflow",
            "classes": ["Caries", "Tooth"],
            "desc": "Roboflow 牙科龋齿数据集（你当前用的）"
        },
        "dental_disease": {
            "url": "搜索 https://universe.roboflow.com 搜索 dental disease",
            "type": "manual",
            "classes": ["cavity", "calculus", "gingivitis"],
            "desc": "Roboflow 多类口腔疾病检测"
        }
    }
    
    print("\n📋 可用数据集:")
    for i, (name, info) in enumerate(datasets.items(), 1):
        print(f"  {i}. {name}: {info['desc']}")
        print(f"     类别: {info['classes']}")
        print(f"     类型: {info['type']}")
    
    print("\n" + "=" * 60)
    print("📥 推荐操作:")
    print("=" * 60)
    print("""
方式1 (推荐): 使用 Roboflow Python SDK
-----------------------------------------
pip install roboflow
from roboflow import Roboflow
rf = Roboflow(api_key="YOUR_API_KEY")

# 项目1: 牙科龋齿（你已有的升级版）
project = rf.workspace("dental-caries-ywg6c").project("dental-caries-k6zz1")
version = project.version(6)
dataset = version.download("yolov8")

# 项目2: 搜索更多 dental 项目并下载
# 在 https://universe.roboflow.com 搜索 dental, oral, teeth

方式2: 从 Kaggle 下载
-----------------------------------------
pip install kaggle
kaggle datasets download -d datamunge/dental-caries-dataset
kaggle datasets download -d shsyanimatenetooth/teeth-segmentation-dataset

方式3: 从 GitHub 克隆
-----------------------------------------
git clone https://github.com/xxx/dental-dataset.git

下载完成后，将所有数据放到 data/raw/ 目录
然后运行: python scripts/prepare_data.py
""")

if __name__ == "__main__":
    main()
