import {useEffect,useState} from 'react'
import {Routes,Route,Navigate,NavLink,Outlet,useLocation} from 'react-router-dom'
import {AuthProvider,useAuth} from './auth'
import {Toasts,notify} from './components/Toasts'
import {ROL,Icon,Avatar} from './components/ui'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Pacientes from './pages/Pacientes'
import Medicos from './pages/Medicos'
import Horarios from './pages/Horarios'
import Citas from './pages/Citas'
import Perfil from './pages/Perfil'

const NAV={
 paciente:[['/','Panel principal'],['/citas','Mis citas'],['/perfil','Mi perfil']],
 medico:[['/','Panel principal'],['/citas','Mi agenda'],['/horarios','Mis horarios'],['/perfil','Mi perfil']],
 recepcion:[['/','Panel principal'],['/citas','Citas'],['/pacientes','Pacientes']],
 admin:[['/','Panel principal'],['/citas','Citas'],['/pacientes','Pacientes'],['/medicos','Médicos'],['/horarios','Horarios']]}
const ICO={'/':'home','/citas':'cal','/perfil':'user','/horarios':'clock','/pacientes':'users','/medicos':'med'}

function Theme(){
 const[t,setT]=useState(localStorage.getItem('mc_theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))
 useEffect(()=>{document.documentElement.dataset.theme=t;localStorage.setItem('mc_theme',t)},[t])
 return <div className="seg" role="group" aria-label="Tema">{['light','dark'].map(k=>
  <button key={k} className={t===k?'on':''} aria-pressed={t===k} aria-label={k==='light'?'Tema claro':'Tema oscuro'} onClick={()=>setT(k)}><Icon n={k==='light'?'sun':'moon'}/></button>)}</div>}

function Guard({roles}){
 const{session,profile,loading,signOut}=useAuth(),{pathname}=useLocation(),[open,setOpen]=useState(false)
 const ok=!roles||(profile&&roles.includes(profile.rol))
 useEffect(()=>{if(profile&&!ok)notify('Acceso no autorizado: tu rol no puede abrir esta sección.','err')},[profile,ok])
 if(loading)return <div className="empty">Cargando…</div>
 if(!session||!profile)return <Navigate to="/login" replace/>
 const[n1,n2='']=profile.nombre.split(' '),title=NAV[profile.rol].find(([to])=>to===pathname)?.[1]
 return <div className="shell">
  <aside className={open?'open':''}>
   <div className="brand"><span className="logo"><Icon n="med"/></span><span className="bt">MediCitas</span></div>
   <nav aria-label="Principal">{NAV[profile.rol].map(([to,l])=><NavLink key={to} to={to} end={to==='/'} title={l}><Icon n={ICO[to]}/><span>{l}</span></NavLink>)}
    <button className="link" onClick={signOut} title="Cerrar sesión"><Icon n="out"/><span>Cerrar sesión</span></button></nav>
   <button className="rail-t" onClick={()=>setOpen(!open)} aria-label={open?'Contraer menú':'Expandir menú'}>{open?'‹':'›'}</button></aside>
  <main><div className="top"><h1>{ok?title:'Acceso no autorizado'}</h1>
   <div className="tools"><Theme/><div className="who"><Avatar o={{nombres:n1,apellidos:n2}} size={38}/><span><b>{profile.nombre}</b><small>{ROL[profile.rol]}</small></span></div></div></div>
   {ok?<Outlet/>:<div className="card"><h2>No tienes permiso para entrar aquí</h2><p>Esta sección no está disponible para el rol {ROL[profile.rol]}. El acceso también se valida al escribir la dirección en el navegador.</p></div>}
  </main></div>}

export default function App(){
 return <AuthProvider><Toasts/><Routes>
  <Route path="/login" element={<Login/>}/><Route path="/registro" element={<Register/>}/>
  <Route element={<Guard/>}><Route path="/" element={<Home/>}/><Route path="/citas" element={<Citas/>}/><Route path="/perfil" element={<Perfil/>}/></Route>
  <Route element={<Guard roles={['medico','admin']}/>}><Route path="/horarios" element={<Horarios/>}/></Route>
  <Route element={<Guard roles={['recepcion','admin']}/>}><Route path="/pacientes" element={<Pacientes/>}/></Route>
  <Route element={<Guard roles={['admin']}/>}><Route path="/medicos" element={<Medicos/>}/></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/></Routes></AuthProvider>}
