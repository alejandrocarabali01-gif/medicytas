import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {useAuth} from '../auth'
import {ROL,full,hhmm,DIAS} from '../components/ui'
const Count=({n})=>{const[v,setV]=useState(0)
 useEffect(()=>{let s,id;const f=t=>{s??=t;const p=Math.min((t-s)/700,1);setV(Math.round(n*p));if(p<1)id=requestAnimationFrame(f)};id=requestAnimationFrame(f);return()=>cancelAnimationFrame(id)},[n])
 return v}
export default function Home(){
 const{profile}=useAuth(),r=profile.rol,[d,setD]=useState(null),today=new Date().toLocaleDateString('en-CA')
 useEffect(()=>{(async()=>{const g=t=>supabase.from(t).select('*')
  const[c,p,m,h]=await Promise.all(['citas','pacientes','medicos','horarios'].map(g))
  setD({c:c.data||[],p:p.data||[],m:m.data||[],h:h.data||[]})})()},[])
 if(!d)return <div className="empty">Cargando…</div>
 const prog=d.c.filter(c=>c.estado==='programada').sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora)),up=prog.filter(c=>c.fecha>=today)
 const stats={admin:[['Pacientes',d.p.length],['Médicos activos',d.m.filter(x=>x.activo).length],['Horarios',d.h.length],['Citas programadas',prog.length]],
  recepcion:[['Pacientes',d.p.length],['Citas programadas',prog.length],['Citas hoy',prog.filter(c=>c.fecha===today).length]],
  medico:[['Citas programadas',prog.length],['Citas hoy',prog.filter(c=>c.fecha===today).length],['Atendidas',d.c.filter(c=>c.estado==='atendida').length]],
  paciente:[['Citas programadas',prog.length],['Médicos disponibles',d.m.filter(x=>x.activo).length]]}[r]
 const days=[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()+i);const k=x.toLocaleDateString('en-CA');return{l:DIAS[(x.getDay()+6)%7],n:prog.filter(c=>c.fecha===k).length}}),mx=Math.max(1,...days.map(x=>x.n))
 const hr=new Date().getHours(),sal=hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches'
 return <>
  <div className="card hero-card" style={{marginBottom:16}}><h2 style={{fontSize:'1.6rem'}}>{sal}, {profile.nombre.split(' ')[0]}</h2>
   <p style={{margin:'6px 0 14px',opacity:.9}}>{new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})} · {ROL[r]}</p>
   <Link className="btn light" to="/citas">{r==='paciente'?'Agendar una cita':r==='medico'?'Ver mi agenda':'Ver citas'}</Link></div>
  <div className="grid">{stats.map(([l,n],i)=><div className="card stat" key={l} style={{animationDelay:i*80+'ms'}}><b><Count n={n}/></b><span>{l}</span></div>)}</div>
  <div className="two"><div className="card"><h2 style={{marginBottom:12}}>Próximas citas</h2>
   {up.length?up.slice(0,5).map(c=><div className="item" key={c.id}><div className="when"><b>{c.fecha.slice(5)}</b><span>{hhmm(c.hora)}</span></div>
    <div><b>{r==='paciente'?'Dr. '+full(c.medicos):full(c.pacientes)}</b><br/><small>{r==='paciente'?c.medicos?.especialidad:'Dr. '+full(c.medicos)+' · '+c.medicos?.especialidad}</small></div></div>)
   :<p className="empty">No hay citas próximas.</p>}</div>
  <div className="card"><h2 style={{marginBottom:12}}>Citas de los próximos 7 días</h2>
   <div className="bars">{days.map((x,i)=><div key={i}><i style={{height:x.n/mx*100+'px',animationDelay:i*70+'ms'}}/>{x.n}<br/>{x.l}</div>)}</div></div></div></>}
