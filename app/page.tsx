"use client";

import { useEffect, useRef, useState } from "react";

const phases = [
  { name: "巡航监测", sub: "方舟空间站运行正常", survival: 98, energy: 82, alert: false },
  { name: "太阳风暴抵达", sub: "高能粒子流命中外层护盾", survival: 63, energy: 71, alert: true },
  { name: "事故链推演", sub: "AI 正在模拟 2,048 条未来路径", survival: 46, energy: 58, alert: true },
  { name: "执行曙光方案", sub: "轨道修正与能源隔离同步执行", survival: 84, energy: 44, alert: true },
  { name: "危机解除", sub: "空间站进入木星磁层安全区", survival: 99, energy: 39, alert: false },
];

const crew = [
  ["ORBIT", "轨道智能体", "计算引力弹弓窗口", "04:18"],
  ["HELIOS", "能源智能体", "重构反应堆供能网络", "02:41"],
  ["AESCUL", "生命智能体", "维持 312 名乘员生命保障", "稳定"],
  ["AEGIS", "防御智能体", "偏转高能粒子流", "76%"],
];

const plans = [
  { id: "A", name: "曙光", desc: "借助木星引力完成紧急变轨", rate: 84, cost: 44, color: "#6af4ff" },
  { id: "B", name: "坚盾", desc: "关闭非核心舱段强化护盾", rate: 71, cost: 29, color: "#b895ff" },
  { id: "C", name: "远航", desc: "脱离当前轨道返回火星基地", rate: 62, cost: 67, color: "#ffad62" },
];

