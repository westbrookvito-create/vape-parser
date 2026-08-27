import { ReactNode } from "react";
import TabBar from "./TabBar";

export default function Layout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">{title}</header>
      <main className="app-content">{children}</main>
      <TabBar />
    </div>
  );
}
