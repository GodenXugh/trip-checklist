# 外出待办管理 · PWA

出差 / 旅游前的「携带物品 + 待办事项」清单工具。每次出行存为一份清单，下次「复制上次」略作修改即可快速复用。**安装后完全离线可用**，数据只存在手机本地。

## 功能

- 📋 多份命名清单（如「上海出差」「三亚旅游」），按最近使用排序
- 🧳 两大区块：**携带物品** / **待办事项**，每块下可自定义分类
- ✅ 点条目打勾，实时进度条
- 🆕 新建方式：出差模板 / 旅游模板 / 空白 / **复制上次清单**（内容沿用，勾选自动重置）
- ✎ 编辑模式：增删条目、改名、加分类
- ⬇️⬆️ 导出 / 导入备份（防 iOS 清缓存丢数据、换机迁移）
- 📴 Service Worker 离线缓存，断网 / 飞行模式照常使用

## 文件说明

| 文件 | 作用 |
|------|------|
| `index.html` | 整个应用（HTML/CSS/JS 全内联，零外部依赖） |
| `manifest.webmanifest` | PWA 清单（应用名、图标、全屏） |
| `sw.js` | Service Worker，离线缓存 |
| `icon-180/192/512.png` | 应用图标 |
| `gen-icons.js` | 重新生成图标的脚本（可选，`node gen-icons.js`） |
| `server.js` | 本地预览服务器（部署到 GitHub Pages 时**不需要**） |

---

## 部署到 GitHub Pages（推荐）

只需要这几个文件：`index.html`、`manifest.webmanifest`、`sw.js`、`icon-180.png`、`icon-192.png`、`icon-512.png`。
（`server.js`、`gen-icons.js`、`README.md` 上传与否都不影响。）

### 方式 A：网页上传（最简单，无需装 git）

1. 登录 GitHub，点右上角 **+ → New repository**。
2. 仓库名随意（如 `trip-checklist`），选 **Public**，点 **Create repository**。
3. 进入仓库，点 **Add file → Upload files**，把上面那几个文件拖进去，**Commit changes**。
4. 点仓库 **Settings → Pages**。
5. **Source** 选 **Deploy from a branch**，Branch 选 **main**、目录选 **/(root)**，**Save**。
6. 等 1~2 分钟，页面顶部会出现网址：
   `https://<你的用户名>.github.io/<仓库名>/`
7. 用手机 Safari 打开这个网址 → 见下方「添加到主屏幕」。

### 方式 B：命令行（已装 git 时）

```bash
cd 外出待办管理
git init
git add index.html manifest.webmanifest sw.js icon-180.png icon-192.png icon-512.png
git commit -m "外出待办管理 PWA"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```
然后同样在 **Settings → Pages** 启用 main / root。

---

## 在 iPhone 13 上安装

1. 用 **Safari**（必须是 Safari，Chrome 不行）打开你的 GitHub Pages 网址。
2. 点底部中间的 **分享按钮**（方框向上箭头 ⬆️）。
3. 下滑选 **「添加到主屏幕」**。
4. 改个名字（默认「出行清单」），点 **添加**。
5. 主屏幕出现行李箱图标，点开即是全屏 App。

### 关于离线

- **第一次打开需要联网**（下载页面并缓存）。
- 之后日常使用（开清单、打勾、增删、复制）**完全不用联网**，飞机上也能用。
- 想升级功能时联网打开一次即可自动更新（我若改了 `sw.js`，记得把里面的 `chuxing-v1` 版本号 +1 触发刷新）。

### 数据安全提醒

数据存在手机本地（localStorage），不上云。iOS 对**长期不打开**的 PWA 可能清理缓存数据。建议偶尔在首页 **⋯ → 导出备份**，把 `.json` 存到「文件」App 或发给自己，换机或误清时可 **⋯ → 导入** 恢复。

---

## 本地预览（开发用，可选）

```bash
node server.js
# 浏览器打开 http://localhost:5050
```
同一 WiFi 下手机也可访问 `http://<电脑IP>:5050`，但 iOS 通过纯 http 局域网**装不了主屏幕**（PWA 安装要求 HTTPS），所以正式使用请走 GitHub Pages。
