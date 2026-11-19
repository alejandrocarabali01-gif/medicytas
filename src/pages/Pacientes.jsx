import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
import {Field,Modal,Empty,rx,full} from '../components/ui'
import {notify} from '../components/Toasts'
export default function Pacientes(){
 const[rows,setRows]=useState([]),[q,setQ]=useState(''),[m,setM]=useState(null),[e,setE]=useState({})
 const load=async()=>{const{data,error}=await supabase.from('pacientes').select('*').order('apellidos');error?notify(error.message,'err'):setRows(data)}
 useEffect(()=>{load()},[])
 const t=q.toLowerCase().trim(),l=rows.filter(p=>!t||full(p).toLowerCase().includes(t)||p.documento.includes(t))
 const open=p=>{setE({});setM(p||{})}
 const save=async ev=>{ev.preventDefault()
  const d=Object.fromEntries(new FormData(ev.target)),er={},mail=d.email.trim().toLowerCase()
  if(!rx.name.test(d.nombres.trim()))er.nombres='Escribe los nombres usando solo letras.'
  if(!rx.name.test(d.apellidos.trim()))er.apellidos='Escribe los apellidos usando solo letras.'
  if(!rx.doc.test(d.documento.trim()))er.documento='El documento debe tener entre 5 y 12 dígitos.'
  else if(rows.some(p=>p.documento===d.documento.trim()&&p.id!==m.id))er.documento='Ya existe un paciente con este documento.'
  if(!rx.tel.test(d.telefono.trim()))er.telefono='Escribe 10 dígitos que empiecen por 3.'
  if(mail&&!rx.mail.test(mail))er.email='El correo debe tener la forma nombre@dominio.com.'
  setE(er);if(Object.keys(er).length)return notify('Revisa los campos marcados en rojo.','err')
  const row={nombres:d.nombres.trim(),apellidos:d.apellidos.trim(),tipo_doc:d.tipo_doc,documento:d.documento.trim(),telefono:d.telefono.trim(),email:mail||null}
  const{error}=m.id?await supabase.from('pacientes').update(row).eq('id',m.id):await supabase.from('pacientes').insert(row)
  if(error)return notify(error.code==='23505'?'Ya existe un paciente con ese documento o correo.':error.message,'err')
  notify(m.id?'Paciente actualizado correctamente.':'Paciente registrado correctamente.');setM(null);load()}
 return <>
  <div className="bar"><input type="search" placeholder="Buscar por nombre o documento" aria-label="Buscar pacientes" value={q} onChange={x=>setQ(x.target.value)}/>
   <button className="btn" onClick={()=>open()}>Registrar paciente</button></div>
  <div className="card tw">{l.length?<table><thead><tr><th>Paciente</th><th>Documento</th><th>Teléfono</th><th>Correo</th><th>Cuenta</th><th></th></tr></thead><tbody>
   {l.map(p=><tr key={p.id}><td>{full(p)}</td><td>{p.tipo_doc} {p.documento}</td><td>{p.telefono}</td><td>{p.email||'—'}</td>
    <td><span className={'pill '+(p.user_id?'ok':'off')}>{p.user_id?'Con cuenta':'Sin cuenta'}</span></td>
    <td><button className="btn ghost sm" onClick={()=>open(p)}>Ver y editar</button></td></tr>)}</tbody></table>
   :<Empty>{q?`No encontramos pacientes con “${q}”. Prueba con otro nombre o documento.`:'Aún no hay pacientes registrados.'}</Empty>}</div>
  {m&&<Modal title={m.id?'Datos del paciente':'Registrar paciente'} onClose={()=>setM(null)}>
   <form onSubmit={save} noValidate>
    <div className="cols"><Field label="Nombres" name="nombres" defaultValue={m.nombres} err={e.nombres}/><Field label="Apellidos" name="apellidos" defaultValue={m.apellidos} err={e.apellidos}/></div>
    <div className="cols"><label>Tipo de documento<select name="tipo_doc" defaultValue={m.tipo_doc||'CC'}><option>CC</option><option>TI</option><option>CE</option><option>Pasaporte</option></select></label>
     <Field label="Número de documento" name="documento" defaultValue={m.documento} err={e.documento}/></div>
    <div className="cols"><Field label="Teléfono celular" name="telefono" defaultValue={m.telefono} err={e.telefono}/><Field label="Correo (opcional)" name="email" defaultValue={m.email} err={e.email}/></div>
    <div className="acts"><button type="button" className="btn ghost" onClick={()=>setM(null)}>Cancelar</button><button className="btn">{m.id?'Guardar cambios':'Registrar paciente'}</button></div></form></Modal>}</>}
