import "./Dashboard.css";
import { useEffect, useState } from "react";

export default function Dashboard() {
  // pretend numbers from server
  const [stats, setStats] = useState({ total: 2481, today: 37, pending: 198, resolved: 2143 });

  useEffect(() => {
    // you could fetch real numbers from /api/requests and compute; using dummy for now
    const t = setInterval(()=> {
      setStats(s => ({ ...s, today: s.today + (Math.random() > .6 ? 1 : 0) }));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const notices = [
    { id:1, title:"Birth & Death certificate window maintenance", when:"15 Oct, 10:00–12:00" },
    { id:2, title:"New Aadhaar address update flow", when:"Launched" },
    { id:3, title:"Online fee payment downtime", when:"17 Oct, 02:00–03:00" },
  ];

  return (
    <>
      <div className="cards">
        <Card label="Total Requests" value={stats.total} />
        <Card label="Requests Today" value={stats.today} />
        <Card label="Pending" value={stats.pending} badge="warning" />
        <Card label="Resolved" value={stats.resolved} badge="success" />
      </div>

      <div className="two-col">
        <section className="panel">
          <h3>Popular Services</h3>
          <ul className="list">
            <li>Birth Certificate – 32%</li>
            <li>Domicile Certificate – 22%</li>
            <li>Ration Card – 18%</li>
            <li>Electricity Bill – 12%</li>
            <li>Land Records – 8%</li>
          </ul>
        </section>

        <section className="panel">
          <h3>Announcements</h3>
          <ul className="list">
            {notices.map(n => <li key={n.id}><b>{n.title}</b><br/><span className="muted">{n.when}</span></li>)}
          </ul>
        </section>
      </div>
    </>
  );
}

function Card({ label, value, badge }) {
  return (
    <div className={"card " + (badge || "")}>
      <div className="card-value">{value.toLocaleString()}</div>
      <div className="card-label">{label}</div>
    </div>
  );
}
