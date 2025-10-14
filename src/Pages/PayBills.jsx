import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import "../styles.css";

// very small demo catalog of bill types and extra fields
const BILL_TYPES = [
  { key: "electricity", name: "Electricity", fields: [{k:"ca_number", label:"CA Number"}] },
  { key: "water",       name: "Water",       fields: [{k:"consumer_id", label:"Consumer ID"}] },
  { key: "property",    name: "Property Tax",fields: [{k:"ward_no", label:"Ward No."}, {k:"property_id", label:"Property ID"}] },
  { key: "gas",         name: "Gas",         fields: [{k:"customer_no", label:"Customer No."}] },
  { key: "phone",       name: "Phone/Mobile",fields: [{k:"number", label:"Phone Number"}] },
];

export default function PayBills() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // payee / payment details
  // For a real deployment, replace `pa` with your official merchant VPA
  const [payee, setPayee] = useState({ pa: "demo-merchant@upi", pn: "Citizen Services" });
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [extras, setExtras] = useState({}); // holds keyed extra fields
  const [upiUrl, setUpiUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return BILL_TYPES;
    return BILL_TYPES.filter(b => b.name.toLowerCase().includes(q));
  }, [search]);

  function choose(b) {
    setSelected(b);
    setExtras({});
    setAmount("");
    setNote("");
    setUpiUrl("");
    setQrDataUrl("");
  }

  // Build UPI deep-link
  function buildUpiUrl() {
    if (!selected) return "";
    if (!payee.pa) return "";
    const params = new URLSearchParams({
      pa: payee.pa,                 // payee VPA
      pn: payee.pn || "Citizen Services",
      am: amount || "0",
      cu: "INR",
      tn: (note || `${selected.name} bill`).slice(0, 80),
    });
    // include extra identifiers in the note tail
    const idParts = Object.entries(extras)
      .filter(([,v]) => v?.trim())
      .map(([k,v]) => `${k}:${v.trim()}`);
    if (idParts.length) params.set("tn", `${params.get("tn")} | ${idParts.join(", ")}`.slice(0, 80));
    return `upi://pay?${params.toString()}`;
  }

  async function generate() {
    const url = buildUpiUrl();
    setUpiUrl(url);
    try {
      const dataUrl = await QRCode.toDataURL(url, { margin: 1, scale: 6 });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl("");
    }
  }

  // if user is on mobile, clicking Pay should attempt to open the UPI app
  function openUpi() {
    if (!upiUrl) return;
    window.location.href = upiUrl;
  }

  return (
    <>
      {/* Search + list */}
      <div className="section">
        <h2>Pay Your Bills</h2>
        <div className="row">
          <input className="input" style={{flex:1}} placeholder="Search bill type (e.g., electricity, water, phone)…"
                 value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        <div className="row" style={{marginTop:12, gap:8, flexWrap:"wrap"}}>
          {filtered.map(b => (
            <button key={b.key}
              className={"secondary"}
              style={{
                border: "1px solid var(--line)", background: selected?.key===b.key ? "#1a2742" : "#0e1627"
              }}
              onClick={()=>choose(b)}
            >
              {b.name}
            </button>
          ))}
        </div>
        {!selected && <p className="help" style={{marginTop:8}}>Pick a bill type to continue.</p>}
      </div>

      {/* Details + Payment */}
      {selected && (
        <div className="section">
          <h2>{selected.name} — Details & Payment</h2>

          <div className="row" style={{rowGap:10}}>
            {/* Payee (merchant) */}
            <input className="input" style={{minWidth:260}} placeholder="Payee UPI ID (VPA) e.g., demo-merchant@upi"
                   value={payee.pa} onChange={e=>setPayee({...payee, pa:e.target.value})}/>
            <input className="input" style={{minWidth:220}} placeholder="Payee Name"
                   value={payee.pn} onChange={e=>setPayee({...payee, pn:e.target.value})}/>
          </div>

          {/* Bill identifiers */}
          <div className="row" style={{rowGap:10, marginTop:10}}>
            {selected.fields.map(f => (
              <input key={f.k} className="input" placeholder={f.label}
                     value={extras[f.k] || ""} onChange={e=>setExtras({...extras,[f.k]:e.target.value})}/>
            ))}
          </div>

          {/* Amount + Note */}
          <div className="row" style={{rowGap:10, marginTop:10}}>
            <input className="input" style={{width:140}} placeholder="Amount (INR)" inputMode="decimal"
                   value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.]/g,""))}/>
            <input className="input" style={{flex:1}} placeholder="Note (optional)"
                   value={note} onChange={e=>setNote(e.target.value)} />
          </div>

          <div className="row" style={{marginTop:12}}>
            <button onClick={generate}>Generate UPI</button>
            <button className="secondary" onClick={()=>{ setUpiUrl(""); setQrDataUrl(""); }}>Clear</button>
          </div>

          {upiUrl && (
            <div className="row" style={{marginTop:16, alignItems:"center", gap:18}}>
              <div>
                <div className="help">UPI Link (mobile will open your UPI app):</div>
                <a href={upiUrl} style={{wordBreak:"break-all", color:"#93c5fd"}}>{upiUrl}</a>
                <div style={{marginTop:8}}>
                  <button onClick={openUpi}>Pay now (mobile)</button>
                </div>
                <p className="help" style={{marginTop:8}}>
                  On desktop, scan QR with your UPI app.
                </p>
              </div>
              {qrDataUrl && (
                <div style={{padding:10, border:"1px solid var(--line)", borderRadius:12, background:"#0e1627"}}>
                  <img src={qrDataUrl} alt="UPI QR" style={{width:220, height:220}} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
