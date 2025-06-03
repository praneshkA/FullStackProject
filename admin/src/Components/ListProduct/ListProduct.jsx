import React, { useEffect, useState } from 'react';
import './listProduct.css';

const ListProduct = () => {
  const [products, setProducts] = useState([]);

  // Fetch all products from the API
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://fullstackproject-480y.onrender.com/allproducts');
      const data = await response.json();
      // Since data is already an array, set directly
      if (Array.isArray(data)) {
        setProducts(data); // set products state directly
      } else {
        console.error('Unexpected data structure:', data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Remove a product
  const removeProduct = async (id) => {
    try {
      const response = await fetch('https://fullstackproject-480y.onrender.com/removeproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.sucess || result.success) { // check for typo 'sucess' in your backend response to be safe
        // Remove the product from state
        setProducts(products.filter(product => product.id !== id));
      } else {
        alert('Failed to remove product.');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      alert('An error occurred while removing the product.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className='listProduct'>
      <h1>All Products</h1>
      <div className='product-list'>
        {products.map(product => (
          <div key={product.id} className='product-card'>
            <img src={product.image} alt={product.name} className='product-image' />
            <h2>{product.name}</h2>
            <p>Category: {product.category}</p>
            <p>Old Price: ${product.old_price}</p>
            <p>Offer Price: ${product.new_price}</p>
            <button onClick={() => removeProduct(product.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
