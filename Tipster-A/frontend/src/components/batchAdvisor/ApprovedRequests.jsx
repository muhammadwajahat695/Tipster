import React, { useState } from "react";
import Footer from "../student/Footer";
import BatchAdvisorMainMenu from "./BatchAdvisorMainMenu";
import BatchAdvisorTopMenu from "./BatchAdvisorTopMenu";
import del from "./../../icons/deleteicon.png";
// import print from "./../../icons/printer.png";
import "./../../css/ApprovedRequests.css";
import DeleteAddedCoursePopup from "./../student/DeleteAddedCoursePopup.jsx";

const ApprovedRequests = () => {
  const [buttonPopup, setButtonPopup] = useState(false);
  return (
    <div className="BAprofilecontainer">
      <BatchAdvisorTopMenu />
      <BatchAdvisorMainMenu />
      <div className="menuheadingdiv">
        <h2 className="ApprovedRequeststitle">Approved Requests</h2>
        {/* <img className="printIcon" src={print} alt="" /> */}
      </div>
      <form action="">
        <table className="pendingTable">
          <tr>
            <th className="ARregno">Reg No</th>
            <th className="ARname">Name</th>
            <th className="ARcode">Course Code</th>
            <th className="ARtitle">Course Title</th>
            <th className="ARcredits">Credits</th>
            <th className="ARsection">Section</th>
            <th className="ARrequest">Action</th>
            <th className="ARdel">Delete</th>
          </tr>
          <tr>
            <td className="ARregno"></td>
            <td className="ARname"></td>
            <td className="ARcode"></td>
            <td className="ARtitle"></td>
            <td className="ARcredits"></td>
            <td className="ARsection"></td>
            <td className="ARrequest"></td>
            <td className="ARdel">
              <img
                className="tooltip"
                src={del}
                alt=""
                onClick={() => setButtonPopup(true)}
              />
            </td>
          </tr>
        </table>
        {/* <button className="delAll" onClick={() => setButtonPopup(true)}>
          Delete All
        </button> */}
        <button className="print">Print</button>
      </form>
      <Footer />
      <DeleteAddedCoursePopup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <form action="">
          <h3 className="DeleteConfirmation">
            Are you sure you want to delete this request?
          </h3>
          <button className="DeleteAddedCourseButton ">Delete</button>
        </form>
      </DeleteAddedCoursePopup>
    </div>
  );
};

export default ApprovedRequests;
