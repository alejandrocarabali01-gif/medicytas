import {useEffect,useState} from 'react'
const ev=new EventTarget()
export const notify=(msg,kind='ok')=>ev.dispatchEvent(new CustomEvent('t',{detail:{msg,kind,id:Math.random()}}))
export function Toasts(){
 const[l,setL]=useState([])
 useEffect(()=>{const h=e=>{setL(x=>[...x,e.detail]);setTimeout(()=>setL(x=>x.filter(t=>t.id!==e.detail.id)),4500)}
  ev.addEventListener('t',h);return()=>ev.removeEventListener('t',h)},[])
 return <div id="toasts" role="status" aria-live="polite">{l.map(t=><div key={t.id} className={'t '+t.kind}>{t.msg}</div>)}</div>}
