import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  return {};
};

const ShopContextProvider = (props) => {
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    fetch("https://fullstackproject-480y.onrender.com/api/allproducts")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Products fetched:", data);
        setAllProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const fetchCart = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await axios.get("https://fullstackproject-480y.onrender.com/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const dbCart = response.data.cart;
    if (!Array.isArray(dbCart)) {
      setCartItems({});
      return;
    }

    const formattedCart = {};
    dbCart.forEach((item) => {
      // Defensive coding: ensure productId exists
      if (item.productId && item.quantity != null) {
        formattedCart[item.productId._id || item.productId] = item.quantity;
      }
    });

    setCartItems(formattedCart);
  } catch (error) {
    console.error("Failed to fetch cart:", error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid or expired — optional logic here
      localStorage.removeItem("authToken");
      // Possibly redirect to login or show a message
    }
  }
};

useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    fetchCart();
  } else {
    setCartItems(getDefaultCart()); // clear cart on logout
  }
}, [/* You can add a 'token' state or listen to login events */]);


  const addToCart = async (productMongoId) => {
  const updatedCart = { ...cartItems };
  updatedCart[productMongoId] = (updatedCart[productMongoId] || 0) + 1;
  setCartItems(updatedCart);

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to add items to cart.");
      return;
    }

    const response = await axios.post(
      "https://fullstackproject-480y.onrender.com/api/cart/add",
      {
        productId: productMongoId,
        quantity: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(response.data.message);
    // await fetchCart(); // Optional
  } catch (error) {
    console.error("Add to cart failed:", error);
    alert("Failed to add product to cart");
    await fetchCart(); // Revert if needed
  }
};

const removeFromCart = async (productMongoId) => {
  // 🟢 Immediately update cartItems locally (optimistic UI update)
  const updatedCart = { ...cartItems };
  if (updatedCart[productMongoId] > 1) {
    updatedCart[productMongoId] -= 1;
  } else {
    delete updatedCart[productMongoId];
  }
  setCartItems(updatedCart); // ⬅️ this will re-render UI immediately

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to remove items from cart.");
      return;
    }

    const response = await axios.post(
      "https://fullstackproject-480y.onrender.com/api/cart/remove",
      {
        productId: productMongoId,
        quantity: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(response.data.message);
    // Optionally refresh cart again to keep in sync
    // await fetchCart(); ⬅️ remove or keep depending on how confident you are in local update
  } catch (error) {
    console.error("Remove from cart failed:", error);
    alert("Failed to remove product from cart");
    // 🔁 Revert optimistic update on failure
    await fetchCart();
  }
};

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const productId in cartItems) {
      if (cartItems[productId] > 0) {
        const product = allProducts.find((p) => p._id === productId);
        if (product) {
          totalAmount += product.new_price * cartItems[productId];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const productId in cartItems) {
      totalItems += cartItems[productId];
    }
    return totalItems;
  };

 return (
  <ShopContext.Provider
    value={{
      all_product: allProducts,
      cartItems,
      addToCart,
      removeFromCart,
      getTotalCartAmount,
      getTotalCartItems,
      fetchCart,  // <-- add this
    }}
  >
    {props.children}
  </ShopContext.Provider>
);
}

export default ShopContextProvider;
