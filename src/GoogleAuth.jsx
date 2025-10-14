import { useEffect, useRef } from "react";

export default function GoogleAuth({ onSignedIn, onSignOut }) {
  const btn = useRef(null);

  useEffect(() => {
    // load only after script is available
    if (!window.google) return;
    const clientId = "383140041753-27r0n3fltegclnlqc6fc762fp7t0phki.apps.googleusercontent.com"; // get from Google Cloud Console

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => {
        // decode the JWT payload (base64) – demo only
        const payload = JSON.parse(atob(resp.credential.split(".")[1]));
        onSignedIn?.({ name: payload.name, email: payload.email, picture: payload.picture, idToken: resp.credential });
      },
    });

    window.google.accounts.id.renderButton(btn.current, { theme: "outline", size: "large" });
  }, []);

  return (
    <div className="row" style={{alignItems:"center", gap:10}}>
      <div ref={btn}></div>
      <button className="secondary" onClick={()=>onSignOut?.()} style={{height:38}}>Sign out</button>
    </div>
  );
}
