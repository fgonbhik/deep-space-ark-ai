import * as THREE from "./vendor/three.module.min.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const phases = [
  {
    name: "NOMINAL", scene: "基线数字孪生 · JEZERO DELTA", fusion: "原始基线已建立",
    fusionSub: "23 路状态量已同步 · 遥测置信度 0.96", anomaly: 0.08,
    metrics: { survival: 95.1, soc: 66.1, oxygen: 88.4, water: 71.8, risk: 10 },
    sensors: ["−34.9°", "0.010", "22.0", "85.2"], tau: "0.42", solar: "10 kW",
    decision: "等待异常", safety: "—", why: "尚未触发策略选择",
    whyText: "系统会显示推荐理由、约束条件与被拒绝方案，而不是只给出一个答案。",
    callout: ["01 · SENSE", "基线运行稳定", "世界模型与遥测对齐，当前沙尘厚度 τ=0.42。"],
    trail: "[T+00:41] PWR · 光伏输出 10 kW，供电网络保持稳定", bars: [18,24,20,27,22,26,20,24,29,25,23,21]
  },
  {
    name: "STORM", scene: "异常注入 · G4 REGIONAL DUST STORM", fusion: "沙尘暴异常已确认",
    fusionSub: "光学厚度斜率越过 3σ · 多源证据一致", anomaly: 0.90,
    metrics: { survival: 86.8, soc: 70.5, oxygen: 88.4, water: 71.8, risk: 28 },
    sensors: ["−27.0°", "0.010", "86.1", "28.4"], tau: "3.31", solar: "2.8 kW",
    decision: "触发推演", safety: "P10 0.0%", why: "异常不等于立即执行",
    whyText: "先冻结世界状态，再对共同硬件联锁下的候选策略做完全配对推演，避免把相关性误当因果。",
    callout: ["02 · DETECT", "G4 沙尘暴进入 Jezero", "光学厚度快速上升，光伏输出下降并触发能源风险链。"],
    trail: "[T+00:09] ENV · 大气光学厚度 τ 升至 1.55，进入极端沙尘场景", bars: [42,37,33,29,24,20,17,15,13,11,10,9]
  },
  {
    name: "SIMULATE", scene: "2,400 个配对未来 · COMMON RANDOM NUMBERS", fusion: "因果图已锁定",
    fusionSub: "600 组种子 × 4 个策略 · 相同扰动轨迹", anomaly: 0.86,
    metrics: { survival: 78.4, soc: 51.2, oxygen: 84.0, water: 70.6, risk: 42 },
    sensors: ["−29.2°", "0.010", "91.4", "19.6"], tau: "3.58", solar: "2.1 kW",
    decision: "比较 4 策略", safety: "600×4", why: "把未来变成可比较的实验",
    whyText: "控制组与处理组共享同一随机种子、天气轨迹和基础联锁，唯一差异是 ARES 高层策略。",
    callout: ["03 · SIMULATE", "并行展开 2,400 个未来", "每个策略都在同一批外部扰动下接受安全约束检验。"],
    trail: "[T+00:19] SIM · 共同随机数推演完成 1,824 / 2,400 条轨迹", bars: [52,44,38,31,27,22,18,15,12,10,9,8]
  },
  {
    name: "PROOF", scene: "均衡策略 · PAIRED COUNTERFACTUAL WINNER", fusion: "策略证据已收敛",
    fusionSub: "600 / 600 配对样本避免安全约束失败", anomaly: 0.62,
    metrics: { survival: 95.7, soc: 77.8, oxygen: 88.4, water: 71.8, risk: 9 },
    sensors: ["−31.5°", "0.010", "74.8", "37.2"], tau: "2.64", solar: "4.7 kW",
    decision: "推荐均衡", safety: "100.0%", why: "均衡策略具有可证伪优势",
    whyText: "相比仅保留基础联锁的控制组，安全达标率提升 100.0 个百分点，SOC P10 提升 42.1 个百分点。",
    callout: ["04 · DECIDE", "均衡策略通过安全门", "满足生命保障与电池下界，并最大化 58.5% 任务能源交付。"],
    trail: "[T+00:29] DEC · 均衡策略在配对对照中占优，生成授权包 DEC-0004", bars: [44,39,35,31,27,24,23,25,29,36,44,52]
  },
  {
    name: "AUTH", scene: "世界已锁定 · HUMAN IN THE LOOP", fusion: "执行建议封装完毕",
    fusionSub: "边界条件、回滚点与三项原子动作已固化", anomaly: 0.90,
    metrics: { survival: 86.8, soc: 70.5, oxygen: 88.4, water: 71.8, risk: 28 },
    sensors: ["−27.0°", "0.010", "86.1", "28.4"], tau: "3.31", solar: "2.8 kW",
    decision: "等待授权", safety: "100.0%", why: "高影响动作必须由人确认",
    whyText: "ARES 只提交证据、预测、回滚条件与执行计划；人类授权后才会改变真实/模拟执行层。",
    callout: ["05 · AUTHORIZE", "均衡策略等待指挥员授权", "决策世界已冻结，预测状态不会与执行观测混写。"],
    trail: "[T+00:39] AI · 执行包等待授权：负载冻结、裂变爬升、机器人清尘", bars: [47,41,34,30,24,19,16,13,11,10,9,8]
  },
  {
    name: "RECOVERY", scene: "执行回执 · OBSERVED STATE VERIFIED", fusion: "执行观测持续回传",
    fusionSub: "预测与实测分层记录 · 审计轨迹不可变", anomaly: 0.38,
    metrics: { survival: 94.2, soc: 66.4, oxygen: 88.4, water: 71.8, risk: 12 },
    sensors: ["−35.1°", "0.010", "31.2", "57.2"], tau: "1.47", solar: "8.9 kW",
    decision: "恢复完成", safety: "100.0%", why: "执行结果必须反向验证模型",
    whyText: "三项动作已按授权包执行。实测净功率与预测区间一致，偏差写入下一轮模型校准。",
    callout: ["06 · VERIFY", "三项行动闭环完成", "光伏阵列恢复、关键负载稳定，实测响应已写入审计轨迹。"],
    trail: "[T+00:49] CMD · 光伏阵列清尘执行完成，净功率恢复至 −20.5 kW", bars: [37,34,31,27,24,21,20,23,28,34,41,48]
  }
];

