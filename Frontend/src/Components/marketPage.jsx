import React, { useState } from 'react';
import './marketPage.css';
import Nav from "./nav";
import Sidebar from "./sidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faCar, faHome, faBuilding, faPlug, faBicycle, faIndustry, faPaw, faCouch, faTshirt, faBook, faChild, faTools, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const categories = [
  "Mobiles", "Vehicles", "Property For Sale", "Property For Rent",
  "Electronics & Home Appliances", "Bikes", "Business, Industrial & Agriculture",
  "Animals", "Furniture & Home Decor", "Fashion & Beauty",
  "Books, Sports & Hobbies", "Kids", "Services", "Jobs"
];

const categoryIcons = {
  "Mobiles": faMobileAlt,
  "Vehicles": faCar,
  "Property For Sale": faHome,
  "Property For Rent": faBuilding,
  "Electronics & Home Appliances": faPlug,
  "Bikes": faBicycle,
  "Business, Industrial & Agriculture": faIndustry,
  "Animals": faPaw,
  "Furniture & Home Decor": faCouch,
  "Fashion & Beauty": faTshirt,
  "Books, Sports & Hobbies": faBook,
  "Kids": faChild,
  "Services": faTools,
  "Jobs": faBriefcase,
};

export default function MarketPage() {
  const [items, setItems] = useState([]);
  const [newAd, setNewAd] = useState({ name: '', price: '', image: null, category: '', description: '' });
  const [showAddAd, setShowAddAd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productUser, setProductUser] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAd({ ...newAd, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewAd({ ...newAd, image: e.target.files[0] });
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    if (newAd.name && newAd.price && newAd.image && newAd.category && newAd.description) {
      const formData = new FormData();
      formData.append('user_id', localStorage.getItem('id')); // Replace with the actual user ID
      formData.append('name', newAd.name);
      formData.append('price', newAd.price);
      formData.append('category', newAd.category);
      formData.append('description', newAd.description);
      formData.append('image', newAd.image);

      try {
        const response = await axios.post('http://127.0.0.1:8000/add_product/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert(response.data.message);
        setItems([...items, { id: items.length + 1, ...newAd }]);
        setNewAd({ name: '', price: '', image: null, category: '', description: '' });
        setShowAddAd(false);
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product.');
      }
    } else {
      alert('Please fill out all fields to add an ad.');
    }
  };

  const handleCategoryClick = async (category) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/createpost/', {
        query: "Select * from dbo.main_product where category =  '"+category+"'",
        
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching category data:', error);
      alert('Failed to fetch data for the selected category.');
    }
  };

  const handleShowAddAd = () => setShowAddAd(true);
  const handleCloseAddAd = () => setShowAddAd(false);

  const handleViewDetails = async (item) => {
    setSelectedProduct(item);
    setShowProductModal(true);
    try {
      // Fetch user details for the product
      const res = await axios.post('http://127.0.0.1:8000/createpost/', {
        query: `SELECT u.username, u.email, u.id, p.profileimg FROM auth_user u JOIN main_profile p ON u.id = p.user_id WHERE u.id = ${item.User_id}`,
      });
      setProductUser(res.data[0]);
    } catch (error) {
      setProductUser(null);
    }
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setProductUser(null);
  };

  return (
    <>
      <Sidebar></Sidebar>
      <header>
        <Nav></Nav>
      </header>
      <div style={{ marginLeft: "200px" }} className="marketplace">
        <section className="categories">
          <h2>Categories</h2>
          <div className="category-list">
            {categories.map((category, index) => (
              <div
                key={index}
                className="category-item"
                onClick={() => handleCategoryClick(category)}
                style={{ cursor: 'pointer' }}
              >
                <span className={`category-icon-circle category-${category.replace(/\s|&/g, '').toLowerCase()}`}> 
                  <FontAwesomeIcon icon={categoryIcons[category]} size="2x" className="category-icon" />
                </span>
                {category}
              </div>
            ))}
          </div>
        </section>

        <button className="sell-button" data-ds-target onClick={handleShowAddAd}>
          Sell
        </button>

        {showAddAd && (
          <div className="modal-overlay" data-ds-trigger>
            <div className="modal-content">
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
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <select
                  name="category"
                  value={newAd.category}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={newAd.description || ''}
                  onChange={handleInputChange}
                ></textarea>
                <div style={{marginTop: '10px'}}>
                  <button type="submit">Add Ad</button>
                  <button type="button" style={{marginLeft: '10px'}} onClick={handleCloseAddAd}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showProductModal && selectedProduct && (
          <div className="modal-overlay wide-modal" data-ds-trigger>
            <div className="modal-content" style={{ maxWidth: '800px', width: '90vw', position: 'relative' }}>
              <button
                style={{
                  position: 'absolute', top: 10, right: 20, background: 'transparent', border: 'none', fontSize: 28, color: '#888', cursor: 'pointer', zIndex: 2
                }}
                onClick={handleCloseProductModal}
                title="Close"
              >×</button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                <div style={{ flex: '1 1 350px', minWidth: 300 }}>
                  <img
                    src={`http://127.0.0.1:8000/media/${selectedProduct.image}`}
                    alt={selectedProduct.name}
                    style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 12, background: '#f5f5f5' }}
                  />
                </div>
                <div style={{ flex: '2 1 350px', minWidth: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h2 style={{ marginBottom: 8 }}>{selectedProduct.name}</h2>
                  <h3 style={{ color: '#1877f2', marginBottom: 8 }}>Rs. {selectedProduct.price}</h3>
                  <p style={{ marginBottom: 16 }}>{selectedProduct.description}</p>
                  {productUser && (
                    <div style={{ marginTop: 24, padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
                      <h4>Seller Details</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={productUser.profileimg ? `http://127.0.0.1:8000/media/${productUser.profileimg}` : '/icons/user1.jpg'}
                          alt={productUser.username}
                          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1877f2' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{productUser.username}</div>
                          <div style={{ fontSize: 14, color: '#555' }}>{productUser.email}</div>
                          <a
                            href={`/profile/${productUser.id}`}
                            style={{ color: '#1877f2', textDecoration: 'underline', fontSize: 14 }}
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="products">
          <h2>Items</h2>
          <div className="product-list">
            {items.map((item) => (
              <div key={item.id} className="product-card">
                <img src={"http://127.0.0.1:8000/media/" + item.image} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.price}</p>
                <button onClick={() => handleViewDetails(item)} data-ds-target>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>

       
      </div>
    </>
  );
}