export default function Home() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [plan, setPlan] = useState("A");
  const [rotation, setRotation] = useState({ x: -9, y: -16 });
  const drag = useRef<{x:number;y:number;rx:number;ry:number}|null>(null);
  const p = phases[phase];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPhase(v => (v + 1) % phases.length), 3300);
    return () => clearInterval(id);
  }, [playing]);

  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setRotation({ x: Math.max(-38, Math.min(22, drag.current.rx - (e.clientY-drag.current.y)*.18)), y: drag.current.ry + (e.clientX-drag.current.x)*.22 });
  };

  return (
    <main className={`ark ${p.alert ? "danger" : ""}`}>
      <div className="stars far"/><div className="stars near"/><div className="noise"/>
      <header className="topbar">
        <div className="ark-logo"><span className="logo-core"/><div><b>ARK // DEEP SPACE</b><small>深空方舟 · 自主任务决策系统</small></div></div>
        <div className="mission"><span>MISSION</span><b>ODYSSEY–27</b><i>木星转移轨道</i></div>
        <div className="signal"><span className="pulse"/><div><b>量子链路在线</b><small>延迟 12.4 ms</small></div><time>2187.08.16　14:32:08 UTC</time></div>
      </header>

      <section className="statusbar">
        <Gauge label="乘员生存率" value={p.survival} unit="%" hot={p.survival < 70}/>
        <Gauge label="反应堆功率" value={p.energy} unit="%" hot={p.energy > 80}/>
        <Gauge label="护盾完整度" value={phase===0?94:phase===4?61:47} unit="%" hot={phase>0&&phase<4}/>
        <Gauge label="氧气储备" value={phase<3?86:79} unit="H"/>
        <div className={`threat ${p.alert?"hot":""}`}><span>任务威胁等级</span><b>{p.alert ? "OMEGA" : "NOMINAL"}</b><small>{p.alert?"极端空间天气":"全部系统正常"}</small></div>
      </section>

      <div className="deck">
        <aside className="side left-side glass">
          <SectionTitle no="01" title="事件与事故链"/>
          <div className={`storm-event ${phase>0?"active":""}`} onClick={()=>setPhase(1)}>
            <div><span>HELIOS WARNING</span><time>T–00:04:18</time></div>
            <b>G5 级太阳质子风暴</b>
            <p>粒子通量达到 3.8×10⁶ pfu，空间站将在 4 分 18 秒后进入风暴核心。</p>
            <footer><span>速度 1,284 km/s</span><span>置信度 99.7%</span></footer>
          </div>
          <div className="chain-title"><span>事故传播链</span><b>{phase<2?"等待推演":"实时推演"}</b></div>
          <div className={`fault-chain ${phase>=2?"running":""}`}>
            {["外层护盾过载","太阳翼电压骤降","姿态控制失效","生命舱温度上升"].map((x,i)=><div key={x}><i>{i+1}</i><span><b>{x}</b><small>概率 {phase>=2?[97,82,64,41][i]:"--"}%</small></span>{i<3&&<em/>}</div>)}
          </div>
          <div className="spectrum"><div><span>粒子能谱 / MeV</span><b>LIVE</b></div><figure>{[17,27,21,39,34,52,44,67,83,59,91,72,48,36,25].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</figure></div>
        </aside>

        <section className="space-window"
          onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY,rx:rotation.x,ry:rotation.y};e.currentTarget.setPointerCapture(e.pointerId)}}
          onPointerMove={move} onPointerUp={()=>drag.current=null}>
          <div className="window-hud"><span>{String(phase+1).padStart(2,"0")} / 05</span><div><b>{p.name}</b><small>{p.sub}</small></div></div>
          <div className={`solar-storm ${phase>0&&phase<4?"show":""}`}><i/><i/><i/><span>SOLAR PARTICLE FRONT</span></div>
          <div className="scene3d" style={{transform:`rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`}}>
            <div className="planet">
              <div className="planet-grid"/><div className="planet-light"/><div className="planet-shadow"/>
              <i className="spot s1"/><i className="spot s2"/><i className="spot s3"/>
            </div>
            <div className="orbit orbit-a"><span className="station"><i className="body"/><i className="wing left"/><i className="wing right"/><i className="dish"/><em>ARK–01</em></span></div>
            <div className="orbit orbit-b"><i className="satellite"/></div>
            <div className={`safe-arc ${phase>=3?"visible":""}`}><span>AI SAFE TRAJECTORY</span></div>
          </div>
          <div className="target-lock"><i/><i/><span>JUPITER // J-2147</span><b>71492 KM</b></div>
          <div className="scene-caption">拖动以旋转 3D 星图　·　SCROLL TO ZOOM　<span>REAL-TIME ORBITAL TWIN</span></div>
          <div className="camera"><button aria-label="重置视角" onClick={()=>setRotation({x:-9,y:-16})}>⌖</button><button aria-label="放大">＋</button><button aria-label="缩小">−</button></div>
        </section>

        <aside className="side right-side glass">
          <SectionTitle no="02" title="AI 联合决策"/>
          <div className="ai-head"><div className="ai-sphere"><i/><i/><b>Σ</b></div><span><small>ATHENA CORE</small><b>{phase<2?"全域态势感知":"并行推演进行中"}</b><em>{phase<2?"0.8 PFLOPS":"18.4 PFLOPS"}</em></span></div>
          <div className="ai-note"><span>AI 任务研判</span><p>{phase<2?"方舟已接近木星转移窗口。持续监测太阳活动与 37 个关键子系统。":"当前轨道将在 11 分钟后穿过高辐射区。曙光方案可将全员生存率提升至 84%，建议立即执行。"}</p></div>
          <div className="agents">{crew.map((a,i)=><div key={a[0]} className={phase>=2?"awake":""}><i>{i+1}</i><span><small>{a[0]}</small><b>{a[1]}</b><em>{phase>=2?a[2]:"待命"}</em></span><strong>{phase>=2?a[3]:"--"}</strong></div>)}</div>
          <button className="open-plans" onClick={()=>setPhase(2)}>{phase<2?"启动危机推演":"已生成 3 套救援方案"}<span>→</span></button>
        </aside>
      </div>

      <section className={`plan-drawer ${phase>=2?"open":""}`}>
        <div className="plan-label"><span>AI 救援方案</span><b>选择最优未来</b></div>
        <div className="plans">{plans.map(x=><button key={x.id} className={plan===x.id?"selected":""} onClick={()=>setPlan(x.id)} style={{"--plan":x.color} as React.CSSProperties}><i>{x.id}</i><span><b>{x.name}方案</b><small>{x.desc}</small></span><em>生存率 <strong>{x.rate}%</strong></em><em>能耗 <strong>{x.cost}%</strong></em></button>)}</div>
        <button className="commit" onClick={()=>setPhase(3)} disabled={phase<2}>执行 {plans.find(x=>x.id===plan)?.name}方案 <small>AUTH // COMMANDER</small></button>
      </section>

      <footer className="timeline-bar">
        <div><small>任务时间轴</small><b>{["T–04:18","T–00:00","T+02:41","T+06:24","T+18:52"][phase]}</b></div>
        <nav><span className="rail"><i style={{width:`${phase*25}%`}}/></span>{phases.map((x,i)=><button key={x.name} className={i<=phase?"done":""} onClick={()=>{setPhase(i);setPlaying(false)}}><i/><span>{x.name}</span></button>)}</nav>
        <button className={`autoplay ${playing?"on":""}`} onClick={()=>setPlaying(!playing)}>{playing?"Ⅱ 暂停演示":"▶ 自动演示"}</button>
      </footer>
    </main>
  );
}

function Gauge({label,value,unit,hot=false}:{label:string,value:number,unit:string,hot?:boolean}){return <div className="gauge"><span>{label}</span><div><b className={hot?"hot":""}>{value}</b><small>{unit}</small></div><i><em style={{width:`${value}%`}}/></i></div>}
function SectionTitle({no,title}:{no:string,title:string}){return <div className="section-title"><span>{no}</span><b>{title}</b><i/></div>}
