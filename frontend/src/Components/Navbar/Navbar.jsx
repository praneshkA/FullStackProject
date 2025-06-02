import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import cart from "../Assets/cart_icon.png";
import { ShopContext } from '../../Context/ShopContext';
import { useRef } from 'react';
import logo_big from "../Assets/logo_big.png";

const Navbar = () => {
  
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
    }
  };



  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo_big} alt="" />
        <p>ECOWEAR</p>
      </div>
      <ul ref={menuRef} className="nav-menu">
        <li > <Link style={{ textDecoration: 'none' }} to='/'>Shop</Link></li>
        <li > <Link style={{ textDecoration: 'none' }} to='/mens'>Mens</Link></li>
        <li > <Link style={{ textDecoration: 'none' }} to='/womens'>Women</Link></li>
        <li > <Link style={{ textDecoration: 'none' }} to='/kids'>Kids</Link></li>
      </ul>
      
      <div className="nav-login-cart">
        <Link to={isLoggedIn ? '/' : '/login'}>
          <button onClick={handleAuthAction}>{isLoggedIn ? 'Logout' : 'Login'}</button>
        </Link>
        <Link to='/cart'><img src={cart} alt="Cart" /></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
        <div className="my-orders"> 
<Link to='/myorder' style={{ textDecoration: 'none' }}>My Orders</Link> 
</div>
               

      </div>
    </div>
  );
};

export default Navbar;
