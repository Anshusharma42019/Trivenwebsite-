'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('triven_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading wishlist from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('triven_wishlist', JSON.stringify(wishlist));
      } catch (e) {
        console.error('Error saving wishlist', e);
      }
    }
  }, [wishlist, isLoaded]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => String(item._id) === String(product._id));
      if (exists) {
        return prev.filter((item) => String(item._id) !== String(product._id));
      } else {
        return [
          ...prev,
          {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            sellingPrice: product.sellingPrice,
            mrp: product.mrp,
            images: product.images,
            category: product.category,
            dosageForm: product.dosageForm,
            netQuantity: product.netQuantity,
          },
        ];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => String(item._id) === String(productId));
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => String(item._id) !== String(productId)));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        itemCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return {
      wishlist: [],
      itemCount: 0,
      toggleWishlist: () => {},
      isInWishlist: () => false,
      removeFromWishlist: () => {},
    };
  }
  return ctx;
}
