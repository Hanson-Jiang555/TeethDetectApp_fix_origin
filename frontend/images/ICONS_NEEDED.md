# 📸 SmileGuard 护齿管家 - 图标资源清单

请准备以下图标文件，放入 `frontend/images/` 目录下。

## TabBar 图标（必需）

| 文件名 | 用途 | 建议尺寸 | 颜色 |
|--------|------|----------|------|
| `tab_home.png` | 首页 - 未选中 | 81×81px | #94A3B8（灰色） |
| `tab_home_active.png` | 首页 - 选中 | 81×81px | #2563EB（蓝色） |
| `tab_camera.png` | 检测 - 未选中 | 81×81px | #94A3B8（灰色） |
| `tab_camera_active.png` | 检测 - 选中 | 81×81px | #2563EB（蓝色） |
| `tab_history.png` | 记录 - 未选中 | 81×81px | #94A3B8（灰色） |
| `tab_history_active.png` | 记录 - 选中 | 81×81px | #2563EB（蓝色） |
| `tab_profile.png` | 我的 - 未选中 | 81×81px | #94A3B8（灰色） |
| `tab_profile_active.png` | 我的 - 选中 | 81×81px | #2563EB（蓝色） |

## 可选图标

| 文件名 | 用途 | 建议尺寸 |
|--------|------|----------|
| `default_avatar.png` | 默认头像 | 200×200px |

## 设计建议

### 图标风格
- 推荐**线性图标**（Line Icon）风格，简洁现代
- 圆角线条，线宽 2-3px
- 可以在 [iconfont.cn](https://www.iconfont.cn) 或 [Flaticon](https://www.flaticon.com) 免费下载

### TabBar 图标内容建议
- **首页**: 房子图标 🏠
- **检测**: 相机/拍照图标 📷
- **记录**: 时钟/列表图标 📋
- **我的**: 人像图标 👤

### 快速替代方案
如果暂时不想制作图标，可以用纯色 PNG 占位：
1. 在 [iconfont.cn](https://www.iconfont.cn) 搜索 "home" "camera" "history" "user"
2. 选择喜欢的图标
3. 分别下载灰色和蓝色两个版本
4. 尺寸设为 81×81px
5. 命名后放入 `frontend/images/` 目录

### 临时方案
如果没有图标，可以先用 [这个工具](https://www.iconfont.cn/search/index?searchType=icon&q=tabbar) 批量生成。

## 注意事项
- ⚠️ 图标文件大小建议控制在 **40KB 以内**，越小越好
- 格式必须是 **PNG**，不能是 JPG 或 SVG（微信小程序 tabBar 不支持 SVG）
- 未选中状态用灰色 `#94A3B8`，选中状态用蓝色 `#2563EB`
- 两个状态的图标轮廓要一致，只是颜色不同