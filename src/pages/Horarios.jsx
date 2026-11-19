import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
import {useAuth} from '../auth'
import {Field,Empty,full,hhmm,toMin,fmt,DIAS} from '../components/ui'
import {notify} from '../components/Toasts'
export default function Horarios(){
 const{session,profile}=useAuth(),adm=profile.rol==='admin'
 const[meds,setMeds]=useState([]),[hs,setHs]=useState([]),[e,setE]=useState({})
 const load=async()=>{
  const[a,b]=await Promise.all([supabase.from('medicos').select('*'),supabase.from('horarios').select('*').order('dia').order('hora_inicio')])
  setMeds(a.data||[]);setHs(b.data||[])}
 useEffect(()=>{load()},[])
 const mine=meds.find(m=>m.user_id===session.user.id)
 const list=hs.filter(h=>adm||h.medico_id===mine?.id)
 const save=async ev=>{ev.preventDefault()
  const f=new FormData(ev.target),d=Object.fromEntries(f),dias=f.getAll('dias').map(Number),er={}
  if(!d.medico_id)er.medico_id='Selecciona un médico.'
  if(!dias.length)er.dias='Marca al menos un día de atención.'
  if(!d.ini)er.ini='Indica la hora de inicio.'
  if(!d.fin)er.fin='Indica la hora de finalización.'
  else if(d.ini&&toMin(d.fin)<=toMin(d.ini))er.fin='La hora de finalización debe ser posterior a la de inicio.'
  setE(er);if(Object.keys(er).length)return notify('Revisa los campos marcados en rojo.','err')
  const{error}=await supabase.from('horarios').insert(dias.map(dia=>({medico_id:d.medico_id,dia,hora_inicio:d.ini,hora_fin:d.fin})))
  if(error)return setE({dias:error.message})
  notify('Horario guardado correctamente.');ev.target.reset();load()}
 const del=async id=>{if(!window.confirm('¿Eliminar este horario? Las franjas que genera dejarán de estar disponibles.'))return
  const{error}=await supabase.from('horarios').delete().eq('id',id);error?notify(error.message,'err'):(notify('Horario eliminado correctamente.'),load())}
 const mn=id=>{const m=meds.find(x=>x.id===id);return m?'Dr. '+full(m):'—'}
 return <>
  {adm&&<div className="card" style={{marginBottom:16}}><h2 style={{marginBottom:12}}>Configurar horario de atención</h2>
   <form onSubmit={save} noValidate>
    <label>Médico<select name="medico_id" defaultValue=""><option value="">Selecciona un médico</option>
     {meds.filter(m=>m.activo).map(m=><option key={m.id} value={m.id}>{full(m)} · {m.especialidad}</option>)}</select><span className="err">{e.medico_id}</span></label>
    <b style={{fontSize:'.9rem'}}>Días de atención</b>
    <div className="days">{DIAS.map((d,i)=><label key={d}><input type="checkbox" name="dias" value={i}/>{d}</label>)}</div><span className="err">{e.dias}</span>
    <div className="cols"><Field label="Hora de inicio" name="ini" type="time" defaultValue="08:00" err={e.ini}/><Field label="Hora de finalización" name="fin" type="time" defaultValue="12:00" err={e.fin}/></div>
    <div className="acts"><button className="btn">Guardar horario</button></div></form></div>}
  <div className="card tw">{list.length?<table><thead><tr><th>Médico</th><th>Día</th><th>Horario</th><th>Franjas</th>{adm&&<th></th>}</tr></thead><tbody>
   {list.map(h=>{const n=Math.floor((toMin(h.hora_fin)-toMin(h.hora_inicio))/30)
    return <tr key={h.id}><td>{mn(h.medico_id)}</td><td>{DIAS[h.dia]}</td><td>{hhmm(h.hora_inicio)} a {hhmm(h.hora_fin)}</td><td>{n} (cada 30 min, hasta {fmt(toMin(h.hora_fin)-30)})</td>
     {adm&&<td><button className="btn ghost sm" onClick={()=>del(h.id)}>Eliminar</button></td>}</tr>})}</tbody></table>
   :<Empty>No hay horarios configurados todavía.</Empty>}</div></>}
