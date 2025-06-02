import React, { useContext } from 'react';
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/items/Item';

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  // ✅ First, check if all_product exists and what's inside
  console.log('all_product from context:', all_product);
  console.log('Selected category (props.category):', props.category);

  // ✅ Check if data is ready
  if (!all_product) {
    console.log('all_product is undefined or null!');
    return <div>Loading...</div>;
  }

  return (
    <div className="shop">
      <img className='Shopcategory-banner'src={props.banner} alt="" />

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-12</span> out of {all_product.length} products
        </p>
        <div className="shopcategory-sort">
          sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {all_product.map((item, i) => {
          // ✅ Log each item's category to make sure it matches the props.category
          console.log(`Item ${i}:`, item);
          console.log(`Comparing "${props.category}" === "${item.category}"`);

          if (
            props.category.toLowerCase() === item.category.toLowerCase()
          ) {
            return (
              <Item
                key={i}
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price}
              />
            );
          } else {
            return null;
          }
        })}
      </div>
      <div className="shopcategory-loadmore">
        Explore More
      </div>
    </div>
  );
};

export default ShopCategory;
