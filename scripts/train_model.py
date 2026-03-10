import os, argparse

def train(args):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("请先安装: pip install ultralytics")
        return
    
    # 选择模型: yolo11n-seg.pt (最新) 或 yolov8n-seg.pt
    model_name = args.model or "yolo11n-seg.pt"
    
    # 如果有之前训练好的 best.pt，用它微调
    old_best = r"D:\4444444\TeethDetectedApp\best.pt"
    if args.finetune and os.path.exists(old_best):
        model_name = old_best
        print(f"🔄 使用现有模型微调: {old_best}")
    
    print(f"📦 加载模型: {model_name}")
    model = YOLO(model_name)
    
    print(f"🏋️ 开始训练...")
    print(f"   数据: {args.data}")
    print(f"   Epochs: {args.epochs}")
    print(f"   Batch: {args.batch}")
    print(f"   Image Size: {args.imgsz}")
    
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        patience=20,        # 早停
        save=True,
        save_period=10,     # 每10轮保存
        pretrained=True,
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        weight_decay=0.0005,
        warmup_epochs=3,
        augment=True,       # 启用YOLO内置增强
        mosaic=1.0,
        mixup=0.1,
        degrees=10,
        translate=0.1,
        scale=0.5,
        flipud=0.0,
        fliplr=0.5,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
    )
    
    # 复制最佳模型
    best = results.save_dir / "weights" / "best.pt"
    if best.exists():
        import shutil
        dest = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "dental_detector_v2.pt")
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copy2(str(best), dest)
        print(f"✅ 最佳模型已保存: {dest}")
    
    print(f"📈 训练结果目录: {results.save_dir}")

def main():
    parser = argparse.ArgumentParser(description="口腔检测模型训练")
    parser.add_argument("--data", default="data/augmented/dental.yaml", help="数据配置文件")
    parser.add_argument("--model", default=None, help="基础模型 (yolo11n-seg.pt / yolov8n-seg.pt)")
    parser.add_argument("--epochs", type=int, default=150, help="训练轮数")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="图片大小")
    parser.add_argument("--finetune", action="store_true", help="用现有best.pt微调")
    args = parser.parse_args()
    
    train(args)

if __name__ == "__main__":
    main()
