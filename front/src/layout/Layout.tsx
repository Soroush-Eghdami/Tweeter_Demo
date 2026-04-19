import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
  <div>Layout Component
    <main>
      <section>
        <Outlet />
      </section>
    </main>
  </div> 
);
};

export default Layout;