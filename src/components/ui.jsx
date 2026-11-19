export const rx={mail:/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,name:/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,}$/,doc:/^\d{5,12}$/,tel:/^3\d{9}$/}
export const ESP=['Medicina general','Pediatría','Cardiología','Dermatología','Ginecología','Odontología']
export const DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
export const ROL={paciente:'Paciente',medico:'Médico',recepcion:'Recepcionista',admin:'Administrador'}
export const full=o=>o?`${o.nombres} ${o.apellidos}`:'—'
export const hhmm=t=>String(t).slice(0,5)
export const toMin=t=>{const[a,b]=String(t).split(':');return +a*60+ +b}
export const fmt=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')
export const Field=({label,err,...p})=><label>{label}<input {...p} aria-invalid={err?'true':undefined}/><span className="err">{err}</span></label>
export const Empty=({children})=><div className="empty">{children}</div>
export const Modal=({title,onClose,children})=><div className="ov" onClick={onClose}><div className="card md" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><h2 style={{marginBottom:12}}>{title}</h2>{children}</div></div>
export const AuthShell=({children})=><div className="auth"><section className="hero"><div className="brand"><span className="logo"><Icon n="med"/></span>MediCitas</div><h1>Tu clínica, en orden.</h1><p>Pacientes, médicos y citas en un solo lugar, con acceso según tu rol.</p><ul className="feats"><li>Citas sin cruces</li><li>Cuatro roles con permisos</li><li>Horarios y franjas automáticas</li></ul></section><section className="formside"><div className="card">{children}</div></section></div>
const P={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/>',home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2.5.7 4 2.4 4 5"/>',med:'<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',out:'<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'}
export const Icon=({n})=><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{__html:P[n]}}/>
const COL=['#5b5fe3','#1f9b7e','#e0803a','#c0478a','#2a8fd6','#7a5af0']
export const Avatar=({o,size=56,sq})=>{const i=((o?.nombres?.charCodeAt(0)||0)+(o?.apellidos?.charCodeAt(0)||0))%COL.length
 return <div className="av" aria-hidden="true" style={{width:size,height:size,borderRadius:sq?20:'50%',fontSize:size/2.6,background:`linear-gradient(135deg,${COL[i]},${COL[(i+2)%COL.length]})`}}>{(o?.nombres?.[0]||'')+(o?.apellidos?.[0]||'')}</div>}
