import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "深空方舟 AI · 自主任务决策系统",
  description: "融合 3D 轨道数字孪生与多智能体推演的深空危机决策平台",
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="zh-CN"><body>{children}</body></html>;
}
