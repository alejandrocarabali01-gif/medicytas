import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
import {useAuth} from '../auth'
import {Field,rx,ROL} from '../components/ui'
import {notify} from '../components/Toasts'
export default function Perfil(){
 const{session,profile}=useAuth(),[p,setP]=useState(null),[e,setE]=useState({})
 useEffect(()=>{if(profile.rol==='paciente')supabase.from('pacientes').select('*').eq('user_id',session.user.id).maybeSingle().then(({data})=>setP(data))},[profile.rol,session.user.id])
 if(profile.rol!=='paciente')return <div className="card"><h2>{profile.nombre}</h2><p>Correo: {session.user.email}<br/>Rol: {ROL[profile.rol]}</p></div>
 if(!p)return <div className="empty">Cargando…</div>
 const save=async ev=>{ev.preventDefault()
  const d=Object.fromEntries(new FormData(ev.target)),er={}
  if(!rx.name.test(d.nombres.trim()))er.nombres='Escribe los nombres usando solo letras.'
  if(!rx.name.test(d.apellidos.trim()))er.apellidos='Escribe los apellidos usando solo letras.'
  if(!rx.tel.test(d.telefono.trim()))er.telefono='Escribe 10 dígitos que empiecen por 3.'
  setE(er);if(Object.keys(er).length)return notify('Revisa los campos marcados en rojo.','err')
  const{error}=await supabase.from('pacientes').update({nombres:d.nombres.trim(),apellidos:d.apellidos.trim(),telefono:d.telefono.trim()}).eq('id',p.id)
  error?notify(error.message,'err'):notify('Perfil actualizado correctamente.')}
 return <div className="card"><form onSubmit={save} noValidate>
  <div className="cols"><Field label="Nombres" name="nombres" defaultValue={p.nombres} err={e.nombres}/><Field label="Apellidos" name="apellidos" defaultValue={p.apellidos} err={e.apellidos}/></div>
  <div className="cols"><Field label={`Documento (${p.tipo_doc})`} defaultValue={p.documento} readOnly/><Field label="Correo" defaultValue={p.email} readOnly/></div>
  <Field label="Teléfono celular" name="telefono" defaultValue={p.telefono} err={e.telefono}/>
  <div className="acts"><button className="btn">Guardar cambios</button></div></form></div>}
