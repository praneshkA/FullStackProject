  import React, { useContext, useState } from 'react';
  import './CartItems.css';
  import { ShopContext } from '../../Context/ShopContext';
  import remove_icon from '../Assets/cart_cross_icon.png';
  import CheckOut from '../CheckOut/CheckOut';

  const CartItems = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart } = useContext(ShopContext);
    const [showCheckout, setShowCheckout] = useState(false);


    return (
      <div className='cartitems'>
        {/* Table Header */}
        <div className="cartitems-format-main">
          <p>Product</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />

        {/* Product Rows */}
        {all_product.map((product, index) => {
          if (cartItems[product._id] > 0) {
            return (
              <div key={index} className="cartitems-format">
                <img
                  src={product.image}
                  alt={product.name}
                  className='cartitems-product-icon'
                />
                <p>{product.name}</p>
                <p>₹{product.new_price}</p>
                <p>{cartItems[product._id]}</p>
                <p>₹{product.new_price * cartItems[product._id]}</p>
                <img
                  src={remove_icon}
                  alt="Remove"
                  className='cartitems-remove-icon'
                  onClick={() => removeFromCart(product._id)}
                />
              </div>
            );
          } else {
            return null;
          }
        })}
        <hr />

        {/* Cart Totals + Promo Code */}
        <div className="cartitems-bottom">
          <div className="cartitems-total-section">
            <h1>Cart Totals</h1>

            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>₹{getTotalCartAmount()}</h3>
            </div>

            <button className='checkout-button' onClick={() => setShowCheckout(true)}>
              PROCEED TO CHECKOUT
            </button>

            {showCheckout && (
              <CheckOut
    cartItems={cartItems}
    allProduct={all_product}
    totalAmount={getTotalCartAmount()}
    onCancel={() => setShowCheckout(false)}
  />

            )}
          </div>

          <div className="cartitems-promocode-section">
            <p>If you have a promo code, enter it here:</p>
            <div className="cartitems-promobox">
              <input type="text" placeholder='Promo code' />
              <button className='submit-promo-button'>Submit</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default CartItems;
