import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
