import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='description-container'>
      {/* Top navigation buttons */}
      <div className="description-tabs">
        <button className="tab active">Description</button>
        <button className="tab">Reviews (122)</button>
      </div>

      {/* Description content */}
      <div className="description-content">
        <p>
          An e-commerce website is an online platform where businesses sell products or services to customers. 
          It typically features product listings, shopping carts, secure payment gateways, and user accounts. 
          Customers can browse items, read descriptions, view images, and make purchases directly through the site. 
          E-commerce websites often include search functionality, customer reviews, and personalized recommendations 
          to enhance the shopping experience.
        </p>
        <p>
          An e-commerce website is an online platform where businesses sell products or services to customers. 
          It typically features product listings, shopping carts, secure payment gateways, and user accounts.
        </p>
      </div>
    </div>
  )
}

export default DescriptionBox
