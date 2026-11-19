import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import App from './App'
import './styles.css'
document.documentElement.dataset.theme=localStorage.getItem('mc_theme')||''
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>)
