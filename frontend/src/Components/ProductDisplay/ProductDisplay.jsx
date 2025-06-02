import React, { useContext } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);

  const handleAddToCart = () => {
    addToCart(product._id);
    toast.success(`${product.name} added to the cart!`, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
        </div>
        <div className="productdisplay-img">
          <img className='productdisplay-main-img' src={product.image} alt="" />
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{product.name}</h1>

        <div className="productdisplay-right-star">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>

        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            ₹ {product.old_price}
          </div>
          <div className="productdisplay-right-price-new">
            ₹ {product.new_price}
          </div>
        </div>

        <div className="product-right-discription">
          Discover premium full-hand shirts crafted for comfort and style. Perfect for every occasion, our collection blends modern design with timeless elegance. Dress smart, feel confident!
        </div>

        <div>
          <h1>Select size</h1>
          <div className="productdisplay-right-size">
            <div>S</div>
            <div>M</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>

        <button onClick={handleAddToCart}>ADD TO CART</button>

        <p className='productdisplay-right-category'>
          <span>Category:</span> Women, T-Shirt, CropTop
        </p>

        <p className='productdisplay-right-category'>
          <span>Tags:</span> Modern, Latest
        </p>
      </div>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default ProductDisplay;
