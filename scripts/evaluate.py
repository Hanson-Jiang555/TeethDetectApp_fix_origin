import os, argparse

def evaluate(args):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("请先安装: pip install ultralytics")
        return
    
    model = YOLO(args.weights)
    
    print("📊 开始评估模型...")
    results = model.val(data=args.data, imgsz=args.imgsz)
    
    print(f"\n{'='*50}")
    print(f"   mAP50: {results.box.map50:.4f}")
    print(f"   mAP50-95: {results.box.map:.4f}")
    print(f"   Precision: {results.box.mp:.4f}")
    print(f"   Recall: {results.box.mr:.4f}")
    print(f"{'='*50}")

def main():
    parser = argparse.ArgumentParser(description="模型评估")
    parser.add_argument("--weights", default="models/dental_detector_v2.pt")
    parser.add_argument("--data", default="data/augmented/dental.yaml")
    parser.add_argument("--imgsz", type=int, default=640)
    args = parser.parse_args()
    evaluate(args)

if __name__ == "__main__":
    main()
