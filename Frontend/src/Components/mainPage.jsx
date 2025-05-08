import React from 'react';
import Nav from './nav';
import AddPost from './addPost';
import Sidebar from './sidebar';
import RightFriendsBar from './RightFriendBar';
import StoriesCarousel from './Stories';
import Feed from './Feed';
import Registration from './Registration';
export default function MainPage() {




    return (
      <div>
           <header className='navheader'> 
            <Nav></Nav>
            </header>
            <Sidebar />
        <div className="main-content" style={{ marginLeft: "550px", marginRight: "550px", padding: "50px" }}>
           <center> <AddPost /> </center>
            <StoriesCarousel />
             <Feed />
        </div>
       <RightFriendsBar />


 
      </div>
    );
}