import os, argparse, glob, random
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

def augment_image(img):
    """对单张图片进行多种增强"""
    augmented = []
    
    # 原图
    augmented.append(img)
    
    # 水平翻转
    augmented.append(img.transpose(Image.FLIP_LEFT_RIGHT))
    
    # 亮度变化
    for factor in [0.7, 1.3]:
        enhancer = ImageEnhance.Brightness(img)
        augmented.append(enhancer.enhance(factor))
    
    # 对比度变化
    for factor in [0.8, 1.2]:
        enhancer = ImageEnhance.Contrast(img)
        augmented.append(enhancer.enhance(factor))
    
    # 轻微模糊（模拟手抖）
    augmented.append(img.filter(ImageFilter.GaussianBlur(radius=1)))
    
    # 色温偏移
    for r, g, b in [(1.1, 0.95, 0.9), (0.9, 0.95, 1.1)]:
        arr = np.array(img).astype(float)
        arr[:,:,0] *= r
        arr[:,:,1] *= g
        arr[:,:,2] *= b
        augmented.append(Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)))
    
    return augmented

def augment_dataset(input_dir, output_dir, multiplier=5):
    """对整个数据集进行增强"""
    img_dir = os.path.join(input_dir, "images", "train")
    label_dir = os.path.join(input_dir, "labels", "train")
    
    out_img = os.path.join(output_dir, "images", "train")
    out_label = os.path.join(output_dir, "labels", "train")
    out_img_val = os.path.join(output_dir, "images", "val")
    out_label_val = os.path.join(output_dir, "labels", "val")
    
    for d in [out_img, out_label, out_img_val, out_label_val]:
        os.makedirs(d, exist_ok=True)
    
    # 复制 val
    for f in glob.glob(os.path.join(input_dir, "images", "val", "*")):
        shutil.copy2(f, os.path.join(out_img_val, os.path.basename(f)))
    for f in glob.glob(os.path.join(input_dir, "labels", "val", "*")):
        shutil.copy2(f, os.path.join(out_label_val, os.path.basename(f)))
    
    # 增强 train
    images = glob.glob(os.path.join(img_dir, "*.jpg")) + glob.glob(os.path.join(img_dir, "*.png"))
    print(f"📊 原始训练图片: {len(images)} 张")
    
    total = 0
    for img_path in images:
        img = Image.open(img_path)
        fname = os.path.splitext(os.path.basename(img_path))[0]
        label_path = os.path.join(label_dir, fname + ".txt")
        label_content = ""
        if os.path.exists(label_path):
            with open(label_path, "r") as f:
                label_content = f.read()
        
        augmented_imgs = augment_image(img)
        # 随机选取 multiplier-1 张增强图（加上原图 = multiplier）
        selected = random.sample(augmented_imgs, min(multiplier - 1, len(augmented_imgs) - 1))
        selected.insert(0, img)  # 确保包含原图
        
        for i, aug_img in enumerate(selected):
            suffix = "" if i == 0 else f"_aug{i}"
            out_name = f"{fname}{suffix}.jpg"
            aug_img.save(os.path.join(out_img, out_name))
            with open(os.path.join(out_label, f"{fname}{suffix}.txt"), "w") as f:
                f.write(label_content)
            total += 1
    
    print(f"✅ 增强后训练图片: {total} 张")
    
    # 复制 data.yaml
    import shutil
    yaml_src = os.path.join(input_dir, "dental.yaml")
    if os.path.exists(yaml_src):
        with open(yaml_src, "r") as f:
            content = f.read()
        content = content.replace(input_dir, os.path.abspath(output_dir))
        with open(os.path.join(output_dir, "dental.yaml"), "w") as f:
            f.write(content)

import shutil

def main():
    parser = argparse.ArgumentParser(description="数据增强工具")
    parser.add_argument("--input", default="data/processed", help="处理后数据目录")
    parser.add_argument("--output", default="data/augmented", help="增强后输出目录")
    parser.add_argument("--multiplier", type=int, default=5, help="增强倍数")
    args = parser.parse_args()
    
    augment_dataset(args.input, args.output, args.multiplier)

if __name__ == "__main__":
    main()