const metricKeys = ["survival", "soc", "oxygen", "water"];
let currentPhase = 0;
let demoTimer = null;
let tick = 36;

function linePath(values, width = 900, height = 120) {
  const min = Math.min(...values), max = Math.max(...values);
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - 10 - ((v - min) / Math.max(1, max - min)) * (height - 24);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function renderTrend(phase) {
  const p = phases[phase];
  const a = p.bars.map((v, i) => Math.min(96, v + 30 + Math.sin(i) * 4));
  const b = p.bars.map((v, i) => Math.min(92, 72 - i * 1.2 + Math.cos(i * .7) * 3));
  const c = p.bars.map((v, i) => Math.min(90, 66 - i * .7 + Math.sin(i * .9) * 2));
  const d = p.bars;
  $("#trendChart").innerHTML = `
    <defs><filter id="glow"><feGaussianBlur stdDeviation="2.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${[20,50,80].map(y=>`<line x1="0" y1="${y}" x2="900" y2="${y}" stroke="#173128" stroke-width="1"/>`).join("")}
    <path d="${linePath(a)}" fill="none" stroke="#68f1bd" stroke-width="2" filter="url(#glow)"/>
    <path d="${linePath(b)}" fill="none" stroke="#69dce1" stroke-width="2" filter="url(#glow)"/>
    <path d="${linePath(c)}" fill="none" stroke="#a486dc" stroke-width="2"/>
    <path d="${linePath(d)}" fill="none" stroke="#ff9152" stroke-width="3" filter="url(#glow)"/>
  `;
}

function renderProofChart() {
  const control = [82,79,42,18,12,12,12,13,14,15,18,24];
  const ares = [87,84,79,72,68,66,70,73,69,71,82,99];
  $("#proofChart").innerHTML = `
    <defs><filter id="proofGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <line x1="0" y1="85" x2="1000" y2="85" stroke="#a66b4d" stroke-dasharray="4 6"/>
    <path d="${linePath(control,1000,130)}" fill="none" stroke="#ff6e79" stroke-width="3" filter="url(#proofGlow)"/>
    <path d="${linePath(ares,1000,130)}" fill="none" stroke="#65f5bd" stroke-width="3" filter="url(#proofGlow)"/>
    <text x="12" y="18" fill="#ff8e97" font-size="9">无 ARES</text><text x="74" y="18" fill="#72f6c2" font-size="9">ARES</text>
  `;
}

function updateSteps(phase) {
  $$("#steps li").forEach((li, i) => {
    li.classList.toggle("active", i === phase);
    li.classList.toggle("done", i < phase);
  });
}

function applyPhase(index, source = "manual") {
  currentPhase = Math.max(0, Math.min(phases.length - 1, index));
  const p = phases[currentPhase];
  $("#app").dataset.phase = currentPhase;
  updateSteps(currentPhase);
  Object.entries(p.metrics).forEach(([key, value]) => {
    const node = $(`[data-metric="${key}"]`);
    if (node) node.textContent = Number.isInteger(value) ? value : value.toFixed(1);
    const bar = $(`[data-bar="${key}"]`);
    if (bar) bar.style.width = `${Math.min(100, value)}%`;
  });
  $("#riskText").textContent = p.metrics.risk < 15 ? "安全运行" : p.metrics.risk < 35 ? "需要复核" : "高风险推演";
  $("#fusionTitle").textContent = p.fusion;
  $("#fusionSub").textContent = p.fusionSub;
  $("#anomaly").textContent = p.anomaly.toFixed(2);
  ["temperature","radiation","wind","visibility"].forEach((id, i) => $(`#${id}`).textContent = p.sensors[i]);
  $("#tau").textContent = `τ ${p.tau}`;
  $("#hudTau").textContent = p.tau;
  $("#hudSolar").textContent = p.solar;
  $("#hudSoc").textContent = `${p.metrics.soc.toFixed(1)}%`;
  $("#decision").textContent = p.decision;
  $("#safetyTarget").textContent = p.safety;
  $("#whyTitle").textContent = p.why;
  $("#whyText").textContent = p.whyText;
  $("#sceneLabel").textContent = p.scene;
  $("#calloutNo").textContent = p.callout[0];
  $("#calloutTitle").textContent = p.callout[1];
  $("#calloutText").textContent = p.callout[2];
  $("#statusName").textContent = p.name;
  $("#auditTrail").textContent = p.trail;
  $("#hab").textContent = `${Math.max(61, Math.round(p.metrics.survival - 23))}%`;
  $("#bio").textContent = `${Math.max(44, Math.round(p.metrics.oxygen - 34))}%`;
  $("#power").textContent = `${Math.max(18, Math.round(p.metrics.soc))}%`;
  $("#forecastBars").innerHTML = p.bars.map(v => `<i style="height:${Math.max(8,v)}%"></i>`).join("");
  renderTrend(currentPhase);
  tick += source === "timer" ? 4 : 1;
  $("#tick").textContent = `PYTHON TICK ${String(tick).padStart(4,"0")}`;
  updateWorldPhase(currentPhase);

  if (currentPhase >= 3) {
    $$("[data-policy]").forEach(b => b.classList.toggle("selected", b.dataset.policy === "shed"));
    $("#boundaryTitle").textContent = "均衡策略跨越安全边界，且保持最高任务能源交付";
  } else {
    $$("[data-policy]").forEach(b => b.classList.remove("selected"));
    $("#boundaryTitle").textContent = "点击任一策略加载完整审计证据";
  }
  if (currentPhase === 3 && source === "timer") {
    window.setTimeout(() => $("#proofDialog").showModal(), 550);
    window.setTimeout(() => $("#proofDialog").close(), 2600);
  }
  if (currentPhase === 4 && source === "timer") {
    window.setTimeout(() => {
      openAuthorization();
      window.setTimeout(() => runAuthorization(true), 700);
    }, 450);
  }
}

function modeMarkup(mode) {
  if (mode === "causal") return `
    <small>STRUCTURAL CAUSAL MODEL · DO-CALCULUS VIEW</small><h2>从沙尘扰动到生存风险的可审查因果链</h2>
    <div class="causal-network">
      <article><i>01</i><b>沙尘 τ ↑</b><span>外生环境扰动</span></article>
      <article><i>02</i><b>光伏输出 ↓</b><span>传感器与物理方程共同约束</span></article>
      <article><i>03</i><b>SOC P10 ↓</b><span>48h 资源下界</span></article>
      <article><i>04</i><b>生命保障风险 ↑</b><span>硬约束门控</span></article>
    </div><p class="causal-note">干预问题：do(均衡策略) 是否在同一外部扰动下提高安全达标率？ARES 用完全配对反事实，而不是只展示一条漂亮曲线。</p>`;
  if (mode === "future") return `
    <small>COUNTERFACTUAL FUTURES · 2,400 TRAJECTORIES</small><h2>四个策略在相同 600 组未来中的结果分布</h2>
    <div class="future-cards">
      <article><small>CONTROL</small><h3>监测策略</h3><b>0.0%</b><p>安全达标率；SOC P10 为 0.0%，基础联锁无法阻止长期能源耗尽。</p><button data-policy-load="monitor">查看失败边界</button></article>
      <article class="best"><small>RECOMMENDED</small><h3>均衡策略</h3><b>100.0%</b><p>安全达标率；SOC P10 42.1%，任务能源交付 58.5%，通过全部硬约束。</p><button data-policy-load="shed">载入世界模型</button></article>
      <article><small>CONSERVATIVE</small><h3>生存策略</h3><b>100.0%</b><p>安全但牺牲任务能源，适合作为均衡策略失效时的回滚策略。</p><button data-policy-load="survive">查看回滚计划</button></article>
    </div>`;
  return "";
}

function setMode(mode) {
  $$(".tabs [data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  const overlay = $("#modeOverlay");
  if (mode === "world") {
    overlay.classList.remove("open");
    return;
  }
  if (mode === "execute") {
    $$(".tabs [data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === "execute"));
    openAuthorization();
    return;
  }
  $("#modeContent").innerHTML = modeMarkup(mode);
  overlay.classList.add("open");
  $$("[data-policy-load]", overlay).forEach(button => button.addEventListener("click", () => {
    selectPolicy(button.dataset.policyLoad);
    if (button.dataset.policyLoad === "shed") applyPhase(3);
  }));
}

function selectPolicy(policy) {
  const copy = {
    monitor: ["监测策略未通过安全门", "控制组 SOC P10 为 0.0%，在 600/600 组未来中触发能源约束失败。"],
    shed: ["均衡策略通过全部约束", "先冻结非关键负载，再受限爬升裂变电源并调度机器人清尘。"],
    survive: ["生存策略可作为回滚", "安全达标但任务能源交付较低；当均衡策略的执行偏差越界时自动回退。"],
    expand: ["扩张策略被安全门拒绝", "任务收益较高，但 SOC P10 只有 4.4%，违反不可协商的能源下界。"]
  };
  $$("[data-policy]").forEach(b => b.classList.toggle("selected", b.dataset.policy === policy));
  $("#whyTitle").textContent = copy[policy][0];
  $("#whyText").textContent = copy[policy][1];
}

function openAuthorization() {
  resetAuthorization();
  if (!$("#authDialog").open) $("#authDialog").showModal();
}

let authTimers = [];
function resetAuthorization() {
  authTimers.forEach(clearTimeout); authTimers = [];
  $("#authTitle").textContent = "均衡策略等待人类授权";
  $("#authCount").textContent = "0 / 3 行动完成";
  $("#authResult").textContent = "0/3 完成 · 净功率 −102.6 kW";
  $("#netPower").textContent = "净功率 −102.6 kW";
  $("#authTime").textContent = "0.0s";
  $("#authBar").style.width = "0%";
  $("#authMessage").textContent = "授权后按顺序执行：非关键负载冻结、裂变电源爬升、机器人清尘。";
  $$(".auth-steps article").forEach(a => a.classList.remove("done"));
  $("#authorizeButton").disabled = false;
  $("#authorizeButton").textContent = "确认人类授权并执行";
}

function runAuthorization(auto = false) {
  const button = $("#authorizeButton");
  if (button.disabled) return;
  button.disabled = true;
  button.textContent = "执行中 · WORLD LOCKED";
  $("#authTitle").textContent = "均衡策略已获人类授权";
  const powers = ["−64.0 kW", "+18.5 kW", "−20.5 kW"];
  $$(".auth-steps article").forEach((article, i) => {
    authTimers.push(setTimeout(() => {
      article.classList.add("done");
      const count = i + 1;
      $("#authCount").textContent = `${count} / 3 行动完成`;
      $("#authResult").textContent = `${count}/3 完成 · 净功率 ${powers[i]}`;
      $("#netPower").textContent = `净功率 ${powers[i]}`;
      $("#authTime").textContent = `${((i + 1) * 8.2).toFixed(1)}s`;
      $("#authBar").style.width = `${count * 33.34}%`;
      $("#authMessage").textContent = count < 3 ? "行动仍在执行；预测结果保持冻结，实测观测独立更新。" : "执行闭环完成。实测响应已写入审计轨迹并触发模型再校准。";
      if (count === 3) {
        button.textContent = "执行完成 · AUDIT SEALED";
        applyPhase(5, auto ? "timer" : "manual");
        if (auto) authTimers.push(setTimeout(() => $("#authDialog").close(), 1200));
      }
    }, (i + 1) * 850));
  });
}

function startDemo() {
  if (demoTimer) {
    clearInterval(demoTimer); demoTimer = null;
    $("#demoLabel").textContent = "继续 60 秒获奖演示";
    return;
  }
  $("#demoLabel").textContent = "暂停自动演示";
  applyPhase(0, "timer");
  let next = 1;
  demoTimer = setInterval(() => {
    if (next >= phases.length) {
      clearInterval(demoTimer); demoTimer = null;
      $("#demoLabel").textContent = "重新播放 60 秒演示";
      return;
    }
    applyPhase(next++, "timer");
  }, 3600);
}

// ---------- THREE.JS PHYSICS-LINKED WORLD VIEW ----------
let scene, camera, renderer, baseGroup, dust, sun, directional;
let targetYaw = -0.72, targetPitch = 0.52, distance = 31;
let yaw = targetYaw, pitch = targetPitch, desiredDistance = distance;
let dragging = false, lastPointer = {x:0,y:0}, moved = 0;
let selectedObject = null;
const clock3d = new THREE.Clock();
const target = new THREE.Vector3(0, 1.2, 0);
const interactive = [];

function rng(seed = 1176) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
const random = rng();

function terrainHeight(x, z) {
  return Math.sin(x * .23) * .28 + Math.cos(z * .19) * .22 + Math.sin((x + z) * .47) * .08 - Math.exp(-(x*x+z*z)/70) * .18;
}

function makeLabelled(mesh, label, text) {
  mesh.userData.label = label;
  mesh.userData.description = text;
  interactive.push(mesh);
  return mesh;
}

function addBox(group, size, color, position, metalness=.45, roughness=.55) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({color,metalness,roughness}));
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
}

function createSolarArray(x, z, rotation = 0) {
  const g = new THREE.Group(); g.position.set(x, terrainHeight(x,z)+.52, z); g.rotation.y = rotation;
  const legMat = new THREE.MeshStandardMaterial({color:0x5d5448,metalness:.8,roughness:.35});
  [-1.9,0,1.9].forEach(px => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,.8,8),legMat); leg.position.set(px,-.35,0); leg.castShadow=true; g.add(leg);
  });
  const texCanvas = document.createElement("canvas"); texCanvas.width=256; texCanvas.height=128;
  const ctx = texCanvas.getContext("2d"); ctx.fillStyle="#082555";ctx.fillRect(0,0,256,128);ctx.strokeStyle="#57a6cf";ctx.lineWidth=2;
  for(let x=0;x<=256;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,128);ctx.stroke()}
  for(let y=0;y<=128;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke()}
  const texture = new THREE.CanvasTexture(texCanvas); texture.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(6,.12,2.25),new THREE.MeshStandardMaterial({map:texture,metalness:.55,roughness:.24}));
  panel.rotation.x=-.18; panel.castShadow=true; panel.receiveShadow=true; g.add(panel);
  makeLabelled(panel,"光伏阵列 PWR-04","蓝色高效光伏阵列；沙尘厚度上升会直接降低有效发电面积。");
  baseGroup.add(g);
}

