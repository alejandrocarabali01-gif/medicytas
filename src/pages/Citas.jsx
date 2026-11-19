import {useCallback,useEffect,useMemo,useState} from 'react'
import {supabase} from '../lib/supabase'
import {useAuth} from '../auth'
import {Empty,Avatar,Icon,ESP,full,hhmm,toMin,fmt,DIAS} from '../components/ui'
import {notify} from '../components/Toasts'
const EST={programada:['Programada','ok'],atendida:['Atendida','ok'],inasistencia:['Inasistencia','off'],cancelada:['Cancelada','off']}
const MES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ymd=d=>d.toLocaleDateString('en-CA')
const h12=t=>{const[h,m]=t.split(':').map(Number);return `${String(h%12||12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`}

function Agendar({uid,onDone}){
 const[meds,setMeds]=useState([]),[hs,setHs]=useState([]),[pid,setPid]=useState(null)
 const[sel,setSel]=useState(''),[date,setDate]=useState(''),[slot,setSlot]=useState(''),[motivo,setMotivo]=useState('')
 const[cur,setCur]=useState(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)})
 const[q,setQ]=useState(''),[esp,setEsp]=useState(''),[busy,setBusy]=useState(new Set()),[tk,setTk]=useState(0)
 const today=ymd(new Date())
 useEffect(()=>{(async()=>{
  const[a,b,c]=await Promise.all([supabase.from('medicos').select('*').eq('activo',true),supabase.from('horarios').select('*'),supabase.from('pacientes').select('*').eq('user_id',uid).maybeSingle()])
  setMeds(a.data||[]);setHs(b.data||[]);setPid(c.data?.id)})()},[uid])
 useEffect(()=>{setSlot('');if(!sel||!date)return setBusy(new Set())
  supabase.rpc('franjas_ocupadas',{p_medico:sel,p_fecha:date}).then(({data})=>setBusy(new Set((data||[]).map(hhmm))))},[sel,date,tk])
 const avail=meds.filter(m=>hs.some(h=>h.medico_id===m.id))
 const list=avail.filter(m=>(!esp||m.especialidad===esp)&&(!q.trim()||(full(m)+' '+m.especialidad).toLowerCase().includes(q.toLowerCase().trim())))
 const doc=meds.find(m=>m.id===sel),dh=hs.filter(h=>h.medico_id===sel).sort((a,b)=>a.dia-b.dia),dias=new Set(dh.map(h=>h.dia))
 const slots=useMemo(()=>{if(!date||!sel)return[];const dow=(new Date(date+'T00:00').getDay()+6)%7,s=new Set()
  hs.filter(h=>h.medico_id===sel&&h.dia===dow).forEach(h=>{for(let t=toMin(h.hora_inicio);t+30<=toMin(h.hora_fin);t+=30)s.add(fmt(t))});return[...s].sort()},[date,sel,hs])
 const now=new Date(),past=x=>date===today&&toMin(x)<=now.getHours()*60+now.getMinutes()
 const y=cur.getFullYear(),mo=cur.getMonth(),off=(new Date(y,mo,1).getDay()+6)%7,nd=new Date(y,mo+1,0).getDate()
 const cells=[...Array(off).fill(null),...Array.from({length:nd},(_,i)=>i+1)]
 const key=d=>ymd(new Date(y,mo,d)),dis=d=>!sel||key(d)<today||!dias.has((new Date(y,mo,d).getDay()+6)%7)
 const pick=id=>{setSel(id);setDate('');setSlot('')}
 const book=async()=>{
  if(!window.confirm(`¿Confirmar tu cita con Dr. ${full(doc)} el ${date} a las ${h12(slot)}?`))return
  const{error}=await supabase.from('citas').insert({paciente_id:pid,medico_id:sel,fecha:date,hora:slot,motivo:motivo.trim()||null})
  if(error){notify(error.code==='23505'?'Esa franja acaba de ocuparse o ya tienes una cita a esa hora.':error.message,'err');return setTk(t=>t+1)}
  notify('Cita registrada correctamente.');setMotivo('');setTk(t=>t+1);onDone()}
 return <div className="book">
  <section className="card"><h2>Reservar cita</h2><p className="sub">{doc?'Con Dr. '+full(doc):'Elige un médico de la lista'}</p>
   <div className="cal-h"><b>{MES[mo]} {y}</b><span><button className="sq" aria-label="Mes anterior" onClick={()=>setCur(new Date(y,mo-1,1))}>‹</button><button className="sq" aria-label="Mes siguiente" onClick={()=>setCur(new Date(y,mo+1,1))}>›</button></span></div>
   <div className="cal">{DIAS.map(d=><i key={d}>{d}</i>)}{cells.map((d,i)=>d
    ?<button key={i} disabled={dis(d)} className={'day'+(key(d)===date?' on':'')+(key(d)===today?' today':'')} onClick={()=>setDate(key(d))}>{d}</button>:<span key={i}/>)}</div>
   {date&&<><h3>{new Date(date+'T00:00').toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3>
    <div className="slots">{slots.map(s=><button key={s} disabled={busy.has(s)||past(s)} className={'slot'+(slot===s?' on':'')} onClick={()=>setSlot(s)}>{h12(s)}</button>)}</div>
    {!slots.length&&<p className="empty">Este médico no atiende ese día.</p>}</>}
   <h3>Motivo de consulta</h3>
   <textarea maxLength={300} value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Cuéntale al médico tus síntomas (opcional)"/>
   <button className="btn" style={{width:'100%',justifyContent:'center'}} disabled={!sel||!date||!slot} onClick={book}>Confirmar cita</button></section>
  <section><div className="lh"><h2>Médicos</h2><div><input type="search" placeholder="Buscar médico" aria-label="Buscar médico" value={q} onChange={e=>setQ(e.target.value)}/>
   <select aria-label="Filtrar por especialidad" value={esp} onChange={e=>setEsp(e.target.value)}><option value="">Todas las especialidades</option>{ESP.map(s=><option key={s}>{s}</option>)}</select></div></div>
   <div className="docs">{list.map(m=><article key={m.id} className={'doc'+(m.id===sel?' on':'')} onClick={()=>pick(m.id)}>
    <div className="dtop"><Avatar o={m} size={64}/><div><h3>Dr. {full(m)}</h3><p><Icon n="med"/>{m.especialidad}</p>
     <p><Icon n="cal"/>{[...new Set(hs.filter(h=>h.medico_id===m.id).map(h=>h.dia))].sort().map(d=>DIAS[d]).join(', ')}</p></div></div>
    <button className={'btn'+(m.id===sel?'':' ghost')} style={{width:'100%',justifyContent:'center'}} onClick={e=>{e.stopPropagation();pick(m.id)}}>{m.id===sel?'Seleccionado':'Reservar con este médico'}</button></article>)}</div>
   {!list.length&&<Empty>No hay médicos que coincidan con la búsqueda.</Empty>}</section>
  <aside className="card det"><h2 style={{marginBottom:14}}>Detalle del médico</h2>
   {doc?<><Avatar o={doc} size={110} sq/><h3 style={{margin:'12px 0 2px'}}>Dr. {full(doc)}</h3><p className="sub" style={{margin:0}}>{doc.especialidad}</p>
    <h3 style={{textAlign:'left',margin:'16px 0 4px'}}>Horario de atención</h3>
    <ul>{dh.map(h=><li key={h.id}><b>{DIAS[h.dia]}</b> · {hhmm(h.hora_inicio)} a {hhmm(h.hora_fin)}<br/><small>{Math.floor((toMin(h.hora_fin)-toMin(h.hora_inicio))/30)} franjas de 30 min</small></li>)}</ul></>
   :<Empty>Selecciona un médico para ver su horario.</Empty>}</aside></div>}

