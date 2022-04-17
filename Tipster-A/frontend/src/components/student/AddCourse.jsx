import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import MainMenu from "./MainMenu";
import TopMenu from "./TopMenu";
import "./../../css/AddCourse.css";
import deleteicon from "./../../icons/deleteicon.png";
// import DeleteAddedCoursePopup from "./DeleteAddedCoursePopup";


const AddCourse = () => {
  // const [buttonPopup, setButtonPopup] = useState(false);

  const [addcourse, setAddcourse] = useState({courseName:"",courseCode:"",credits:"",section_to:"",reason:""})
  let name,value;
  const handleInputs=(e)=>{
    console.log(e);
    name=e.target.name;
    value=e.target.value;
    setAddcourse({...addcourse,[name]:value});
  }
  const [addcourses, setAddcourses] = useState([])
  const add=async(e)=>{
    e.preventDefault();
    let j="";
    for (let i=0;i<addcourses.length;i++){
      if(addcourses[i].courseName===addcourse.courseName){
        j=i
        window.alert("course already added")
      }
    }
    if(j===""){
      setAddcourses([...addcourses,addcourse])
  }
  }
  const delete1 =async(courseName)=>{
    for (let i=0;i<addcourses.length;i++){
      if(addcourses[i].courseName===courseName){
        console.log("dsdsadsa",addcourses[i].courseName)
        await addcourses.splice(i,1)
        setAddcourses([...addcourses])
      }
    }
  } 

return (
    <div className="container">
      <TopMenu />
      <MainMenu />
      <div className="freezesemesterdiv">
        <h2 className="freezesemestertitle">Add Course</h2>
      </div>
      <div className="AddCourseFormContainer">
        <form action="">
          <select
            className="CourseTitleandReasonInput"
            name="courseName"
            value={addcourse.courseName}
            onChange={handleInputs}
            id=""
            placeholder=""
            required
          >
            <option value="" disabled selected hidden>
              Course Title
            </option>
            <option>Human Computer Interaction</option>
            <option>Game Development</option>
            <option>Software Project Management</option>
            <option>Compiler Construction</option>
          </select>
          <input
            className="CourseCodeandCreditsInput"
            type="text"
            name="courseCode"
            value={addcourse.courseCode}
            onChange={handleInputs}
            id=""
            placeholder="Course Code"
            readOnly
          />
          <input
            className="CourseCodeandCreditsInput"
            name="credits"
            value={addcourse.credits}
            onChange={handleInputs}
            type="text"
            placeholder="Credits"
            readOnly
          />
          <select
            className="CourseTitleandReasonInput"
            name="section_to"
            value={addcourse.section_to}
            onChange={handleInputs}
            id=""
            placeholder=""
            required
          >
            <option value="" disabled selected hidden required>
              Concerned Section
            </option>
            <option>FA18-BCS-A</option>
            <option>FA18-BCS-B</option>
          </select>
          <textarea
            className="AddReasonInput"
            name="reason"
            value={addcourse.reason}
            onChange={handleInputs}
            id=""
            cols="36.5"
            rows="4"
            placeholder="Enter Valid Reason"
            required
          ></textarea>
          <button className="Addbutton"
          onClick={add}
          >Add</button>
        </form>
      </div>
    
      <div className="AddCourseTableContainer">
      {(addcourses=="")?"no courses registered":
        <form action="">
          <table className="AddCourseTable">
            <tr>
              <th className="CourseCodeColumn">Course Code</th>
              <th className="CourseTitleColumn">Course Title</th>
              <th className="CreditsColumn">Credits</th>
              <th className="SectionColumn">Section</th>
              <th className="PrereqCourseColumn">Pre-req Course</th>
              <th className="PretestColumn">Pre-test</th>
              <th className="DeleteColumn">Delete</th>
            </tr>
            {addcourses.map((add)=>(
            <tr>
            <td>{add.courseCode}</td>
            <td>{add.courseName}</td>
            <td>{add.credits}</td>
            <td>{add.section_to}</td>
            <td></td>
            <td></td>
            <td>
              <img
                src={deleteicon}
                alt=""
                className="AddedCourseDelBtn"
                onClick={() => 
                  // {setButtonPopup(true);
                  delete1(add.courseName)
                // }
              }
              />
            </td>
          </tr>
            ))}

          </table>
          <br />
          <label className="FeeChallanLabel">Paid Fee Challan: </label>
          <input type="file" name="" id="" accept="image/*" />
          <br />
          <button className="AddCourseSubmitButton">Submit</button>
        </form>
      }
</div>

      {/* <DeleteAddedCoursePopup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <form action="">
          <h3 className="DeleteConfirmation">
            Are you sure you want to delete this course?
          </h3>
          <button className="DeleteAddedCourseButton ">Delete</button>
        </form>
      </DeleteAddedCoursePopup> */}
      <Footer />
    </div>
  );
};

export default AddCourse;