function createHabitat(x,z,radius=1.55,label="HAB-01") {
  const g = new THREE.Group(); g.position.set(x,terrainHeight(x,z),z);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius*.84,radius*.94,.48,28),new THREE.MeshStandardMaterial({color:0x9b9180,metalness:.55,roughness:.47}));
  base.position.y=.24;base.castShadow=true;base.receiveShadow=true;g.add(base);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(radius,36,20,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:0xa9b8b4,metalness:.65,roughness:.34,clearcoat:.6}));
  dome.position.y=.45;dome.scale.y=.62;dome.castShadow=true;g.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius*.78,.055,8,40),new THREE.MeshStandardMaterial({color:0xd8b17d,metalness:.8,roughness:.25}));
  ring.position.y=.78;ring.rotation.x=Math.PI/2;g.add(ring);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const w=new THREE.Mesh(new THREE.BoxGeometry(.22,.13,.04),new THREE.MeshBasicMaterial({color:0x8adccc}));w.position.set(Math.cos(a)*radius*.79,.75,Math.sin(a)*radius*.79);w.lookAt(new THREE.Vector3(0,.75,0));g.add(w)}
  makeLabelled(dome,`居住舱 ${label}`,"维持气密、热控与乘员生命保障；在全部策略中属于不可卸载关键服务。");
  baseGroup.add(g); return g;
}