export default function Citas(){
 const{session,profile}=useAuth(),rol=profile.rol,[rows,setRows]=useState([])
 const load=useCallback(async()=>{
  const{data,error}=await supabase.from('citas').select('*').order('fecha').order('hora')
  if(error)notify(error.message,'err');else setRows(rol==='medico'?data.filter(c=>c.estado!=='cancelada'):data)},[rol])
 useEffect(()=>{load()},[load])
 const setEst=async(id,estado,msg)=>{const{error}=await supabase.from('citas').update({estado}).eq('id',id);error?notify(error.message,'err'):(notify(msg),load())}
 const cancel=id=>window.confirm('¿Cancelar esta cita? La franja quedará libre.')&&setEst(id,'cancelada','Cita cancelada correctamente.')
 return <>{rol==='paciente'&&<Agendar uid={session.user.id} onDone={load}/>}
  <div className="card tw">{rol==='paciente'&&<h2 style={{marginBottom:8}}>Mis citas</h2>}
   {rows.length?<table><thead><tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Médico</th><th>Motivo</th><th>Estado</th><th></th></tr></thead><tbody>
    {rows.map(c=><tr key={c.id}><td>{c.fecha}</td><td>{hhmm(c.hora)}</td><td>{full(c.pacientes)}</td><td>Dr. {full(c.medicos)} · {c.medicos?.especialidad}</td><td>{c.motivo||'—'}</td>
     <td><span className={'pill '+EST[c.estado][1]}>{EST[c.estado][0]}</span></td>
     <td>{c.estado==='programada'&&(rol==='medico'
      ?<><button className="btn ghost sm" onClick={()=>setEst(c.id,'atendida','Cita marcada como atendida.')}>Atendida</button> <button className="btn ghost sm" onClick={()=>setEst(c.id,'inasistencia','Cita marcada como inasistencia.')}>Inasistencia</button></>
      :<button className="btn ghost sm" onClick={()=>cancel(c.id)}>Cancelar</button>)}</td></tr>)}</tbody></table>
   :<Empty>No hay citas registradas todavía.</Empty>}</div></>}
