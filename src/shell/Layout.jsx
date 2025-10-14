import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Layout() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  function doSignOut() {
    signOut();
    nav("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Citizen<br/>Portal</div>
        <nav className="nav">
          <NavItem to="/">Dashboard</NavItem>
          <NavItem to="/requests">Requests</NavItem>
          <NavItem to="/paybills">Pay Bills</NavItem>
          <NavItem to="/reports" disabled>Reports (soon)</NavItem>
          <NavItem to="/settings" disabled>Settings (soon)</NavItem>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="top-title">Unified Citizen Services</div>
          <div className="user-chip">
            {user?.picture && <img src={user.picture} alt="" />}
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button className="secondary" onClick={doSignOut}>Sign out</button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, children, disabled }) {
  if (disabled) return <span className="nav-link disabled">{children}</span>;
  return (
    <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to={to}>
      {children}
    </NavLink>
  );
}