function createTunnel(ax,az,bx,bz) {
  const a = new THREE.Vector3(ax,.62,az), b = new THREE.Vector3(bx,.62,bz);
  const mid = a.clone().add(b).multiplyScalar(.5), length=a.distanceTo(b);
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,length,16,1,false),new THREE.MeshStandardMaterial({color:0x8f897d,metalness:.55,roughness:.48}));
  tunnel.position.copy(mid); tunnel.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); tunnel.castShadow=true; tunnel.receiveShadow=true; baseGroup.add(tunnel);
}

function createTower(x,z) {
  const g = new THREE.Group();g.position.set(x,terrainHeight(x,z),z);
  const mat=new THREE.MeshStandardMaterial({color:0xa99d8b,metalness:.75,roughness:.35});
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.12,.22,5.8,12),mat);mast.position.y=2.9;mast.castShadow=true;g.add(mast);
  for(let y=1;y<5.6;y+=.55){const r=new THREE.Mesh(new THREE.TorusGeometry(.24,.025,6,14),mat);r.position.y=y;r.rotation.x=Math.PI/2;g.add(r)}
  const dish=new THREE.Mesh(new THREE.SphereGeometry(.68,24,12,0,Math.PI*2,0,Math.PI/3),new THREE.MeshStandardMaterial({color:0xd3c6ac,metalness:.5,roughness:.36,side:THREE.DoubleSide}));
  dish.position.set(.5,4.65,0);dish.rotation.z=-1.1;dish.castShadow=true;g.add(dish);
  const beacon=new THREE.PointLight(0xff744a,2.8,6);beacon.position.set(0,5.8,0);g.add(beacon);
  makeLabelled(mast,"通信与气象桅杆 COM-02","融合风速、辐射、光学厚度与地面通信数据，提供异常证据来源。");
  baseGroup.add(g);
}

