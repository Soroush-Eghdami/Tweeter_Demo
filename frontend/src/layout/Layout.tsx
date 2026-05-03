import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="h-auto min-h-dvh bg-custom-dark-gradient text-white">
      <main className="pt-22">
        <Navbar />
        <section>
          <Outlet />
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
