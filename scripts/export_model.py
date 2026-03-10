import os, argparse

def export_model(args):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("请先安装: pip install ultralytics")
        return
    
    model = YOLO(args.weights)
    
    fmt = args.format or "onnx"
    print(f"📦 导出模型为 {fmt.upper()} 格式...")
    
    model.export(format=fmt, imgsz=args.imgsz, simplify=True)
    print(f"✅ 导出完成! 模型文件在同目录下")

def main():
    parser = argparse.ArgumentParser(description="模型导出")
    parser.add_argument("--weights", default="models/dental_detector_v2.pt", help="模型权重路径")
    parser.add_argument("--format", default="onnx", help="导出格式: onnx, tflite, coreml, openvino")
    parser.add_argument("--imgsz", type=int, default=640, help="图片大小")
    args = parser.parse_args()
    export_model(args)

if __name__ == "__main__":
    main()