function createRover(x,z) {
  const g=new THREE.Group();g.position.set(x,terrainHeight(x,z)+.55,z);g.rotation.y=.35;
  const body=addBox(g,[2.15,.55,1.35],0xd5c6a9,[0,.4,0],.68,.35);
  addBox(g,[1.4,.28,1.05],0x5b5146,[0,.77,0],.72,.3);
  const wheelMat=new THREE.MeshStandardMaterial({color:0x26211d,metalness:.5,roughness:.8});
  [-.85,.85].forEach(px=>[-.68,.68].forEach(pz=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.27,18),wheelMat);w.position.set(px,0,pz);w.rotation.x=Math.PI/2;w.castShadow=true;g.add(w)}));
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.15,10),new THREE.MeshStandardMaterial({color:0xb7aa94,metalness:.7,roughness:.3}));mast.position.set(.45,1.35,0);g.add(mast);
  const head=addBox(g,[.46,.3,.28],0xddd4c0,[.45,1.93,0],.7,.25);
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.05,16),new THREE.MeshBasicMaterial({color:0x72f5c0}));lens.rotation.z=Math.PI/2;lens.position.set(.7,1.96,0);g.add(lens);
  makeLabelled(body,"自主清尘机器人 RVR-07","执行受授权约束的光伏清尘任务；路径、功耗与回执全部写入审计轨迹。");
  makeLabelled(head,"视觉导航载荷","双目视觉与深度估计用于局部避障；决策层不能绕过硬件安全联锁。");
  baseGroup.add(g);return g;
}

