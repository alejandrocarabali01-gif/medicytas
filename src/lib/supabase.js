// Base de datos local (localStorage) con la misma interfaz que usan las páginas.
// Simula las reglas de la base de datos real: duplicados, cruces, horarios y permisos por rol.
const K='mc_local_v1',uid=()=>crypto.randomUUID?.()||Math.random().toString(36).slice(2)
const toMin=t=>{const[a,b]=String(t).split(':');return +a*60+ +b}
const sha=async p=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('mc$'+p)))].map(b=>b.toString(16).padStart(2,'0')).join('')
const ymd=d=>d.toLocaleDateString('en-CA'),err=(message,code)=>({data:null,error:{message,code}})
const listeners=new Set();let db,sess=null
const save=()=>localStorage.setItem(K,JSON.stringify(db))
const ready=(async()=>{
 try{db=JSON.parse(localStorage.getItem(K))}catch{}
 if(!db){const h=await sha('Demo1234'),d=new Date();do{d.setDate(d.getDate()+1)}while([0,6].includes(d.getDay()))
  db={users:[['u1','admin'],['u2','recepcion'],['u3','medico'],['u4','paciente']].map(([id,n])=>({id,email:n+'@medicitas.co',hash:h})),
   profiles:[{id:'u1',nombre:'Laura Ríos',rol:'admin'},{id:'u2',nombre:'Camilo Duarte',rol:'recepcion'},{id:'u3',nombre:'Andrea Vélez',rol:'medico'},{id:'u4',nombre:'Mateo Gómez',rol:'paciente'}],
   pacientes:[{id:'p1',user_id:'u4',nombres:'Mateo',apellidos:'Gómez',tipo_doc:'CC',documento:'1020304050',telefono:'3001112233',email:'paciente@medicitas.co'},{id:'p2',user_id:null,nombres:'Sofía',apellidos:'Herrera',tipo_doc:'CC',documento:'52345678',telefono:'3105556677',email:null}],
   medicos:[{id:'m1',user_id:'u3',nombres:'Andrea',apellidos:'Vélez',telefono:'3201234567',email:'medico@medicitas.co',especialidad:'Medicina general',activo:true},{id:'m2',user_id:null,nombres:'Julián',apellidos:'Castro',telefono:'3159876543',email:'jcastro@medicitas.co',especialidad:'Cardiología',activo:true}],
   horarios:[{id:'h1',medico_id:'m1',dia:0,hora_inicio:'08:00',hora_fin:'12:00'},{id:'h2',medico_id:'m1',dia:1,hora_inicio:'08:00',hora_fin:'12:00'},{id:'h3',medico_id:'m1',dia:2,hora_inicio:'08:00',hora_fin:'12:00'},...[0,1,2,3,4].map(i=>({id:'k'+i,medico_id:'m2',dia:i,hora_inicio:'09:00',hora_fin:'13:00'}))],
   citas:[{id:'c1',paciente_id:'p1',medico_id:'m2',fecha:ymd(d),hora:'09:00',estado:'programada'}]};save()}
 const u=db.users.find(x=>x.id===localStorage.getItem(K+'s'));sess=u?{user:{id:u.id,email:u.email}}:null})()
const setSess=u=>{sess=u?{user:{id:u.id,email:u.email}}:null;u?localStorage.setItem(K+'s',u.id):localStorage.removeItem(K+'s');listeners.forEach(cb=>cb(u?'SIGNED_IN':'SIGNED_OUT',sess))}
const me=()=>db.profiles.find(p=>p.id===sess?.user.id),myP=()=>db.pacientes.find(x=>x.user_id===sess?.user.id)?.id,myM=()=>db.medicos.find(x=>x.user_id===sess?.user.id)?.id
const DUP='duplicate key value violates unique constraint'
function rules(t,op,r,old){
 if(t==='pacientes'&&db.pacientes.some(p=>p.id!==old?.id&&((r.documento&&p.documento===r.documento)||(r.email&&p.email===r.email))))return err(DUP,'23505')
 if(t==='medicos'){
  if(op==='insert'&&db.medicos.some(m=>m.email===r.email))return err(DUP,'23505')
  if(op==='update'&&old.activo&&r.activo===false&&db.citas.some(c=>c.medico_id===old.id&&c.estado==='programada'))return err('El médico tiene citas programadas. Reasígnalas o cancélalas antes de desactivarlo.','P0001')}
 if(t==='horarios'&&op==='insert'){
  if(toMin(r.hora_fin)<=toMin(r.hora_inicio))return err('La hora de finalización debe ser posterior a la de inicio.','23514')
  if(db.horarios.some(h=>h.medico_id===r.medico_id&&h.dia===r.dia&&toMin(r.hora_inicio)<toMin(h.hora_fin)&&toMin(r.hora_fin)>toMin(h.hora_inicio)))return err('El médico ya tiene un horario que se cruza ese día.','P0001')}
 if(t==='citas'){const rol=me()?.rol
  if(op==='insert'){
   if(rol==='paciente'&&r.paciente_id!==myP())return err('No autorizado.','42501')
   if(r.fecha<ymd(new Date()))return err('No se pueden agendar citas en fechas pasadas.','P0001')
   const dow=(new Date(r.fecha+'T00:00').getDay()+6)%7,m=db.medicos.find(x=>x.id===r.medico_id),t0=toMin(r.hora)
   if(!m?.activo||!db.horarios.some(h=>h.medico_id===r.medico_id&&h.dia===dow&&t0>=toMin(h.hora_inicio)&&t0+30<=toMin(h.hora_fin)&&(t0-toMin(h.hora_inicio))%30===0))return err('La franja no está disponible para este médico.','P0001')
   if(db.citas.some(c=>c.estado!=='cancelada'&&c.fecha===r.fecha&&c.hora.slice(0,5)===r.hora.slice(0,5)&&(c.medico_id===r.medico_id||c.paciente_id===r.paciente_id)))return err(DUP,'23505')}
  if(op==='update'){
   if(rol==='paciente'&&!(old.paciente_id===myP()&&r.estado==='cancelada'))return err('No autorizado.','42501')
   if(rol==='medico'&&!(old.medico_id===myM()&&['atendida','inasistencia'].includes(r.estado)))return err('No autorizado.','42501')}}
 return null}
