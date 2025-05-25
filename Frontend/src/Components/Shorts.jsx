import React, { useRef, useState, useEffect } from 'react';
import './Shorts.css';
import Nav from './nav';
import Sidebar from './sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCommentDots, faShare } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export default function Shorts() {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalVideo, setModalVideo] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const fileInputRef = useRef();
  const shortsListRef = useRef();

  // Fetch shorts from backend
  useEffect(() => {
    axios.get('http://localhost:8000/get_all_shorts/')
      .then(res => {
        // Map backend fields to frontend format
        setVideos(res.data.map(short => ({
          id: short.id,
          src: short.video,          
          title: short.title || '',
          user: short.user || '',
        })));
      })
      .catch(() => setVideos([]));
      console.log(videos)
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('user_id', localStorage.getItem('id')); // Assuming user ID is stored in localStorage
      formData.append('video', file);
      formData.append('title', file.name);
      formData.append('description', '');
      try {
        await axios.post('http://localhost:8000/upload_short/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Refresh shorts after upload
        const res = await axios.get('http://localhost:8000/get_all_shorts/');
        setVideos(res.data.map(short => ({
          id: short.id,
          src: short.video,
          title: short.title || '',
          user: short.user || '',
        })));
      } catch (err) {
        alert('Upload failed');
      }
      setUploading(false);
    }
  };

  const handleModalUpload = async (e) => {
    e.preventDefault();
    if (!modalVideo || !modalTitle) {
      alert('Please provide both a video and a title.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('user_id', localStorage.getItem('id'));
    formData.append('video', modalVideo);
    formData.append('title', modalTitle);
    formData.append('description', '');
    try {
      await axios.post('http://localhost:8000/upload_short/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await axios.get('http://localhost:8000/get_all_shorts/');
      setVideos(res.data.map(short => ({
        id: short.id,
        src: short.video,
        title: short.title || '',
        user: short.user || '',
      })));
      setShowModal(false);
      setModalVideo(null);
      setModalTitle('');
    } catch (err) {
      alert('Upload failed');
    }
    setUploading(false);
  };

  // Listen for wheel/scroll events to change video
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        setCurrentIndex((idx) => idx + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((idx) => idx - 1);
      }
    };
    const node = shortsListRef.current;
    if (node) {
      node.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (node) node.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, videos.length]);

  // Scroll to the current video with smooth transition and autoplay
  useEffect(() => {
    if (shortsListRef.current) {
      const cards = shortsListRef.current.querySelectorAll('.shorts-card-full');
      if (cards[currentIndex]) {
        cards[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Autoplay the video in the current card
        const video = cards[currentIndex].querySelector('video');
        if (video) {
          video.currentTime = 0;
          video.play();
        }
      }
    }
  }, [currentIndex, videos]);

  return (
    <div>
      <Nav />
      <Sidebar />
      <div style={{ marginTop: '150px' }} className="shorts-page">
        <div className="shorts-header">
          <h2>Shorts</h2>
          <button
            className="upload-btn"
            data-ds-trigger
            onClick={() => setShowModal(true)}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Short'}
          </button>
        </div>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Upload Short</h3>
              <form onSubmit={handleModalUpload}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => setModalVideo(e.target.files[0])}
                  required
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={modalTitle}
                  onChange={e => setModalTitle(e.target.value)}
                  required
                />
                <div style={{marginTop: '10px'}}>
                  <button type="submit" className="upload-btn" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button type="button" className="upload-btn" onClick={() => setShowModal(false)} style={{marginLeft: '10px'}}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div
          className="shorts-list shorts-list-vertical"
          ref={shortsListRef}
          style={{ height: 'calc(100vh - 70px)', overflowY: 'auto', scrollSnapType: 'y mandatory' }}
        >
          {videos.map((video, idx) => (
            <div
              className="shorts-card shorts-card-full"
              key={video.id}
              style={{
                minHeight: '90vh',
                maxHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'start',
              }}
            >
              <video
                className="shorts-video-full"
                src={video.src}
                controls
                loop
                muted
                playsInline
                autoPlay={idx === currentIndex}
                style={{ width: '100vw', height: '80vh', objectFit: 'cover', background: '#000' }}
                ref={el => {
                  if (el && idx === currentIndex) {
                    el.play();
                  }
                }}
              />
              {idx === currentIndex && (
                <>
                  <div className="shorts-info-full">
                    <span className="shorts-title">{video.title}</span>
                    <span className="shorts-user">by {video.user}</span>
                  </div>
                  <div className="shorts-actions">
                    <button className="shorts-action-btn" title="Like">
                      <FontAwesomeIcon icon={faHeart} size="lg" style={{ color: '#fff' }} />
                    </button>
                    <button className="shorts-action-btn" title="Comment">
                      <FontAwesomeIcon icon={faCommentDots} size="lg" style={{ color: '#fff' }} />
                    </button>
                    <button className="shorts-action-btn" title="Share">
                      <FontAwesomeIcon icon={faShare} size="lg" style={{ color: '#fff' }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