function buildWorld() {
  const canvas=$("#marsCanvas");
  scene=new THREE.Scene();scene.background=new THREE.Color(0x8b4a2e);scene.fog=new THREE.FogExp2(0x8b4a2e,.022);
  camera=new THREE.PerspectiveCamera(46,2,0.1,180);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const hemi=new THREE.HemisphereLight(0xfac18e,0x2f1710,2.25);scene.add(hemi);
  directional=new THREE.DirectionalLight(0xffd2a6,4.2);directional.position.set(-16,24,-10);directional.castShadow=true;
  directional.shadow.mapSize.set(2048,2048);directional.shadow.camera.left=-28;directional.shadow.camera.right=28;directional.shadow.camera.top=28;directional.shadow.camera.bottom=-28;scene.add(directional);
  sun=new THREE.Mesh(new THREE.SphereGeometry(2.2,24,12),new THREE.MeshBasicMaterial({color:0xffd1a4}));
  sun.position.set(-48,28,-64);scene.add(sun);
  new THREE.TextureLoader().load("./assets/jezero-rim.jpg", texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(4, 1);
    const horizon = new THREE.Mesh(
      new THREE.CylinderGeometry(69, 69, 18, 96, 1, true),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, color: 0xb26a45, fog: false })
    );
    horizon.position.y = 7.8;
    horizon.rotation.y = Math.PI * .12;
    scene.add(horizon);
  });

  const geometry=new THREE.PlaneGeometry(86,86,150,150);geometry.rotateX(-Math.PI/2);
  const pos=geometry.attributes.position;const colors=[];
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i);let y=terrainHeight(x,z);
    y+=Math.sin(x*1.7+z*.7)*.025+Math.cos(z*2.1)*.018;
    const r=Math.sqrt(x*x+z*z);if(r>26)y+=(r-26)*.035;
    pos.setY(i,y);
    const shade=.72+random()*.16+y*.05;colors.push(.58*shade,.25*shade,.13*shade);
  }
  geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  const terrain=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
  terrain.receiveShadow=true;scene.add(terrain);

  const rockGeo=new THREE.DodecahedronGeometry(.24,0),rockMat=new THREE.MeshStandardMaterial({color:0x5a3020,roughness:1});
  const rocks=new THREE.InstancedMesh(rockGeo,rockMat,190);const dummy=new THREE.Object3D();
  for(let i=0;i<190;i++){const a=random()*Math.PI*2,r=6+random()*35,x=Math.cos(a)*r,z=Math.sin(a)*r;dummy.position.set(x,terrainHeight(x,z)+.1,z);const s=.35+random()*2.6;dummy.scale.set(s*(.7+random()),s*(.45+random()*.45),s);dummy.rotation.set(random()*2,random()*3,random());dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix)}
  rocks.castShadow=true;rocks.receiveShadow=true;scene.add(rocks);

  baseGroup=new THREE.Group();scene.add(baseGroup);
  createHabitat(0,0,1.8,"HAB-01");createHabitat(-4.7,1.3,1.3,"BIO-02");createHabitat(4.5,1.7,1.2,"LAB-03");
  createTunnel(-3.3,1.05,-1.4,.3);createTunnel(1.35,.25,3.55,1.3);
  const reactor=addBox(baseGroup,[1.4,1.15,1.7],0x756f63,[6,terrainHeight(6,-3)+.58,-3],.75,.32);
  reactor.rotation.y=-.25;makeLabelled(reactor,"裂变电源 FSP-01","受限爬升的稳定基载电源；动作同时受热应力、燃料与功率变化率约束。");
  for(let i=0;i<3;i++){const fin=addBox(baseGroup,[.1,1.1,1.9],0xb87f55,[5.65+i*.35,terrainHeight(6,-3)+1.2,-3],.6,.4);fin.rotation.y=-.25}
  createSolarArray(-7,-4,.15);createSolarArray(5.5,5.4,-.28);createSolarArray(-1.5,6.4,.08);
  createTower(1.6,-4.2);createRover(-2.6,-3.8);createRover(6.8,2.2);
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.35,.12,40),new THREE.MeshStandardMaterial({color:0x474a43,roughness:.8,metalness:.3}));pad.position.set(-8,terrainHeight(-8,4.2)+.07,4.2);pad.receiveShadow=true;baseGroup.add(pad);
  const lander=new THREE.Group();lander.position.set(-8,terrainHeight(-8,4.2)+.35,4.2);
  const landerBody=new THREE.Mesh(new THREE.CylinderGeometry(.7,1.0,1.25,8),new THREE.MeshStandardMaterial({color:0xc5af8f,metalness:.7,roughness:.35}));landerBody.position.y=.95;landerBody.castShadow=true;lander.add(landerBody);
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const leg=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,1.5,8),new THREE.MeshStandardMaterial({color:0x62584c,metalness:.8}));leg.position.set(Math.cos(a)*.72,.5,Math.sin(a)*.72);leg.rotation.z=Math.cos(a)*.5;leg.rotation.x=Math.sin(a)*.5;lander.add(leg)}
  makeLabelled(landerBody,"补给着陆器 CARGO-12","应急库存与备件入口；沙尘场景下暂停非必要卸载任务。");baseGroup.add(lander);

  const dustGeo=new THREE.BufferGeometry();const dustPos=[];
  for(let i=0;i<1800;i++)dustPos.push((random()-.5)*70,random()*12,(random()-.5)*70);
  dustGeo.setAttribute("position",new THREE.Float32BufferAttribute(dustPos,3));
  dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xe6a36f,size:.045,transparent:true,opacity:.18,depthWrite:false}));
  scene.add(dust);
  updateCamera();
  resizeWorld();
  window.addEventListener("resize",resizeWorld);
  canvas.addEventListener("pointerdown",e=>{dragging=true;moved=0;lastPointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;moved+=Math.abs(dx)+Math.abs(dy);targetYaw-=dx*.006;targetPitch=Math.max(.22,Math.min(1.12,targetPitch+dy*.004));lastPointer={x:e.clientX,y:e.clientY}});
  canvas.addEventListener("pointerup",e=>{dragging=false;if(moved<8)pickObject(e);});
  canvas.addEventListener("wheel",e=>{e.preventDefault();desiredDistance=Math.max(12,Math.min(48,desiredDistance+e.deltaY*.02))},{passive:false});
  animate();
}

