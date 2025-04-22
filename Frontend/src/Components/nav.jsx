import React from 'react';
import './nav.css'

export default function Nav() {




    return (
       
      
        <header>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"></link>
  <nav>
    <ul>
      <li>
        {" "}
        <a href="#" id="fb">
          {" "}
          <i className="fab fa-facebook-f    " />{" "}
        </a>{" "}
      </li>
      <li>
        {" "}
        <button id="search_btn" className="tooltip" data-tooltip="Search">
          {" "}
          <i className="fas fa-search    " />{" "}
        </button>{" "}
      </li>
      <li id="space2" />
      <li>
        {" "}
        <a className="tooltip active" data-tooltip="Home" href="#" id="home">
          {" "}
          <i className="fas fa-home    " />{" "}
        </a>{" "}
      </li>
      <li>
        {" "}
        <a className="tooltip" data-tooltip="Group" href="#" id="group">
          {" "}
          <i className="fas fa-user-friends    " />{" "}
        </a>
      </li>
      <li>
        {" "}
        <a className="tooltip" data-tooltip="Watch" href="#" id="tv">
          {" "}
          <i className="fas fa-tv    " />{" "}
        </a>{" "}
      </li>
      <li>
        {" "}
        <a className="tooltip" data-tooltip="Friend" href="#" id="friend">
          {" "}
          <i className="fas fa-user-alt    " />{" "}
        </a>{" "}
      </li>
      <li id="space1" />
      <li>
        {" "}
        <button className="tooltip" data-tooltip="Add" id="btn_plus">
          <i className="fas fa-plus    " />
        </button>{" "}
      </li>
      <li>
        {" "}
        <button className="tooltip" data-tooltip="Message" id="btn_msg">
          <i className="fab fa-facebook-messenger    " />
        </button>
      </li>
      <li>
        {" "}
        <button className="tooltip" data-tooltip="Notification" id="btn_bell">
          {" "}
          <i className="fas fa-bell    " />
        </button>
      </li>
      <li>
        {" "}
        <button className="tooltip" data-tooltip="Profile" id="btn_profile">
          <i className="fas fa-user-cog    " />
        </button>
      </li>
    </ul>
  </nav>
</header>

       
    );
}