async function run(s){await ready
 const{t,op,cols,f,ord,payload,one}=s
 let rows=db[t].filter(r=>f.every(([k,v])=>r[k]===v)),ok={data:null,error:null}
 if(op==='select'){
  if(t==='citas'){const rol=me()?.rol,p=myP(),m=myM();rows=rows.filter(c=>rol==='paciente'?c.paciente_id===p:rol==='medico'?c.medico_id===m:true)}
  rows=[...rows].sort((a,b)=>{for(const k of ord){const c=String(a[k]).localeCompare(String(b[k]));if(c)return c}return 0})
  if(t==='citas')rows=rows.map(r=>({...r,pacientes:db.pacientes.find(p=>p.id===r.paciente_id)??null,medicos:db.medicos.find(m=>m.id===r.medico_id)??null}))
  if(one)return rows[0]?{data:rows[0],error:null}:one==='single'?err('Sin resultados','PGRST116'):ok
  return{data:rows,error:null}}
 if(op==='insert'){const list=[].concat(payload).map(x=>({...x}))
  for(const r of list){const e=rules(t,'insert',r);if(e)return e}
  list.forEach(r=>{r.id=uid()
   if(t==='pacientes'){r.tipo_doc??='CC';r.user_id??=null}
   if(t==='medicos'){r.activo=true;const u=db.users.find(x=>x.email.toLowerCase()===r.email);r.user_id=u?.id??null;const p=u&&db.profiles.find(x=>x.id===u.id);if(p)p.rol='medico'}
   if(t==='citas')r.estado='programada'
   db[t].push(r)});save();return ok}
 if(op==='update'){for(const o of rows){const e=rules(t,'update',payload,o);if(e)return e}
  rows.forEach(o=>{Object.assign(o,payload);const p=t==='pacientes'&&o.user_id&&db.profiles.find(x=>x.id===o.user_id);if(p)p.nombre=o.nombres+' '+o.apellidos});save();return ok}
 if(op==='delete'){db[t]=db[t].filter(r=>!rows.includes(r));save();return ok}}
const from=t=>{const s={t,op:'select',f:[],ord:[],one:null},b={
 select(){return b},eq(k,v){s.f.push([k,v]);return b},order(k){s.ord.push(k);return b},
 maybeSingle(){s.one='maybe';return b},single(){s.one='single';return b},
 insert(p){s.op='insert';s.payload=p;return b},update(p){s.op='update';s.payload=p;return b},delete(){s.op='delete';return b},
 then(a,c){return run(s).then(a,c)}};return b}
export const supabase={from,
 async rpc(n,a){await ready
  if(n==='documento_existe')return{data:db.pacientes.some(p=>p.documento===a.d),error:null}
  return{data:db.citas.filter(c=>c.medico_id===a.p_medico&&c.fecha===a.p_fecha&&c.estado!=='cancelada').map(c=>c.hora),error:null}},
 auth:{
  onAuthStateChange(cb){listeners.add(cb);ready.then(()=>cb('INITIAL_SESSION',sess));return{data:{subscription:{unsubscribe:()=>listeners.delete(cb)}}}},
  async signInWithPassword({email,password}){await ready
   const u=db.users.find(x=>x.email===email);if(!u||u.hash!==await sha(password))return{data:null,error:{message:'Invalid login credentials'}}
   setSess(u);return{data:{session:sess},error:null}},
  async signUp({email,password,options}){await ready
   if(db.users.some(x=>x.email===email))return{data:null,error:{message:'User already registered'}}
   const m=options?.data||{},u={id:uid(),email,hash:await sha(password)}
   db.users.push(u);db.profiles.push({id:u.id,nombre:`${m.nombres} ${m.apellidos}`,rol:'paciente'})
   db.pacientes.push({id:uid(),user_id:u.id,nombres:m.nombres,apellidos:m.apellidos,tipo_doc:m.tipo_doc||'CC',documento:m.documento,telefono:m.telefono,email})
   save();setSess(u);return{data:{},error:null}},
  async signOut(){setSess(null);return{error:null}}}}
