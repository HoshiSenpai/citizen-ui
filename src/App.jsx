import { useEffect, useState } from "react";
import "./styles.css";
import { listRequests, createRequest, updateRequest, deleteRequest } from "./api";
import GoogleAuth from "./GoogleAuth";

const empty = { name:"", email:"", phone:"", service_type:"", status:"pending" };

export default function App() {
  // auth
  const [user, setUser] = useState(null); // {name,email,picture}
  // data
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // {type:'good'|'bad', msg:string}
  // pin lookup
  const [pin, setPin] = useState("");
  const [pinInfo, setPinInfo] = useState("");

  async function load() {
    setLoading(true);
    try { setItems(await listRequests(q)); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [q]);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2000);
  }

  // validation (simple)
  function validate() {
    if (!form.name.trim()) return "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Valid email required";
    if (form.phone && !/^\d{7,15}$/.test(form.phone)) return "Phone must be 7–15 digits";
    if (!form.service_type.trim()) return "Service type is required";
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { showToast("bad", err); return; }
    try {
      setLoading(true);
      if (editingId) { await updateRequest(editingId, form); showToast("good","Updated"); }
      else { await createRequest(form); showToast("good","Created"); }
      setForm(empty); setEditingId(null); setPin(""); setPinInfo("");
      await load();
    } catch {
      showToast("bad","Save failed");
    } finally { setLoading(false); }
  }

  function startEdit(it) {
    setEditingId(it.id);
    setForm({ name:it.name||"", email:it.email||"", phone:it.phone||"", service_type:it.service_type||"", status:it.status||"pending" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id) {
    if (!confirm("Delete this request?")) return;
    try { await deleteRequest(id); showToast("good","Deleted"); await load(); }
    catch { showToast("bad","Delete failed"); }
  }

  async function lookupPin() {
    const v = pin.trim();
    if (v.length < 6) return setPinInfo("");
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${v}`);
      const data = await res.json();
      const po = data?.[0]?.PostOffice?.[0];
      setPinInfo(po ? `${po.District}, ${po.State}` : "Not found");
    } catch { setPinInfo("Not found"); }
  }

  return (
    <div className="container">
      <h1 className="h1">Citizen Service Requests</h1>
      <p className="sub">Create • search • edit • delete. Laravel API + MySQL, React UI.</p>

      {/* Authentication */}
      <div className="section">
        <h2>Authentication</h2>
        <div className="row">
          <GoogleAuth onSignedIn={setUser} onSignOut={() => setUser(null)} />
          {user && (
            <div className="help">
              Signed in as <b>{user.name}</b> ({user.email})
            </div>
          )}
        </div>
        {!user && <div className="help">Sign in to enable create/edit/delete.</div>}
      </div>

      {/* Search */}
      <div className="section">
        <h2>Search</h2>
        <div className="row">
          <input className="input" style={{flex:1}} placeholder="Search (name / email / service / status)…"
                 value={q} onChange={(e)=>setQ(e.target.value)} />
          <button onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>

      {/* Create / Edit */}
      <div className="section">
        <h2>{editingId ? "Edit Request" : "Create Request"}</h2>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        <form onSubmit={submit} className="row" style={{rowGap:10}}>
          <input className="input" placeholder="Name" value={form.name}
                 onChange={(e)=>setForm({...form,name:e.target.value})} required />
          <input className="input" placeholder="Email" type="email" value={form.email}
                 onChange={(e)=>setForm({...form,email:e.target.value})} required />
          <input className="input" placeholder="Phone" value={form.phone}
                 onChange={(e)=>setForm({...form,phone:e.target.value})} />
          <input className="input" placeholder="Service Type (e.g., Birth Certificate)" value={form.service_type}
                 onChange={(e)=>setForm({...form,service_type:e.target.value})} required />
          <select className="input" value={form.status}
                  onChange={(e)=>setForm({...form,status:e.target.value})}>
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>

          {/* PIN */}
          <input className="input" placeholder="PIN code" value={pin}
                 onChange={(e)=>setPin(e.target.value)} onBlur={lookupPin}/>
          <div className="help" style={{alignSelf:"center"}}>{pinInfo || " "}</div>

          <div style={{width:"100%", display:"flex", gap:10}}>
            <button type="submit" disabled={loading || !user}>
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={()=>{setEditingId(null); setForm(empty);}}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="section">
        <h2>Requests</h2>
        <div style={{overflowX:"auto"}}>
          <table className="table">
            <thead>
              <tr>
                <th style={{width:60}}>ID</th>
                <th>Name</th><th>Email</th><th>Phone</th>
                <th>Service</th><th>Status</th><th style={{width:160}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length===0 && <tr><td colSpan={7}>No records</td></tr>}
              {items.map((it)=>(
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.name}</td>
                  <td>{it.email}</td>
                  <td>{it.phone}</td>
                  <td>{it.service_type}</td>
                  <td><span className={`badge ${it.status}`}>{it.status}</span></td>
                  <td>
                    <div className="row" style={{gap:6}}>
                      <button onClick={()=>startEdit(it)} disabled={!user}>Edit</button>
                      <button className="danger" onClick={()=>remove(it.id)} disabled={!user}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

