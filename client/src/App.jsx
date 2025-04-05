import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div>
      <header>My Navbar</header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
