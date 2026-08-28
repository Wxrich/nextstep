# 阿里云部署指南

本文介绍如何将「下一站·启航」部署到阿里云。推荐使用 **SAE（Serverless 应用引擎）**，免运维、按量付费，是 Next.js 应用的最佳选择。

---

## 方案对比

| 方案 | 难度 | 费用 | 适合场景 |
|------|------|------|----------|
| **SAE（推荐）** | ⭐ 简单 | 约 0.05-0.5 元/天 | 个人项目、中小流量 |
| 函数计算 FC | ⭐⭐ 中等 | 几乎免费（有免费额度） | 极致省钱、流量波动大 |
| ECS 云服务器 | ⭐⭐⭐ 稍难 | 约 30-100 元/月 | 需要完全掌控服务器 |

---

## 方案一：SAE 部署（推荐）

### 前置准备

1. 阿里云账号：https://www.aliyun.com
2. 开通 **SAE（Serverless 应用引擎）**：https://sae.console.aliyun.com
3. 开通 **容器镜像服务 ACR**：https://cr.console.aliyun.com（免费个人版即可）

### 步骤 1：创建容器镜像仓库

1. 进入 [容器镜像服务控制台](https://cr.console.aliyun.com)
2. 选择地域（推荐「华东2（上海）」或离你近的地域）
3. 左侧菜单 → **个人实例** → **命名空间** → **创建命名空间**
   - 名称：`nextstep`（或你喜欢的）
   - 仓库类型：公开（方便 SAE 拉取，也可设为私有）
4. 左侧 → **镜像仓库** → **创建镜像仓库**
   - 命名空间：选刚才创建的
   - 仓库名称：`nextstep-web`
   - 仓库类型：公开
   - 代码源：**本地仓库**
5. 创建完成后，在仓库详情页能看到「公网地址」，类似：
   ```
   registry.cn-shanghai.aliyuncs.com/nextstep/nextstep-web
   ```

### 步骤 2：构建并推送镜像

在项目根目录执行（把下面的地址替换成你自己的）：

```bash
# 1. 登录阿里云容器镜像服务
docker login --username=你的阿里云账号全名 registry.cn-shanghai.aliyuncs.com

# 2. 构建镜像
docker build -t nextstep:latest .

# 3. 打标签（替换为你的仓库地址）
docker tag nextstep:latest registry.cn-shanghai.aliyuncs.com/nextstep/nextstep-web:latest

# 4. 推送
docker push registry.cn-shanghai.aliyuncs.com/nextstep/nextstep-web:latest
```

> 💡 如果本地没有 Docker，可以用阿里云「镜像构建」功能，关联 GitHub 仓库自动构建。

### 步骤 3：创建 SAE 应用

1. 进入 [SAE 控制台](https://sae.console.aliyun.com)
2. 左侧 → **应用管理** → **创建应用**
3. 基础设置：
   - 应用名称：`nextstep-web`
   - 部署方式：**镜像部署**
   - 技术栈：**自定义镜像**
4. 应用配置：
   - 镜像地址：选择刚才推送的镜像仓库，版本填 `latest`
   - 实例规格：**1 vCPU 0.5 GiB**（够用了，不够再升级）
   - 实例数：1
   - 启动命令：留空（Dockerfile 里已配置 CMD）
   - 端口：`3000`
5. 环境变量（重要！）：
   - 添加：`SILICONFLOW_API_KEY` = 你的硅基流动 API Key
6. 高级设置 → 网络：
   - 选一个已有 VSwitch，没有的话用默认即可
   - 公网访问：勾选「开启公网SLB」→ 选「按量付费」→ 协议 HTTP
7. 点击「确认创建」，等待 1-3 分钟部署完成

### 步骤 4：访问应用

部署完成后，在应用详情页的「公网访问地址」里就能看到你的域名了，类似：
```
http://xxxxx.cn-shanghai.sae.aliyuncs.com
```

点击即可访问你的网站。

### 步骤 5（可选）：绑定自定义域名

1. SAE 应用详情 → **公网访问** → **绑定自定义域名**
2. 输入你的域名，比如 `nextstep.yourdomain.com`
3. 去你的域名 DNS 解析处，添加 CNAME 记录指向 SAE 提供的公网地址
4. 建议同时开启 **HTTPS**（上传 SSL 证书，阿里云免费证书申请地址：https://yundun.console.aliyun.com/?p=cas）

---

## 方案二：函数计算 FC（更省钱）

如果你流量很小，函数计算几乎不花钱（每月有免费额度）。

### 前置条件

1. 开通 [函数计算 FC](https://fc.console.aliyun.com)
2. 安装 Serverless Devs 工具：`npm install @serverless-devs/s -g`

### 快速部署

```bash
# 安装 s 工具
npm install @serverless-devs/s -g

# 配置阿里云密钥
s config add

# 项目根目录下创建 s.yaml（参考官方 Next.js 模板）
# 然后部署
s deploy
```

> 函数计算部署 Next.js 需要使用 custom runtime，配置稍复杂。新手建议先用 SAE。

---

## 方案三：ECS 云服务器

如果你已经有 ECS，可以直接部署。

```bash
# 1. SSH 登录服务器
ssh root@你的服务器IP

# 2. 安装 Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# 3. 上传代码（用 git 或 scp）
git clone 你的仓库地址
cd nextstep

# 4. 安装依赖并构建
npm ci
npm run build

# 5. 配置环境变量
echo "SILICONFLOW_API_KEY=你的key" > .env.local

# 6. 用 pm2 后台运行
npm install -g pm2
pm2 start npm --name "nextstep" -- start
pm2 save
pm2 startup

# 7. 配置 Nginx 反向代理（可选，推荐）
# 将 80 端口转发到 3000
```

---

## 环境变量清单

部署时必须配置的环境变量：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `SILICONFLOW_API_KEY` | 硅基流动 API Key | ✅ 是 |

---

## 成本估算

### SAE 方案（1 实例，1C0.5G）
- 计算费用：约 0.03 元/小时 × 24 小时 ≈ **0.7 元/天**
- 公网流量：按量计费，0.8 元/GB
- **首月通常有免费额度**，实际花费可能更低

### 省钱技巧
- 开启 **应用弹性伸缩**：低峰期缩到 0 实例，完全不花钱
- 用 **按量付费 SLB** 比包年包月便宜
- 阿里云新用户通常有 SAE 免费试用额度

---

## 常见问题

**Q: 部署后访问 502 怎么办？**
A: 检查端口是否正确（默认 3000），查看 SAE 日志里有没有启动报错。

**Q: AI 接口调用失败？**
A: 确认环境变量 `SILICONFLOW_API_KEY` 已正确配置，且 Key 有效。

**Q: 图片加载不出来？**
A: 确认 `public/` 目录下的图片都打进镜像了（Dockerfile 已包含 COPY public 步骤）。

**Q: 如何更新代码？**
A: 重新构建镜像 → 推送新 tag → SAE 控制台点「部署」→ 选新版本即可，滚动发布不中断。
