import React, { useState } from 'react';
import './CheckOut.css';

const CheckOut = ({ cartItems, allProduct, totalAmount, onCancel }) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMethod] = useState('COD');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const token = localStorage.getItem('authToken');  // <-- Get token

  if (!token) {
    setError('You must be logged in to place an order.');
    setLoading(false);
    return;
  }

  const products = allProduct
    .filter(p => cartItems[p._id] > 0)
    .map(p => ({
      productId: p._id,
      name: p.name,
      price: p.new_price,
      quantity: cartItems[p._id],
    }));

  const orderData = {
    name,
    number,
    address,
    paymentMode,
    products,
    totalAmount,
  };

  try {
    const res = await fetch('https://fullstackproject-480y.onrender.com/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // <-- Add token here
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to place order');
    }

    const data = await res.json();
    console.log('✅ Order placed:', data);
    setOrderPlaced(true);

    setName('');
    setNumber('');
    setAddress('');
    setPaymentMethod('COD');
  } catch (error) {
    console.error('Order error:', error);
    setError(error.message || 'Error placing order.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="checkout-overlay">
      <div className="checkout-form-modal">
        {!orderPlaced ? (
          <form onSubmit={handleSubmit}>
            <h2>Checkout Details</h2>

            {error && <p className="error">{error}</p>}

            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Your Phone Number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
            <textarea
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="COD">Cash on Delivery</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>

            <div className="checkout-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              <button type="button" onClick={onCancel}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="order-confirmation">
            <h2>🎉 Order Confirmed!</h2>
            <p>Thank you for your purchase.</p>
            <button onClick={onCancel}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckOut;
