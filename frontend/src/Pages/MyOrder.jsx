    import React, { useEffect, useState } from 'react';
    import './CSS/MyOrder.css'; // Optional: create this for styling

    const MyOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');

        if (!token) {
        setError('Please login to view your orders.');
        setLoading(false);
        return;
        }

        try {
        const res = await fetch('https://fullstackproject-480y.onrender.com/api/my-orders', {
            headers: {
            'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data.orders || []);
        } catch (err) {
        console.error(err);
        setError('Something went wrong while fetching your orders.');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="myorders-container">
        <h2>🧾 My Orders</h2>

        {loading && <p>Loading orders...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && orders.length === 0 && !error && (
            <p>You haven't placed any orders yet.</p>
        )}

        {orders.map((order, index) => (
            <div key={index} className="order-card">
            <div className="order-header">
                <div><strong>Order ID:</strong> #{order._id}</div>
                
                <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                <div><strong>Status:</strong> {order.status || 'Placed'}</div>
                <div><strong>Payment:</strong> {order.paymentMethod}</div>
            </div>

            <div className="order-items">
                {order.products.map((item, i) => (
                <div key={i} className="order-item">
                    <div className="item-name">{item.name}</div>
                    <div>Qty: {item.quantity}</div>
                    <div>Price: ₹{item.price}</div>
                    <div>Total: ₹{item.quantity * item.price}</div>
                </div>
                ))}
            </div>

            <div className="order-footer">
                <strong>Total Amount:</strong> ₹{order.totalAmount}
            </div>
            </div>
        ))}
        </div>
    );
    };

    export default MyOrder;
