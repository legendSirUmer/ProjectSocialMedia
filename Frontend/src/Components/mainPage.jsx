import React from 'react';
import Nav from './nav';
import AddPost from './addPost';
import Sidebar from './sidebar';
import RightFriendsBar from './RightFriendBar';
import StoriesCarousel from './Stories';
import Feed from './Feed';
import Registration from './Registration';
import './mainPage.css';

export default function MainPage() {




    return (
      <div>
           <header className='navheader'> 
            <Nav></Nav>
            </header>
            <Sidebar />
       <RightFriendsBar />

        <div className="main-content">
          <div className="add-post-center">
            <center><AddPost /></center>
          </div>
          <StoriesCarousel />
          <Feed />
        </div>


 
      </div>
    );
}