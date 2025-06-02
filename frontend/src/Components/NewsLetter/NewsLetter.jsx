import React from 'react';
import './NewsLetter.css';   

const NewsLetter = () => {
  return (
    <div className='newsletter-container'> {/* Box-like container */}
      <div className='newsletter'>
        <h1>Get exclusive offers on your email</h1>
        <p>Subscribe to our newsletter and stay updated</p>
        <div>
          <input type="email" placeholder='Your email ID'/>
          <button>Subscribe</button>
        </div>
      </div>
    </div>
  );
}

export default NewsLetter;
