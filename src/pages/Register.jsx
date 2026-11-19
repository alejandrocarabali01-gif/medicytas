import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {Field,AuthShell,rx} from '../components/ui'
import {notify} from '../components/Toasts'
export default function Register(){
 const nav=useNavigate(),[e,setE]=useState({}),[busy,setBusy]=useState(false)
 const submit=async ev=>{ev.preventDefault()
  const d=Object.fromEntries(new FormData(ev.target)),er={}
  if(!rx.name.test(d.nombres.trim()))er.nombres='Escribe los nombres usando solo letras (mínimo 2).'
  if(!rx.name.test(d.apellidos.trim()))er.apellidos='Escribe los apellidos usando solo letras (mínimo 2).'
  if(!rx.doc.test(d.documento.trim()))er.documento='El documento debe tener entre 5 y 12 dígitos, sin puntos ni espacios.'
  if(!rx.tel.test(d.telefono.trim()))er.telefono='Escribe 10 dígitos que empiecen por 3, por ejemplo 3001234567.'
  if(!rx.mail.test(d.email.trim()))er.email='El correo debe tener la forma nombre@dominio.com. Revisa que incluya @ y un dominio.'
  if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(d.pass))er.pass='Usa mínimo 8 caracteres e incluye letras y números.'
  if(d.pass2!==d.pass)er.pass2='Las contraseñas no coinciden.'
  if(!er.documento){const{data}=await supabase.rpc('documento_existe',{d:d.documento.trim()});if(data)er.documento='Ya existe un paciente con este documento.'}
  setE(er);if(Object.keys(er).length)return notify('Revisa los campos marcados en rojo.','err')
  setBusy(true)
  const{error}=await supabase.auth.signUp({email:d.email.trim().toLowerCase(),password:d.pass,
   options:{data:{nombres:d.nombres.trim(),apellidos:d.apellidos.trim(),tipo_doc:d.tipo_doc,documento:d.documento.trim(),telefono:d.telefono.trim()}}})
  setBusy(false)
  if(error)return setE({form:/already|registered/i.test(error.message)?'Este correo ya está registrado. Inicia sesión.':'No se pudo completar el registro: '+error.message})
  await supabase.auth.signOut()
  notify('Paciente registrado correctamente. Ya puedes iniciar sesión.');nav('/login')}
 return <AuthShell><h2 style={{marginBottom:14}}>Crear cuenta de paciente</h2>
  <form onSubmit={submit} noValidate>
   <div className="cols"><Field label="Nombres" name="nombres" err={e.nombres}/><Field label="Apellidos" name="apellidos" err={e.apellidos}/></div>
   <div className="cols"><label>Tipo de documento<select name="tipo_doc"><option>CC</option><option>TI</option><option>CE</option><option>Pasaporte</option></select></label>
    <Field label="Número de documento" name="documento" inputMode="numeric" err={e.documento}/></div>
   <Field label="Teléfono celular" name="telefono" type="tel" err={e.telefono}/>
   <Field label="Correo electrónico" name="email" type="email" err={e.email}/>
   <div className="cols"><Field label="Contraseña" name="pass" type="password" err={e.pass}/><Field label="Confirmar contraseña" name="pass2" type="password" err={e.pass2}/></div>
   <span className="err" role="alert">{e.form}</span>
   <button className="btn" disabled={busy} style={{width:'100%',justifyContent:'center'}}>{busy?'Registrando…':'Registrarse'}</button></form>
  <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p></AuthShell>}
