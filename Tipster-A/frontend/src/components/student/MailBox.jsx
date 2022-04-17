import React from "react";
import Footer from "./Footer";
import MainMenu from "./MainMenu";
import TopMenu from "./TopMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import "./../../css/MailBox.css";
import { Link } from "react-router-dom";

const MailBox = () => {
  return (
    <div className="container">
      <TopMenu />
      <MainMenu />
      <div className="freezesemesterdiv">
        <h2 className="freezesemestertitle">Mail Box</h2>
      </div>
      <div className="receivedmsgscontainer"></div>
      <Link to="/NewMessage">
        <button className="composebtn">
          <FontAwesomeIcon icon={faPlusSquare} className="composeicon" />
          Compose
        </button>
      </Link>
      <Footer />
    </div>
  );
};

export default MailBox;
