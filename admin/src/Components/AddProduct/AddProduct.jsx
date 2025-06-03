import React, { useState } from 'react';
import './AddProduct.css';

const AddProduct = () => {
  const [productData, setProductData] = useState({
    title: '',
    price: '',
    offerPrice: '',
    category: '',
    image: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProductData({
        ...productData,
        image: e.target.files[0]
      });
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!productData.image) {
    alert('Please select an image');
    return;
  }

  const formData = new FormData();
  formData.append('image', productData.image); // this must match the name used in upload.single("image")
  formData.append('name', productData.title);
  formData.append('category', productData.category);
  formData.append('new_price', parseFloat(productData.price));
  formData.append('old_price', parseFloat(productData.offerPrice));

  try {
    const response = await fetch('https://fullstackproject-480y.onrender.com/api/addproduct', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      setProductData({
        title: '',
        price: '',
        offerPrice: '',
        category: '',
        image: '',
      });
    } else {
      alert('Failed to add product: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred: ' + error.message);
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Product</h2>

      <label>
        Product Title
        <input type="text" name="title" value={productData.title} onChange={handleChange} required />
      </label>

      <label>
        Regular Price ($)
        <input type="number" name="price" value={productData.price} onChange={handleChange} required />
      </label>

      <label>
        Offer Price ($)
        <input type="number" name="offerPrice" value={productData.offerPrice} onChange={handleChange} required />
      </label>

      <label>
        Category
        <select name="category" value={productData.category} onChange={handleChange} required>
          <option value="">Select a category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>
      </label>

      <label>
        Product Image
        <input type="file" onChange={handleImageChange} required />
        <span>{productData.image ? productData.image.name : 'Choose file'}</span>
      </label>

      {/* Image Preview */}
      {productData.image && (
        <div className="image-preview">
          <h3>Image Preview:</h3>
          <img
            src={URL.createObjectURL(productData.image)}
            alt="Product Preview"
            className="preview-image"
          />
        </div>
      )}

      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProduct;
