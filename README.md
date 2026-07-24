# ARES V8.1 — Extreme Autonomy OS

ARES 是一个面向竞赛演示的火星基地可解释自主决策数字孪生。它把一次高风险决策拆成可审查的证据链：

`Sense → Simulate → Decide → Authorize → Verify`

## 竞赛演示亮点

- 实时 3D Jezero 火星基地：程序化地形、居住舱、能源阵列、着陆器、通信塔和自主机器人。
- 六阶段自动演示：基线、沙尘暴、配对推演、策略证明、人类授权、执行验证。
- 配对反事实证据板：共同随机数、共同硬件联锁，唯一差异是高层策略。
- 人在回路：预测状态与执行观测分层，三项原子动作逐项回执。
- 可交互：拖动旋转、滚轮缩放、实体点选、4 个快捷视角、策略与质量切换。
- Python 参考引擎：`python/world_model.py` 实现无第三方依赖的确定性世界模型与配对实验。

## 本地运行

静态前端：

```bash
python -m http.server 8766
```

打开 `http://localhost:8766/`。

验证 Python 世界模型：

```bash
cd python
python -m unittest -v
python world_model.py
```

## GitHub Pages 说明

GitHub Pages 是静态托管，不能常驻运行服务器端 Python。因此线上版运行与 Python 决策契约一致的确定性浏览器镜像；仓库同时保留可独立验证的 Python 参考实现。界面中的数值属于演示数字孪生的模型结果，不代表真实载人任务认证概率。

## 操作

- 拖动：旋转 3D 世界
- 滚轮：缩放
- `P`：旋转 90°
- `1–4`：切换视角
- 点击 3D 实体：查看对象证据
- 顶部模块：切换世界模型、因果网络、未来推演、自主执行

