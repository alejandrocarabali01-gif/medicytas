import {createContext,useContext,useEffect,useState} from 'react'
import {supabase} from './lib/supabase'
const Ctx=createContext(null)
export const useAuth=()=>useContext(Ctx)
export function AuthProvider({children}){
 const[session,setSession]=useState(null),[profile,setProfile]=useState(null),[loading,setLoading]=useState(true)
 const load=async s=>{setSession(s)
  if(!s){setProfile(null);return setLoading(false)}
  const{data}=await supabase.from('profiles').select('nombre,rol').eq('id',s.user.id).single()
  setProfile(data);setLoading(false)}
 useEffect(()=>{const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setTimeout(()=>load(s),0)})
  return()=>subscription.unsubscribe()},[])
 return <Ctx.Provider value={{session,profile,loading,signOut:()=>supabase.auth.signOut()}}>{children}</Ctx.Provider>}
