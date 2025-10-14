import { useEffect, useState } from "react";
import { listRequests, createRequest, updateRequest, deleteRequest } from "../api";
import "../styles.css";
import { useAuth } from "../auth";

const empty = { name:"", email:"", phone:"", service_type:"", status:"pending" };

export default function Requests() {
  const { user } = useAuth();
  const [items,setItems] = useState([]);
  const [form,setForm] = useState(empty);
  const [editingId,setEditingId] = useState(null);
  const [q,setQ] = useState("");
  const [pin,setPin] = useState(""); const [pinInfo,setPinInfo] = useState("");
  const [toast,setToast] = useState(null); const [loading,setLoading] = useState(false);

  const load = async()=>{ setItems(await listRequests(q)); };
  useEffect(()=>{ load(); },[q]);

  function toastOk(msg){ setToast({type:"good",msg}); setTimeout(()=>setToast(null),1800); }
  function toastBad(msg){ setToast({type:"bad",msg}); setTimeout(()=>setToast(null),1800); }

  function validate(){
    if(!form.name.trim()) return "Name is required";
    if(!/^\S+@\S+\.\S+$/.test(form.email)) return "Valid email required";
    if(form.phone && !/^\d{7,15}$/.test(form.phone)) return "Phone 7–15 digits";
    if(!form.service_type.trim()) return "Service type is required";
    return null;
  }

  async function submit(e){
    e.preventDefault();
    const err = validate(); if(err) return toastBad(err);
    try{
      setLoading(true);
      if(editingId){ await updateRequest(editingId, form); toastOk("Updated"); }
      else{ await createRequest(form); toastOk("Created"); }
      setForm(empty); setEditingId(null); setPin(""); setPinInfo(""); await load();
    }catch{ toastBad("Save failed"); } finally{ setLoading(false); }
  }

  function startEdit(it){ setEditingId(it.id); setForm({...it}); window.scrollTo({top:0,behavior:"smooth"}); }
  async function remove(id){ if(confirm("Delete?")){ await deleteRequest(id); toastOk("Deleted"); load(); } }

  async function lookupPin(){
    if(pin.trim().length<6) return setPinInfo("");
    try{
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin.trim()}`);
      const data = await res.json(); const po = data?.[0]?.PostOffice?.[0];
      setPinInfo(po ? `${po.District}, ${po.State}` : "Not found");
    }catch{ setPinInfo("Not found"); }
  }

  return (
    <>
      <div className="section">
        <h2>Search</h2>
        <div className="row">
          <input className="input" style={{flex:1}} placeholder="Search (name / email / service / status)…" value={q} onChange={e=>setQ(e.target.value)} />
          <button onClick={load}>Refresh</button>
        </div>
      </div>

      <div className="section">
        <h2>{editingId ? "Edit Request" : "Create Request"}</h2>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        <form onSubmit={submit} className="row" style={{rowGap:10}}>
          <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          <input className="input" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
          <input className="input" placeholder="Service Type (e.g., Birth Certificate)" value={form.service_type} onChange={e=>setForm({...form,service_type:e.target.value})} required />
          <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
          <input className="input" placeholder="PIN code" value={pin} onChange={e=>setPin(e.target.value)} onBlur={lookupPin}/>
          <div className="help" style={{alignSelf:"center"}}>{pinInfo || " "}</div>
          <div style={{width:"100%",display:"flex",gap:10}}>
            <button type="submit" disabled={!user || loading}>{editingId?"Update":"Create"}</button>
            {editingId && <button type="button" className="secondary" onClick={()=>{setEditingId(null); setForm(empty);}}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="section">
        <h2>Requests</h2>
        <div style={{overflowX:"auto"}}>
          <table className="table">
            <thead><tr>
              <th style={{width:60}}>ID</th>
              <th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Status</th><th style={{width:160}}>Actions</th>
            </tr></thead>
            <tbody>
              {items.length===0 && <tr><td colSpan={7}>No records</td></tr>}
              {items.map(it=>(
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.name}</td>
                  <td>{it.email}</td>
                  <td>{it.phone}</td>
                  <td>{it.service_type}</td>
                  <td><span className={`badge ${it.status}`}>{it.status}</span></td>
                  <td>
                    <div className="row" style={{gap:6}}>
                      <button onClick={()=>startEdit(it)}>Edit</button>
                      <button className="danger" onClick={()=>remove(it.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
