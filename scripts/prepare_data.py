import os, shutil, argparse, glob, random
import yaml

def create_yaml(output_dir, names):
    """生成 YOLO data.yaml"""
    data_yaml = {
        "path": os.path.abspath(output_dir),
        "train": "images/train",
        "val": "images/val",
        "nc": len(names),
        "names": names
    }
    yaml_path = os.path.join(output_dir, "dental.yaml")
    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(data_yaml, f, allow_unicode=True)
    print(f"✅ 生成 {yaml_path}")
    return yaml_path

def prepare_yolo_format(raw_dir, output_dir, names, train_ratio=0.85):
    """
    将各种格式的标注数据整理为 YOLO 格式:
    output_dir/
      images/train/  images/val/
      labels/train/  labels/val/
      dental.yaml
    """
    CLASSES = {i: name for i, name in enumerate(names)}
    NAME_TO_ID = {name: i for i, name in enumerate(names)}
    
    for split in ["train", "val"]:
        os.makedirs(os.path.join(output_dir, "images", split), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "labels", split), exist_ok=True)
    
    # 收集所有图片
    img_exts = [".jpg", ".jpeg", ".png", ".bmp"]
    all_images = []
    for ext in img_exts:
        all_images.extend(glob.glob(os.path.join(raw_dir, "**", f"*{ext}"), recursive=True))
    
    if not all_images:
        print(f"⚠️ 在 {raw_dir} 未找到图片，尝试使用现有 TeethDetectedApp 数据")
        old_data = r"D:\4444444\TeethDetectedApp"
        if os.path.exists(old_data):
            # 复制现有数据
            for src_folder, split in [("train", "train"), ("valid", "val")]:
                src_imgs = os.path.join(old_data, src_folder, "images")
                src_labels = os.path.join(old_data, src_folder, "labels")
                if os.path.exists(src_imgs):
                    for f in os.listdir(src_imgs):
                        shutil.copy2(os.path.join(src_imgs, f), os.path.join(output_dir, "images", split, f))
                    print(f"  复制 {src_imgs} -> images/{split}/")
                if os.path.exists(src_labels):
                    for f in os.listdir(src_labels):
                        shutil.copy2(os.path.join(src_labels, f), os.path.join(output_dir, "labels", split, f))
                    print(f"  复制 {src_labels} -> labels/{split}/")
            all_images = []
            for split in ["train", "val"]:
                all_images.extend(glob.glob(os.path.join(output_dir, "images", split, "*.*")))
    
    print(f"📊 总共 {len(all_images)} 张图片")
    
    random.shuffle(all_images)
    split_idx = int(len(all_images) * train_ratio)
    
    for i, img_path in enumerate(all_images):
        split = "train" if i < split_idx else "val"
        fname = os.path.basename(img_path)
        
        # 复制图片
        shutil.copy2(img_path, os.path.join(output_dir, "images", split, fname))
        
        # 查找或创建对应 label
        label_name = os.path.splitext(fname)[0] + ".txt"
        src_label = img_path.replace("images", "labels").rsplit(".", 1)[0] + ".txt"
        
        if os.path.exists(src_label):
            shutil.copy2(src_label, os.path.join(output_dir, "labels", split, label_name))
        else:
            # 创建空label
            with open(os.path.join(output_dir, "labels", split, label_name), "w") as f:
                pass
    
    yaml_path = create_yaml(output_dir, names)
    print(f"✅ 数据准备完成! 使用: {yaml_path}")
    return yaml_path

def main():
    parser = argparse.ArgumentParser(description="数据格式转换工具")
    parser.add_argument("--input", default="data/raw", help="原始数据目录")
    parser.add_argument("--output", default="data/processed", help="输出目录")
    parser.add_argument("--names", nargs="+", 
                        default=["Tooth", "Caries", "Missing_Tooth", "Plaque", "Calculus", "Gingivitis", "Enamel_Wear"],
                        help="类别名称列表")
    args = parser.parse_args()
    
    prepare_yolo_format(args.input, args.output, args.names)

if __name__ == "__main__":
    main()
