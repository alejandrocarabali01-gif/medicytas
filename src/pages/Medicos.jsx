import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
import {Field,Modal,Empty,rx,full,ESP} from '../components/ui'
import {notify} from '../components/Toasts'
export default function Medicos(){
 const[rows,setRows]=useState([]),[open,setOpen]=useState(false),[e,setE]=useState({})
 const load=async()=>{const{data,error}=await supabase.from('medicos').select('*').order('apellidos');error?notify(error.message,'err'):setRows(data)}
 useEffect(()=>{load()},[])
 const save=async ev=>{ev.preventDefault()
  const d=Object.fromEntries(new FormData(ev.target)),er={},mail=d.email.trim().toLowerCase()
  if(!rx.name.test(d.nombres.trim()))er.nombres='Escribe los nombres usando solo letras.'
  if(!rx.name.test(d.apellidos.trim()))er.apellidos='Escribe los apellidos usando solo letras.'
  if(!rx.tel.test(d.telefono.trim()))er.telefono='Escribe 10 dígitos que empiecen por 3.'
  if(!rx.mail.test(mail))er.email='El correo debe tener la forma nombre@dominio.com.'
  else if(rows.some(x=>x.email===mail))er.email='Este correo ya pertenece a otro médico.'
  if(!d.especialidad)er.especialidad='Selecciona la especialidad del médico.'
  setE(er);if(Object.keys(er).length)return notify('Revisa los campos marcados en rojo.','err')
  const{error}=await supabase.from('medicos').insert({nombres:d.nombres.trim(),apellidos:d.apellidos.trim(),telefono:d.telefono.trim(),email:mail,especialidad:d.especialidad})
  if(error)return notify(error.message,'err')
  notify('Médico registrado correctamente.');setOpen(false);load()}
 const toggle=async m=>{
  if(m.activo&&!window.confirm(`¿Desactivar al Dr. ${full(m)}? No aparecerá al configurar horarios ni al agendar.`))return
  const{error}=await supabase.from('medicos').update({activo:!m.activo}).eq('id',m.id)
  if(error)return notify(error.message,'err')
  notify(m.activo?'Médico desactivado correctamente.':'Médico activado correctamente.');load()}
 return <>
  <div className="bar"><button className="btn" onClick={()=>{setE({});setOpen(true)}}>Registrar médico</button></div>
  <div className="card tw">{rows.length?<table><thead><tr><th>Médico</th><th>Especialidad</th><th>Correo</th><th>Teléfono</th><th>Estado</th><th></th></tr></thead><tbody>
   {rows.map(m=><tr key={m.id}><td>{full(m)}</td><td>{m.especialidad}</td><td>{m.email}</td><td>{m.telefono}</td>
    <td><span className={'pill '+(m.activo?'ok':'off')}>{m.activo?'Activo':'Inactivo'}</span></td>
    <td><button className="btn ghost sm" onClick={()=>toggle(m)}>{m.activo?'Desactivar':'Activar'}</button></td></tr>)}</tbody></table>
   :<Empty>Aún no hay médicos. Registra el primero.</Empty>}</div>
  {open&&<Modal title="Registrar médico" onClose={()=>setOpen(false)}><form onSubmit={save} noValidate>
   <div className="cols"><Field label="Nombres" name="nombres" err={e.nombres}/><Field label="Apellidos" name="apellidos" err={e.apellidos}/></div>
   <div className="cols"><Field label="Teléfono celular" name="telefono" err={e.telefono}/><Field label="Correo electrónico" name="email" type="email" err={e.email}/></div>
   <label>Especialidad<select name="especialidad" defaultValue=""><option value="">Selecciona una especialidad</option>{ESP.map(s=><option key={s}>{s}</option>)}</select><span className="err">{e.especialidad}</span></label>
   <div className="acts"><button type="button" className="btn ghost" onClick={()=>setOpen(false)}>Cancelar</button><button className="btn">Registrar médico</button></div></form></Modal>}</>}
