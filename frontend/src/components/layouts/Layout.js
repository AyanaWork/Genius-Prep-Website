import { Outlet } from 'react-router-dom';
import Navbar from '../common/NavBar';

function Layout() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default Layout;