function resizeWorld(){if(!renderer)return;const canvas=$("#marsCanvas");const width=canvas.clientWidth,height=canvas.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix()}
function updateCamera(){const cp=Math.cos(pitch);camera.position.set(target.x+distance*Math.sin(yaw)*cp,target.y+distance*Math.sin(pitch),target.z+distance*Math.cos(yaw)*cp);camera.lookAt(target)}
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(.04,clock3d.getDelta());
  if(!dragging)targetYaw-=dt*.035;
  yaw+=(targetYaw-yaw)*.07;pitch+=(targetPitch-pitch)*.07;distance+=(desiredDistance-distance)*.08;updateCamera();
  if(dust){dust.rotation.y+=dt*.025;const pos=dust.geometry.attributes.position;const speed=currentPhase===1||currentPhase===2?.16:.035;for(let i=0;i<pos.count;i+=3){let x=pos.getX(i)+speed;if(x>35)x=-35;pos.setX(i,x)}pos.needsUpdate=true}
  if(baseGroup)baseGroup.children.forEach((child,i)=>{if(child.type==="Group"&&i%4===0)child.position.y+=Math.sin(performance.now()*.001+i)*.00025});
  renderer.render(scene,camera);
}
function updateWorldPhase(phase){
  if(!scene)return;const storm=phase===1||phase===2||phase===4;
  scene.fog.density=storm?.043:phase===5?.026:.022;scene.fog.color.setHex(storm?0x7a3824:0x8b4a2e);scene.background.setHex(storm?0x6c3323:0x8b4a2e);
  dust.material.opacity=storm?.55:phase===5?.28:.18;dust.material.size=storm?.075:.045;
  directional.intensity=storm?2.2:4.2;renderer.toneMappingExposure=storm?.82:1.05;
}
function pickObject(event){
  const canvas=$("#marsCanvas"),rect=canvas.getBoundingClientRect(),mouse=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height*2-1));
  const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects(interactive,false);if(!hits.length)return;
  if(selectedObject?.material?.emissive)selectedObject.material.emissive.setHex(selectedObject.userData.originalEmissive||0);
  selectedObject=hits[0].object;if(selectedObject.material.emissive){selectedObject.userData.originalEmissive=selectedObject.material.emissive.getHex();selectedObject.material.emissive.setHex(0x1a6b4b)}
  $("#calloutNo").textContent="OBJECT INSPECTION";$("#calloutTitle").textContent=selectedObject.userData.label;$("#calloutText").textContent=selectedObject.userData.description;
}
function setCamera(mode){if(mode==="rover"){target.set(-2.3,.9,-3.4);targetYaw=-1.25;targetPitch=.27;desiredDistance=9}else{target.set(0,1.2,0);targetYaw=-.72;targetPitch=.52;desiredDistance=31}$$("[data-camera]").forEach(b=>b.classList.toggle("active",b.dataset.camera===mode))}

