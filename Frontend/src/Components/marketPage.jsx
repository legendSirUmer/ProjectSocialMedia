import React, { useState } from 'react';
import './marketPage.css';
import Nav from "./nav";
import Sidebar from "./sidebar";

const categories = [
  "Mobiles", "Vehicles", "Property For Sale", "Property For Rent",
  "Electronics & Home Appliances", "Bikes", "Business, Industrial & Agriculture",
  "Animals", "Furniture & Home Decor", "Fashion & Beauty",
  "Books, Sports & Hobbies", "Kids", "Services", "Jobs"
];

export default function MarketPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'Tecno Camon 40', price: 'Rs 6,400', image: 'tecno-camon-40.jpg' },
    { id: 2, name: 'Samsung Galaxy S25 Ultra', price: 'Rs 23,500', image: 'samsung-galaxy-s25-ultra.jpg' },
    { id: 3, name: 'vivo Y83', price: 'Rs 15,000', image: 'vivo-y83.jpg' },
    { id: 4, name: 'Samsung S24 Plus', price: 'Rs 30,000', image: 'samsung-s24-plus.jpg' }
  ]);

  const [newAd, setNewAd] = useState({ name: '', price: '', image: '' });
  const [showAddAd, setShowAddAd] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAd({ ...newAd, [name]: value });
  };

  const handleAddAd = (e) => {
    e.preventDefault();
    if (newAd.name && newAd.price && newAd.image) {
      setItems([...items, { id: items.length + 1, ...newAd }]);
      setNewAd({ name: '', price: '', image: '' });
      setShowAddAd(false);
    } else {
      alert('Please fill out all fields to add an ad.');
    }
  };

  return (
    <>
      <Sidebar></Sidebar>
        <header>
          <Nav></Nav>
        </header>
      <div style={{ marginLeft: "150px" }} className="marketplace">

        <section className="categories">
          <h2>Categories</h2>
          <div className="category-list">
            {categories.map((category, index) => (
              <div key={index} className="category-item">{category}</div>
            ))}
          </div>
        </section>



        <button className="sell-button" onClick={() => setShowAddAd(!showAddAd)}>
          {showAddAd ? 'Cancel' : 'Sell'}
        </button>

        {showAddAd && (
          <section className="add-ad">
            <h2>Add New Ad</h2>
            <form onSubmit={handleAddAd} className="add-ad-form">
              <input
                type="text"
                name="name"
                placeholder="Item Name"
                value={newAd.name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="price"
                placeholder="Price"
                value={newAd.price}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={newAd.image}
                onChange={handleInputChange}
              />
              <button type="submit">Add Ad</button>
            </form>
          </section>
        )}



        <section className="products">
          <h2>Mobile Phones</h2>
          <div className="product-list">
            {items.map((item) => (
              <div key={item.id} className="product-card">
                <img src={item.image} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.price}</p>
                <button>View Details</button>
              </div>
            ))}
          </div>
        </section>

       
      </div>
    </>
  );
}