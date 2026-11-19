import {useState} from 'react'
import {Link,Navigate} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {useAuth} from '../auth'
import {Field,AuthShell,rx} from '../components/ui'
import {notify} from '../components/Toasts'
export default function Login(){
 const{session,profile}=useAuth()
 const[e,setE]=useState({}),[show,setShow]=useState(false),[busy,setBusy]=useState(false)
 if(session&&profile)return <Navigate to="/" replace/>
 const fill=u=>{const f=document.querySelector('form');f.elements.email.value=u+'@medicitas.co';f.elements.pass.value='Demo1234'}
 const submit=async ev=>{ev.preventDefault()
  const d=Object.fromEntries(new FormData(ev.target)),er={}
  if(!rx.mail.test(d.email.trim()))er.email='Escribe un correo con la forma nombre@dominio.com.'
  if(!d.pass)er.pass='Escribe tu contraseña.'
  setE(er);if(Object.keys(er).length)return
  setBusy(true)
  const{error}=await supabase.auth.signInWithPassword({email:d.email.trim().toLowerCase(),password:d.pass})
  setBusy(false)
  if(error)setE({form:'Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.'});else notify('Inicio de sesión exitoso.')}
 return <AuthShell><h2 style={{marginBottom:14}}>Iniciar sesión</h2>
  <form onSubmit={submit} noValidate>
   <Field label="Correo electrónico" name="email" type="email" autoComplete="email" err={e.email}/>
   <label>Contraseña<span className="pw"><input name="pass" type={show?'text':'password'} autoComplete="current-password" aria-invalid={e.pass?'true':undefined}/>
    <button type="button" onClick={()=>setShow(!show)}>{show?'Ocultar':'Mostrar'}</button></span><span className="err">{e.pass}</span></label>
   <span className="err" role="alert">{e.form}</span>
   <button className="btn" disabled={busy} style={{width:'100%',justifyContent:'center'}}>{busy?'Ingresando…':'Iniciar sesión'}</button></form>
  <div className="note"><b>Demo local.</b> Los datos se guardan solo en este navegador. Entra como:<br/>{[['admin','Administrador'],['recepcion','Recepcionista'],['medico','Médico'],['paciente','Paciente']].map(([u,l])=><button key={u} type="button" className="btn ghost sm" style={{margin:'4px 4px 0 0'}} onClick={()=>fill(u)}>{l}</button>)}</div>
  <p>¿Eres paciente nuevo? <Link to="/registro">Crea tu cuenta</Link></p></AuthShell>}
