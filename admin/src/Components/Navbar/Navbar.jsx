import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={logo} alt="" className="nav-logo"/>
      <p className='name'>ECOWEAR</p>
    </div>
  )
}

export default Navbar
