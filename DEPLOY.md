# 部署说明（给维护者 / 想自己搭一份的人）

本应用是纯静态 PWA，把以下文件放到任意支持 HTTPS 的静态主机即可：

```
index.html
manifest.webmanifest
sw.js
icon-180.png
icon-192.png
icon-512.png
```

> `server.js`、`gen-icons.js`、`README.md`、`DEPLOY.md` 是开发/文档用，传不传都不影响应用运行。

---

## 用 GitHub Pages 免费托管（推荐）

### 方式 A：网页上传（无需装 git）

1. GitHub 右上角 **+ → New repository**
2. 仓库名随意（建议起个别人猜不到的名字，如 `trip-x7k2q9`，详见下方隐私说明），选 **Public**，**Create repository**
3. **Add file → Upload files**，把上面 6 个文件拖进去，**Commit changes**
4. **Settings → Pages**
5. **Source** 选 **Deploy from a branch**，Branch 选 **main**、目录 **/(root)**，**Save**
6. 等 1~2 分钟，出现网址：`https://<用户名>.github.io/<仓库名>/`
7. 把这个网址填回 `README.md` 顶部的「打开使用」处

### 方式 B：命令行（已装 git）

```bash
cd 外出待办管理
git init
git add index.html manifest.webmanifest sw.js icon-180.png icon-192.png icon-512.png
git commit -m "外出待办管理 PWA"
git branch -M main
git remote add origin https://github.com/GodenXugh/trip-checklist.git
git push -u origin main
```
然后同样在 **Settings → Pages** 启用 main / root。

---

## 关于 Public 与隐私

- Public 仓库意味着**代码文件**和**网址**都是公开的，但**使用者的清单数据始终只存在各自手机本地，不会暴露**。
- 代码里没有任何密钥/密码，公开无风险。
- 想让网址不被人偶然访问：保持 Public 但用一个随机仓库名即可（等效私有，最省事）。
- 真要私有源 + 访问密码：免费 GitHub Pages 不支持 Private 发布，可改用 **Cloudflare Pages** 或 **Netlify**。

---

## 更新应用

改动 `index.html` 等壳文件后，**务必把 `sw.js` 里的 `chuxing-v1` 版本号 +1**（如 `chuxing-v2`），否则用户设备会继续用缓存的旧版本。改完重新上传，用户联网打开一次即自动更新。

## 重新生成图标（可选）

```bash
node gen-icons.js   # 生成 icon-180/192/512.png
```

## 本地预览（开发用）

```bash
node server.js      # 打开 http://localhost:5050
```
同一 WiFi 下手机也可访问 `http://<电脑IP>:5050`，但 iOS 通过纯 http 局域网装不了主屏幕（PWA 安装要求 HTTPS），正式使用请走 GitHub Pages。
