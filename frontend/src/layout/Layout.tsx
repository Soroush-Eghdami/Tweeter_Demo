import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="bg-custom-dark-gradient text-white h-auto min-h-dvh">
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