// ---------- INITIALIZATION & EVENTS ----------
function buildStaticUI(){
  $("#forecastBars").innerHTML=phases[0].bars.map(v=>`<i style="height:${v}%"></i>`).join("");
  $("#matrixGrid").innerHTML=Array.from({length:40},()=>"<i></i>").join("");
  renderProofChart();applyPhase(0);
  $$("[data-action]").forEach(button=>button.addEventListener("click",()=>{
    const action=button.dataset.action;
    if(action==="reset"){clearInterval(demoTimer);demoTimer=null;applyPhase(0);setMode("world");setCamera("orbit");}
    if(action==="demo")startDemo();
    if(action==="inject")applyPhase(1);
    if(action==="proof")$("#proofDialog").showModal();
    if(action==="authorize")openAuthorization();
    if(action==="confirm-auth")runAuthorization();
    if(action==="recalibrate"){tick+=100;$("#tick").textContent=`PYTHON TICK ${String(tick).padStart(4,"0")}`;$("#calloutTitle").textContent="模型重校准完成";$("#calloutText").textContent="遥测残差已重新估计，世界状态与观测时间戳保持一致。";}
    if(action==="zoom-in")desiredDistance=Math.max(12,desiredDistance-4);
    if(action==="zoom-out")desiredDistance=Math.min(48,desiredDistance+4);
    if(action==="close-overlay"){setMode("world");}
  }));
  $$("[data-mode]").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.mode)));
  $$("[data-policy]").forEach(button=>button.addEventListener("click",()=>selectPolicy(button.dataset.policy)));
  $$("[data-camera]").forEach(button=>button.addEventListener("click",()=>setCamera(button.dataset.camera)));
  $$("[data-quality]").forEach(button=>button.addEventListener("click",()=>{
    const high=button.dataset.quality==="high";renderer.setPixelRatio(Math.min(devicePixelRatio,high?1.65:1));renderer.shadowMap.enabled=high;
    $$("[data-quality]").forEach(b=>b.classList.toggle("active",b===button));
  }));
  document.addEventListener("keydown",e=>{
    if(e.key==="p"||e.key==="P")targetYaw+=Math.PI/2;
    if(e.key>="1"&&e.key<="4"){const views=[[-.72,.52,31],[-1.25,.27,9],[.2,.75,39],[2.5,.35,24]][Number(e.key)-1];[targetYaw,targetPitch,desiredDistance]=views}
    if(e.key==="Escape")setMode("world");
  });
  setInterval(()=>{
    const now=new Date(),sec=String(now.getSeconds()).padStart(2,"0"),min=String(now.getMinutes()).padStart(2,"0"),hour=String(now.getHours()).padStart(2,"0");
    $("#clock").textContent=`SOL 0427 · LMST ${hour}:${min}:${sec}`;$("#worldTime").textContent=`LMST ${hour}:${min}:${sec}`;$("#latency").textContent=`${4+Math.floor(Math.random()*5)} ms`;
  },1000);
}

function boot() {
  buildStaticUI();
  const bar=$("#bootBar"),text=$("#bootText");let value=12;
  const progress=setInterval(()=>{value=Math.min(92,value+9+Math.random()*12);bar.style.width=`${value}%`;if(value>48)text.textContent="正在绑定物理约束与传感器证据…"},140);
  try{
    buildWorld();
    clearInterval(progress);bar.style.width="100%";text.textContent="世界模型就绪 · PYTHON MIRROR ONLINE";
    setTimeout(()=>$("#boot").classList.add("hidden"),350);
  }catch(error){
    clearInterval(progress);bar.style.width="100%";text.textContent="3D 降级模式已启用，交互控制台仍可运行";
    console.error(error);setTimeout(()=>$("#boot").classList.add("hidden"),700);
  }
}
boot();
