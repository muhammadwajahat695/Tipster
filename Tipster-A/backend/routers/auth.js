const express = require("express");
const router = express.Router();
require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); //generate unique token
const jwt = require("jsonwebtoken");
// const User = require("../models/users");
const Student = require("../models/StudentModel");
// const Batchadvisor = require("../models/batchadvisor");
const BatchAdvisor = require("../models/BatchAdvisorModel");
const GuidanceBox = require("../models/guidance");
const Pastpaper = require("../models/pastpaper");
const OfficeHour=require("../models/officeHours")
const Timetable = require("../models/timetable");
const CourseRequest = require("../models/DropCourse");
const ChatBox=require("../models/ChatBox")
const FreezeSemester=require("../models/FreezeSemester")
const AddCourse=require("../models/Addcourse")
const S_authenticate = require("../middleware/S_authenticate");
const BA_authenticate = require("../middleware/BA_authenticate");
const sendEmail = require("../middleware/sendemail");
const multer = require("multer");

//Student registration
router.post("/S_registration", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(200).send(student);
  } catch (error) {
    console.log(error);
  }
});
//Batch Advisor registration
router.post("/BA_registration", async (req, res) => {
  try { 
    const batchadvisor = await BatchAdvisor.create(req.body);
    res.status(200).send(batchadvisor);
  } catch (error) {
    console.log(error);
  }
});
//Student Login
router.post("/Studentlogin", async (req, res) => {
  try {
    const { batch, regNo, password } = req.body;
    //filled the filed or not
    if (!batch || !regNo || !password) {
      return res.status(400).json({ error: "filled the data" });
    }
    const registrationId = batch.concat("-BCS-", regNo);
    // console.log(registrationId);
    const Studentlogin = await Student.findOne({
      registrationId: registrationId,
    });
    if (Studentlogin) {
      //check password from database
      // console.log(Studentlogin)
      const ismatch = await bcrypt.compare(password, Studentlogin.password);
      if (!ismatch) {
        return res.status(400).json({ error: "incorrect password" });
      } else {
        //toekn
        const token = await Studentlogin.generateAuthToken();
        // console.log(token);
        //add cookies
        res.cookie("jwtoken", token, {
          expires: new Date(Date.now() + 2443000),
          httpOnly: true,
        });
        res.status(200).json({ message: "user signin successfully" });
      }
    } else {
      res.status(400).json({ error: "INCORRECT registration no" });
    }
  } catch (error) {
    console.log(error);
  }
});
//for batch advisor login
router.post("/BatchAdvisorlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    //filled the filed or not
    if (!email || !password) {
      return res.status(400).json({ error: "filled the data" });
    }
    const Batchadvisorlogin = await BatchAdvisor.findOne({ email: email });
    if (Batchadvisorlogin) {
      //check password from database
      const ismatch = await bcrypt.compare(
        password,
        Batchadvisorlogin.password
      );
      if (!ismatch) {
        return res.status(400).json({ error: "incorrect password" });
      } else {
        //toekn
        const token = await Batchadvisorlogin.generateAuthToken();
        // console.log(token);
        //add cookies
        res.cookie("Bjwtoken", token, {
          expires: new Date(Date.now() + 244300000),
          httpOnly: true,
        });
        res.status(200).json({ message: "user signin successfully" });
      }
    } else {
      res.status(400).json({ error: "INCORRECT Email" });
    }
  } catch (error) {
    console.log(error);
  }
});
// Student Profile
router.get("/Studentprofile", S_authenticate, async (req, res) => {
  console.log("Get Student profile data");
  res.status(200).send(req.rootuser);
});

//Batch Advisor profile
router.get("/BatchAdvisorprofile", BA_authenticate, async (req, res) => {
  console.log("Get the batch advisor profile data");
  res.status(200).send(req.rootuser);
});
//------------update password
//update student password
router.put("/S_updatepassword", S_authenticate, async (req, res) => {
  const { old_password, new_password, confirm_password } = req.body;
  if (!old_password || !new_password || !confirm_password) {
    return res.status(400).json({ error: "filled the data" });
  }
  const student = await Student.findById(req.rootuser);
  //  console.log("Refeded");
  const isMatched = await bcrypt.compare(old_password, student.password);
  //  console.log("dhgafvasd");
  if (!isMatched) {
    return res.status(400).json({ error: "Old password is not Correct" });
  } else if (new_password != confirm_password) {
    return res.status(400).json({ error: "confirm password does not match" });
  }
  student.password = new_password;
  await student.save();
  //  sendToken(user, 200, res)
  res.status(200).send("Password updated successfully");
});
//update password batch advisor
router.put("/BA_updatepassword", BA_authenticate, async (req, res) => {
  const { old_password, new_password, confirm_password } = req.body;
  if (!old_password || !new_password || !confirm_password) {
    return res.status(400).json({ error: "filled the data" });
  }
  const batchadvisor = await BatchAdvisor.findById(req.rootuser);
  //  console.log("Refeded");
  const isMatched = await bcrypt.compare(old_password, batchadvisor.password);
  //  console.log("dhgafvasd");
  if (!isMatched) {
    return res.status(400).json({ error: "Old password is not Correct" });
  } else if (new_password != confirm_password) {
    return res.status(400).json({ error: "confirm password does not match" });
  }
  batchadvisor.password = new_password;
  await batchadvisor.save();
  //  sendToken(user, 200, res)
  res.status(200).send("Password updated successfully");
});
//----------------------update contact number----------------
//update student contact number
router.put("/S_updatecontact", S_authenticate, async (req, res) => {
  const student = await Student.findById(req.rootuser);
  //  console.log("Refeded");
  try {
    student.contactNo = req.body.contactNo;
    await student.save();
    res.status(200).send("phone number updated successfully");
  } catch (error) {
    return res
      .status(400)
      .json({ error: "enter the number in correct format" });
  }
});
//update batch advisor contact number
router.put("/BA_updatecontact", BA_authenticate, async (req, res) => {
  const batchadvisor = await BatchAdvisor.findById(req.rootuser);
  // console.log("Refeded");
  try {
    batchadvisor.contactNo = req.body.contactNo;
    await batchadvisor.save();
    res.status(200).send("phone number updated successfully");
  } catch (error) {
    return res
      .status(400)
      .json({ error: "enter the number in correct format" });
  }
});
//////////////////////top menu////////////
//top menu of Student
router.get("/S_Topmenu", S_authenticate, async (req, res) => {
  console.log("get top menu");
  res.status(200).send(req.rootuser);
});
//topmenu of batchadvisor
router.get("/BA_Topmenu", BA_authenticate, async (req, res) => {
  console.log("get top menu");
  res.status(200).send(req.rootuser);
});
///////////////////////////////////logout////////////////////////////////
//student logout
router.get("/Studentlogout",S_authenticate, (req, res) => {
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).send("user logout");
});
//BatchAdvisor logout
router.get("/Batchadvisorlogout",BA_authenticate, (req, res) => {
  res.clearCookie("Bjwtoken", { path: "/" });
  res.status(200).send("user logout");
});
//-------------------home student--------------------
router.get("/Home", S_authenticate, async (req, res) => {
  console.log("get top menu");
  console.log(req.rootuserResult);
  const studentdata = req.rootuser;
  const batch = studentdata.batch;
  if ("SP22" === batch) {
    res.status(200).send(req.rootuserSemester1);
  } else if ("FA21" === batch) {
    res.status(200).send(req.rootuserSemester2);
  } else if ("SP21" === batch) {
    res.status(200).send(req.rootuserSemester3);
  } else if ("FA20" === batch) {
    res.status(200).send(req.rootuserSemester4);
  } else if ("SP20" === batch) {
    res.status(200).send(req.rootuserSemester5);
  } else if ("FA19" === batch) {
    res.status(200).send(req.rootuserSemester6);
  } else if ("SP19" === batch) {
    res.status(200).send(req.rootuserSemester7);
  } else if ("FA18" === batch) {
    res.status(200).send(req.rootuserSemester8);
  } else if ("SP18" === batch) {
    res.status(200).send(req.rootuserSemester8);
  } else if ("FA17" === batch) {
    res.status(200).send(req.rootuserSemester9);
  } else if ("SP17" === batch) {
    res.status(200).send(req.rootuserSemester10);
  } else if ("FA16" === batch) {
    res.status(200).send(req.rootuserSemester11);
  } else if ("FA16" === batch) {
    res.status(200).send(req.rootuserSemester12);
  } else {
    res.status(200).send("error");
  }
});
//Guidance Box
//need guidance
router.get("/needguidance/:course", S_authenticate, async (req, res) => {
  try {
    const course = req.params.course;
    console.log(course);
    const data = await GuidanceBox.find({
      courses: { $elemMatch: { course: course } },
    });
    if (!data) {
      res.status(400).send("error");
    } else {
      console.log(data);
      res.status(200).send(data);
    }
  } catch (error) {
    console.log(error);
  }
});
//want to guide
router.post("/want-to-guide/:course", S_authenticate, async (req, res) => {
  try {
    const course = req.params.course;
    const user = req.rootuser;
    const registrationId = user.registrationId;
    const name = user.name;
    const email = user.email;
    const contactNo = "--";
    const box = await GuidanceBox.findOne({ registrationId });
    if (!box) {
      const guide = new GuidanceBox({ registrationId, name, email, contactNo });
      await guide.save();
      await guide.add(course);
      await guide.save();
      res.send(guide);
    } else {
      const array = box.courses.length;
      // console.log(array);
      if (array === 0) {
        await box.add(course);
        await box.save();
        res.send(box);
      } else if (array === 1) {
        if (box.courses[array - 1].course === course) {
          return res.status(400).send("already present");
        } else {
          await box.add(course);
          await box.save();
          res.send(box);
        }
      } else if (array == 2) {
        if (
          box.courses[array - 1].course === course ||
          box.courses[array - 2].course === course
        ) {
          return res.status(400).send("already present");
        } else {
          await box.add(course);
          await box.save();
          res.send(box);
        }
      } else {
        res.status(400).send("limit full");
      }
    }
  } catch (error) {
    console.log(error);
  }
});
//add phone number or not
router.post("/wantToGuide_contact/:add", S_authenticate, async (req, res) => {
  const checkbox = req.params.add;
  console.log(checkbox);
  try {
    if (checkbox === "check") {
      const user = req.rootuser;
      const contactNo = user.contactNo;
      const registrationId = user.registrationId;
      console.log(registrationId);
      const data = await GuidanceBox.findOne({ registrationId });
      if (!data) {
        res.status(400).send("first add some courses");
      } else {
        await data.Contact(contactNo);
        await data.save();
        res.send(data);
      }
    } else {
      const user = req.rootuser;
      const contactNo = user.contactNo;
      const registrationId = user.registrationId;
      const data = await GuidanceBox.findOne({ registrationId });
      if (!data) {
        res.status(400).send("not show contact number");
      } else {
        if (data.contactNo === contactNo) {
          console.log(data.contactNo);
          data.contactNo = "--";
          await data.save();
          res.status(200).send(data);
        }
      }
    }
  } catch (error) {
    res.status(400).send("error");
  }
});
//delete the course that added for guide
router.delete("/delete_course/:course", S_authenticate, async (req, res) => {
  try {
    const course = req.params.course;
    // console.log(course);
    // console.log("first")
    const user = req.rootuser;
    const registrationId = user.registrationId;
    const record = await GuidanceBox.findOne({
      registrationId,
    });
    if (!record) {
      res.send("no record");
    } else {
      for (var i = 0; i < record.courses.length; i++) {
        if (record.courses[i].course === course) {
          await record.courses.splice(i, 1);
          await record.save();
        }
      }
      if(record.courses.length===0){
        await record.delete();
      }
    }
  } catch (e) {
    res.status(500).send(e);
  }
});
//GET the data
router.get("/guide_courses", S_authenticate, async (req, res) => {
  const user = req.rootuser;
  const registrationId = user.registrationId;
  const box = await GuidanceBox.findOne({ registrationId });
  if (!box) {
    res.status(200).send("no record found");
  } else {
    //  console.log(box);
    console.log("get the  data");
    res.send(box.courses);
  }
});
//reset password email for student
router.post("/S_sendresetemail", async (req, res) => {
  try {
    const { email } = req.body;
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
      } else {
        const token = buffer.toString("hex");
        const student = await Student.findOne({ email });
        if (!student) {
          return res.status(422).json({ error: "user does not found" });
        } else {
          student.resettoken = token;
          student.expiretoken = Date.now() + 3600000;
          await student.save();
          const to = student.email;
          const from = "z6680362@gmail.com";
          const subject = "reset password link";
          const html = `
                         <div
                           style="
                             text-align: center;
                             background-color: rgb(255, 193, 122);
                             margin-left: 00px;
                             margin-right: 00px;
                             padding-top: 1px;
                             padding-bottom: 70px;
                           "
                         >
                           <h2>Tipster</h2>
                           <h4 style="margin-top: -20px">A Digital Batch Advisor</h4>
                           <div>
                             <div
                               style="
                                 background-color: rgb(255, 255, 255);
                                 margin-left: 30px;
                                 margin-right: 30px;
                                 padding-top: 30px;
                                 padding-bottom: 30px;
                                 border-radius: 5px;
                               "
                             >
                               <form action="">
                                 <h3 style="display: inline">Hello</h3>
                                 <h3 style="display: inline">${student.name},</h3>
                                 <h2>Forgot your password?</h2>
                                 <p style="font-size: 18px; padding-top: 10px">
                                   That's okay, it happens! Click on the button <br />below to reset
                                   your password.
                                 </p>
                                 <button
                                   style="
                                     background-color: rgb(0, 30, 129);
                                     padding: 10px 10px 10px 10px;
                                     border: none;
                                     border-radius: 5px;
                                     font-weight: bold;
                                     margin-top: 10px;
                                     color: white;
                                   "
                                 ><a href="http://localhost:3000/NewStudentPassword/${token}">
                                   RESET YOUR PASSWORD
                                 </button>
                                 <h4 style="margin-top: 40px; font-size: 15px">Regards,</h4>
                                 <h4 style="margin-top: -20px; font-size: 15px">The Tipster Team</h4>
                               </form>
                             </div>
                           </div>
                         </div>
                                          
                     `;
          await sendEmail(to, from, subject, html);
          res.status(200).send("email send");
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});
//reset password email for batchadvisor
router.post("/BA_sendresetemail", async (req, res) => {
  try {
    const { email } = req.body;
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
      } else {
        const token = buffer.toString("hex");
        const batchadvisor = await BatchAdvisor.findOne({ email });
        console.log(batchadvisor);
        if (!batchadvisor) {
          return res.status(422).json({ error: "user does not found" });
        } else {
          batchadvisor.resettoken = token;
          batchadvisor.expiretoken = Date.now() + 3600000;
          await batchadvisor.save();
          //  console.log(batchadvisor);
          const to = batchadvisor.email;
          const from = "z6680362@gmail.com";
          const subject = "reset password link";
          const html = `
                         <div
                           style="
                             text-align: center;
                             background-color: rgb(255, 193, 122);
                             margin-left: 00px;
                             margin-right: 00px;
                             padding-top: 1px;
                             padding-bottom: 70px;
                           "
                         >
                           <h2>Tipster</h2>
                           <h4 style="margin-top: -20px">A Digital Batch Advisor</h4>
                           <div>
                             <div
                               style="
                                 background-color: rgb(255, 255, 255);
                                 margin-left: 30px;
                                 margin-right: 30px;
                                 padding-top: 30px;
                                 padding-bottom: 30px;
                                 border-radius: 5px;
                               "
                             >
                               <form action="">
                                 <h3 style="display: inline">Hello</h3>
                                 <h3 style="display: inline">${batchadvisor.name},</h3>
                                 <h2>Forgot your password?</h2>
                                 <p style="font-size: 18px; padding-top: 10px">
                                   That's okay, it happens! Click on the button <br />below to reset
                                   your password.
                                 </p>
                                 <button
                                   style="
                                     background-color: rgb(0, 30, 129);
                                     padding: 10px 10px 10px 10px;
                                     border: none;
                                     border-radius: 5px;
                                     font-weight: bold;
                                     margin-top: 10px;
                                     color: white;
                                   "
                                 ><a href="http://localhost:3000/NewBatchAdvisorPassword/${token}">
                                   RESET YOUR PASSWORD
                                 </button>
                                 <h4 style="margin-top: 40px; font-size: 15px">Regards,</h4>
                                 <h4 style="margin-top: -20px; font-size: 15px">The Tipster Team</h4>
                               </form>
                             </div>
                           </div>
                         </div>
                                          
                     `;
          await sendEmail(to, from, subject, html);
          res.status(200).send("email send");

          //  const msg = {
          //      to: "user.email",
          //      from: "z6680362@gmail.com",
          //      subject: "for reset Password",
          //      html: `
          //    <p>hfdsfgdsjfgdsfgsjdfgdsgf</p>
          //    <h5>link in this <a href="http://localhost:3000/NewBatchAdvisorPassword/${token}">link</a> to reset</h5>
          //   `
          //  }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});
//reset password for student
router.put("/S_resetpassword", async (req, res) => {
  try {
    const { new_password, confirm_password } = req.body;
    const sentToken = req.body.token;
    if (!new_password || !confirm_password) {
      return res.status(400).json({ error: "filled the data" });
    }
    if (new_password != confirm_password) {
      return res.status(400).json({ error: "confirm password does not match" });
    }
    // console.log(new_password);
    const student = await Student.findOne({
      resettoken: sentToken,
      expiretoken: { $gt: Date.now() },
    });
    //  console.log(user)
    if (!student) {
      res.status(422).json({ error: "token expire" });
    }
    //  const user = await User.findById(req.rootuser);
    //  console.log("Refeded");
    student.password = new_password;
    student.resettoken = undefined;
    student.expiretoken = undefined;
    await student.save();
    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.log(error);
  }
});
//Drop course request
router.post("/dropCourse_Request", S_authenticate, async (req, res) => {
  const { reason, courseName } = req.body;
  // console.log(reason)
  // console.log(courseName)
  try {
    const user = req.rootuser;
    const {
      name,
      email,
      contactNo,
      address,
      section,
      batch,
      semester,
      registrationId,
    } = user;
    const CGPA = user.Result[0].CGPA;
    if (semester === 1) {
      const record = req.rootuserSemester1;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      if (cred >= 15) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester1[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section,
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          //check that already course will be added or  not
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            // console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request is already in pending");
          }
        }
      } else {
        res.status(400).send(
          "First add some course and then drop ----your credits hours less"
        );
      }
    } else if (semester === 2) {
      const record = req.rootuserSemester2;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      //  console.log("first",cred)
      if (cred >= 15) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester2[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request in pending");
          }
        }
      } else {
        res.status(400).send("First  add some course and then drop");
      }
    } else if (semester === 3) {
      const record = req.rootuserSemester3;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      //  console.log("first",cred)
      if (cred >= 15) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester3[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request in pending");
          }
        }
      } else {
        res.status(400).send("First some course and then drop");
      }
    } else if (semester === 4) {
      const record = req.rootuserSemester4;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      //  console.log("first",cred)
      if (cred >= 15) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester4[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits,
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request in pending");
          }
        }
      } else {
        res.status(400).send("First some course and then drop");
      }
    } else if (semester === 5) {
      const record = req.rootuserSemester5;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      //  console.log("first",cred)
      if (cred >= 15) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester5[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits,
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request in pending");
          }
        }
      } else {
        res.status(400).send("First some course and then drop");
      }
    } else if (semester === 6) {
      const record = req.rootuserSemester6;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      //  console.log("first",cred)
      if (cred >= 15) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester6[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request in pending");
          }
        }
      } else {
        res.status(400).send("First some course and then drop");
      }
    } else if (semester === 7) {
      const record = req.rootuserSemester7;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      //  console.log("first",cred)
      if (cred >= 15) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester7[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request in pending");
          }
        }
      } else {
        res.status(400).send("First some course and then drop");
      }
    } else if (semester === 8) {
      const record = req.rootuserSemester8;
      var cred = 0;
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].status === "enrolled") {
          cred += record[i].credits;
        }
      }
      console.log(cred)
      if (cred >= 5) {
        var abc = "";
        for (var i = 0; i < record.length; i++) {
          console.log(i);
          if (record[i].courseName === courseName) {
            abc = i;
          }
        }
        const courseCode = record[abc].courseCode;
        const credits = record[abc].credits;
        user.Result[0].Semester8[abc].status = "Drop Pending";
        const box = await CourseRequest.findOne({ registrationId });
        if (!box) {
          const data = new CourseRequest({
            batch,
            registrationId,
            semester: semester,
            name: name,
            email: email,
            contactNo: contactNo,
            address: address,
            CGPA: CGPA,
            section:section
          });
          await user.save();
          await data.save();
          await data.Courses1(courseCode, reason, courseName, credits);
          await data.save();
          res.send(data);
        } else {
          var match = "";
          for (var i = 0; i < box.courses.length; i++) {
            console.log(i);
            if (box.courses[i].courseName === courseName) {
              match = i;
            }
          }
          if (match === "") {
            console.log("first");
            await user.save();
            await box.Courses1(
              courseCode,
              reason,
              courseName,
              credits
            );
            await box.save();
            res.send(box);
          } else {
            console.log("first");
            res.status(400).send("this course request in pending");
          }
        }
      } else {
        res.status(400).send("First some course and then drop");
      }
    } else {
      res.status(400).send("error");
    }
  } catch (error) {
    res.status(400).send(error)
  }
});
//----------------------home page  batch advisor------------------
//freeze requests
//drop pending request
//add pending requets
router.get("/drop_pending", BA_authenticate, async (req, res) => {
  const batchadvisor = req.rootuser;
  const batch = batchadvisor.batch;
  const data1=await FreezeSemester.find({batch})
  const data2=await AddCourse.find({batch})
  const data = await CourseRequest.find({ batch });
  if (!data && !data1 && !data2) {
    res.status(400).send("no record found");
  } else {
    const data3=data.concat(data1,data2)
    res.status(200).send(data3);
  }
});
//drop course form on ok
router.post("/dropcoursess", async (req, res) => {
  const { registrationId } = req.body;
  const data = await CourseRequest.findOne({ registrationId });
  if (!data) {
    res.status(400).send("no record found");
  } else {
    const data1 = await Student.findOne({ registrationId });
    if (data.semester === 1) {
      for (var i = 0; i < data1.Result[0].Semester1.length; i++) {
        if (data1.Result[0].Semester1[i].status === "pending") {
          await data1.Result[0].Semester1.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    } else if (data.semester === 2) {
      for (var i = 0; i < data1.Result[0].Semester2.length; i++) {
        if (data1.Result[0].Semester2[i].status === "pending") {
          await data1.Result[0].Semester2.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    } else if (data.semester === 3) {
      for (var i = 0; i < data1.Result[0].Semester3.length; i++) {
        if (data1.Result[0].Semester3[i].status === "pending") {
          await data1.Result[0].Semester3.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    } else if (data.semester === 4) {
      for (var i = 0; i < data1.Result[0].Semester4.length; i++) {
        if (data1.Result[0].Semester4[i].status === "pending") {
          await data1.Result[0].Semester4.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    } else if (data.semester === 5) {
      for (var i = 0; i < data1.Result[0].Semester5.length; i++) {
        if (data1.Result[0].Semester5[i].status === "pending") {
          await data1.Result[0].Semester5.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    } else if (data.semester === 6) {
      for (var i = 0; i < data1.Result[0].Semester6.length; i++) {
        if (data1.Result[0].Semester6[i].status === "pending") {
          await data1.Result[0].Semester6.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    } else if (data.semester === 7) {
      for (var i = 0; i < data1.Result[0].Semester7.length; i++) {
        if (data1.Result[0].Semester7[i].status === "pending") {
          await data1.Result[0].Semester7.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    } else if (data.semester === 8) {
      for (var i = 0; i < data1.Result[0].Semester2.length; i++) {
        if (data1.Result[0].Semester2[i].status === "pending") {
          await data1.Result[0].Semester2.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      res.send("dleeted");
    }
  }
  //ok kerna per is student ka from ma jitna record sab khatam aur student ma drop pendeing student sa deletee ho jai ho jai status
  //mailsend ho jai form k
});
//reject drop course
router.delete("/delete_DropRequest", async (req, res) => {
  console.log(req.body.courseName)
  const { courseName, registrationId, } = req.body;
  const data = await CourseRequest.findOne({ registrationId });
  if (!data) {
    res.status(400).send("no course found ");
  } else {
    // console.log(data.courses.length);
    for (var i = 0; i < data.courses.length; i++) {
      if (courseName === data.courses[i].courseName) {
        console.log(data.courses[i].courseName);
        // console.log("fef", i);
        await data.courses.splice(i, 1);
        await data.save()
        if(data.courses.length===0){
          await data.delete();
        }
        // await data.save();
        const data1 = await Student.findOne({ registrationId });
        console.log(data1);
        if (!data1) {
          res.status(400).send("no student found that request for drop course");
        } else {
          if (data.semester === 1) {
            for (var j = 0; j < data1.Result[0].Semester1.length; j++) {
              if (data1.Result[0].Semester1[j].courseName === courseName) {
                // console.log(data1.Result[0].Semester1[j].status);
                data1.Result[0].Semester1[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          } else if (data.semester === 2) {
            for (var j = 0; j < data1.Result[0].Semester2.length; j++) {
              if (data1.Result[0].Semester2[j].courseName === courseName) {
                console.log(data1.Result[0].Semester2[j].status);
                data1.Result[0].Semester2[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          } else if (data.semester === 3) {
            for (var j = 0; j < data1.Result[0].Semester3.length; j++) {
              if (data1.Result[0].Semester3[j].courseName === courseName) {
                console.log(data1.Result[0].Semester3[j].status);
                data1.Result[0].Semester3[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          } else if (data.semester === 4) {
            for (var j = 0; j < data1.Result[0].Semester4.length; j++) {
              if (data1.Result[0].Semester4[j].courseName === courseName) {
                console.log(data1.Result[0].Semester4[j].status);
                data1.Result[0].Semester4[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          } else if (data.semester === 5) {
            for (var j = 0; j < data1.Result[0].Semester5.length; j++) {
              if (data1.Result[0].Semester5[j].courseName === courseName) {
                console.log(data1.Result[0].Semester5[j].status);
                data1.Result[0].Semester5[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          } else if (data.semester === 6) {
            for (var j = 0; j < data1.Result[0].Semester6.length; j++) {
              if (data1.Result[0].Semester6[j].courseName === courseName) {
                console.log(data1.Result[0].Semester6[j].status);
                data1.Result[0].Semester6[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          } else if (data.semester === 7) {
            for (var j = 0; j < data1.Result[0].Semester7.length; j++) {
              if (data1.Result[0].Semester7[j].courseName === courseName) {
                console.log(data1.Result[0].Semester7[j].status);
                data1.Result[0].Semester7[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          } else if (data.semester === 8) {
            for (var j = 0; j < data1.Result[0].Semester8.length; j++) {
              if (data1.Result[0].Semester8[j].courseName === courseName) {
                console.log(data1.Result[0].Semester8[j].status);
                data1.Result[0].Semester8[j].status = "enrolled";
                await data1.save();
                res.send("deleted");
              }
            }
          }
        }
      }
    }
  }
});
//jis course ka deletee button per click kra delete ho jai
//student ka schema ma sa bi ja ka update ker da

//---------------------------------ADD DROP FORM-------------------
router.get("/Add_Drop_Form/:registrationId",async (req,res) =>{
  try {
    const {registrationId}=req.params;
    const data= await CourseRequest.findOne({registrationId})
    if(!data){
      res.status(400).send("no record found");
    }else{
      res.status(200).send(data);
    }
    
  } catch (error) {
    console.log(error)
  }
  
})
//----------------------FREEZE FORM-------------------
router.get("/Freeze_Form/:registrationId",async (req,res) =>{
  try {
    const {registrationId}=req.params;
    const data= await FreezeSemester.findOne({registrationId})
    if(!data){
      res.status(400).send("no record found");
    }else{
      res.status(200).send(data);
    }
    
  } catch (error) {
    console.log(error)
  }
  
})
//reset password for batchadvisor
router.put("/BA_resetpassword", async (req, res) => {
  try {
    const { new_password, confirm_password } = req.body;
    const sentToken = req.body.token;
    if (!new_password || !confirm_password) {
      return res.status(400).json({ error: "filled the data" });
    }
    if (new_password != confirm_password) {
      return res.status(400).json({ error: "confirm password does not match" });
    }
    console.log(new_password);
    const batchadvisor = await BatchAdvisor.findOne({
      resettoken: sentToken,
      expiretoken: { $gt: Date.now() },
    });
    //  console.log(user)
    if (!batchadvisor) {
      res.status(422).json({ error: "token expire" });
    }
    batchadvisor.password = new_password;
    batchadvisor.resettoken = undefined;
    batchadvisor.expiretoken = undefined;
    await batchadvisor.save();
    //  sendToken(user, 200, res)
    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.log(error);
  }
});
//PAST PAPER
//view pastpaper
router.get("/papers/:course_title/:paper_type/:session", async (req, res) => {
  try {
    const searchField1 = req.params.course_title;
    const searchField2 = req.params.paper_type;
    const searchField3 = req.params.session;
    console.log(searchField1);
    const data = await Pastpaper.find({
      course_title: {
        $regex: searchField1,
        $options: "$eq",
      },
      paper_type: {
        $regex: searchField2,
        $options: "$eq",
      },
      session: {
        $regex: searchField3,
        $options: "$eq",
      },
    });
    if (!data) {
      res.status(200).send("no record found");
    } else {
      res.status(200).send(data);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
//view specific file
router.get("/papers/:_id", async (req, res) => {
  try {
    const data = await Pastpaper.findById(req.params._id);
    if (!data) {
      res.status(200).send("no record found");
    } else {
      res.status(200).send(data);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../frontend/public/PastPapers");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      // res.send("only pdf alloowed")
      // return (cb(new Error('Only .pdf  format allowed!')));
    }
  },
});
//upload pastpaper
router.post("/upload_pastpapers",upload.single("paper"),S_authenticate,async (req, res) => {
    try {
      const uploadpaper = new Pastpaper({
        course_title: req.body.course_title,
        paper_type: req.body.paper_type,
        session: req.body.session,
        paper: `/PastPapers/${req.file.filename}`,
        paper_name: req.file.filename,
      });
      //  console.log("2")
      if (!uploadpaper) {
        res.status(400).send("eroor");
      } else {
        console.log(uploadpaper);
        await uploadpaper.save();
        res.send(uploadpaper);
      }
    } catch (error) {
      res.status(400).send("erroor");
    }
  }
);
//studentsindormations
router.get("/StudentsInformations", BA_authenticate, async (req, res) => {
  try {
    const data = req.rootuser;
    console.log(data);
    const batch = data.batch;
    console.log(batch);
    const studentDetail = await Student.find({ batch: batch });
    if (!studentDetail) res.status(400).send("error");
    else {
      res.send(studentDetail);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
//get student result card
router.get("/StudentResult/:_id", async (req, res) => {
  try {
    const data = await Student.findById(req.params._id);

    if (!data) {
      res.status(200).send("no record found");
    } else {
      res.status(200).send(data.Result[0]);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
//view result
router.get("/student_result/:registrationId", async (req, res) => {
  const {registrationId}=req.params
  // const { registrationId } = req.body;
  const data = await Student.findOne({ registrationId });
  if (!data) {
    res.send("no record found");
  } else {
    if (data.semester === 1) {
      const data1 = data.Result[0].Semester1;
      res.status(200).send(data1);
    } else if (data.semester === 2) {
      const data1 = data.Result[0].Semester1.concat(1,data.Result[0].Semester2);
      res.status(200).send(data1);
    } else if (data.semester === 3) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1
      );
      res.status(200).send(data1);
    } else if (data.semester === 4) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
      );
      res.status(200).send(data1);
    } else if (data.semester === 5) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
      );
      res.status(200).send(data1);
    } else if (data.semester === 6) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
        data.Result[0].Semester6,1,
      );
      res.status(200).send(data1);
    } else if (data.semester === 7) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
        data.Result[0].Semester6,1,
        data.Result[0].Semester7,1
      );
      res.status(200).send(data1);
    } else if (data.semester === 8) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
        data.Result[0].Semester6,1,
        data.Result[0].Semester7,1,
        data.Result[0].Semester8,1,
      );
      res.status(200).send(data1);
    } else if (data.semester === 9) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
        data.Result[0].Semester6,1,
        data.Result[0].Semester7,1,
        data.Result[0].Semester8,1,
        data.Result[0].Semester9,1
      );
      res.status(200).send(data1);
    } else if (data.semester === 10) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
        data.Result[0].Semester6,1,
        data.Result[0].Semester7,1,
        data.Result[0].Semester8,1,
        data.Result[0].Semester9,1,
        data.Result[0].Semester10,1
      );
      res.status(200).send(data1);
    } else if (data.semester === 11) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
        data.Result[0].Semester6,1,
        data.Result[0].Semester7,1,
        data.Result[0].Semester8,1,
        data.Result[0].Semester9,1,
        data.Result[0].Semester10,1,
        data.Result[0].Semester11,1
      );
      res.status(200).send(data1);
    } else if (data.semester === 12) {
      const data1 = data.Result[0].Semester1.concat(1,
        data.Result[0].Semester2,1,
        data.Result[0].Semester3,1,
        data.Result[0].Semester4,1,
        data.Result[0].Semester5,1,
        data.Result[0].Semester6,1,
        data.Result[0].Semester7,1,
        data.Result[0].Semester8,1,
        data.Result[0].Semester9,1,
        data.Result[0].Semester10,1,
        data.Result[0].Semester11,1,
        data.Result[0].Semester12,1
      );
      res.status(200).send(data1);
    }
  }
});
//for repeat courses
router.get("/repeatCourses", S_authenticate, async (req, res) => {
  const user = req.rootuser;
  const { semester } = user;
  if (semester === 1) {
    res.status(200).send("No course available for repeat");
  } else if (semester === 2) {
    const data = user.Result[0].Semester1;
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        var j = 0;
        await data1.push(data[i]);
        j++;
      }
    }
    res.send(data1);
  }else if (semester === 3) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
    );
    var data1 = [];                                 //store all courses that can repeat
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {             //no duplicate data enter
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    //check that the if he/she study that course later and improve gpa and that course remove from the repeat course array
    for (var i = 0; i < data.length; i++) {             
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.send(data1);
  }else if (semester === 4) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.send(data1);
  }else if (semester === 5) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.send(data1);
  }else if (semester === 6) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.send(data1);
  }else if (semester === 7) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.send(data1);
  }else if (semester === 8) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          // for (var k=0; k<data.length;k++){
          // if(data1[j].courseName===data[k].courseName){
          if (data[i].gp === data1[j].gp) {
            // console.log(data1)
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
              // console.log(data1)
              // await data1.save()
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              //  await data1.save()
              await data1.push(data[k]);
            }
          }
          // }
          // }
        }
      }
    }
    res.send(data1);
  }else if (semester === 9) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          // for (var k=0; k<data.length;k++){
          // if(data1[j].courseName===data[k].courseName){
          if (data[i].gp === data1[j].gp) {
            // console.log(data1)
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
              // console.log(data1)
              // await data1.save()
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              //  await data1.save()
              await data1.push(data[k]);
            }
          }
          // }
          // }
        }
      }
    }
    res.send(data1);
  }else if (semester === 10) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8,
      user.Result[0].Semester9
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          // for (var k=0; k<data.length;k++){
          // if(data1[j].courseName===data[k].courseName){
          if (data[i].gp === data1[j].gp) {
            // console.log(data1)
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
              // console.log(data1)
              // await data1.save()
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              //  await data1.save()
              await data1.push(data[k]);
            }
          }
          // }
          // }
        }
      }
    }
    res.send(data1);
  }else if (semester === 11) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8,
      user.Result[0].Semester9,
      user.Result[0].Semester10
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          // for (var k=0; k<data.length;k++){
          // if(data1[j].courseName===data[k].courseName){
          if (data[i].gp === data1[j].gp) {
            // console.log(data1)
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
              // console.log(data1)
              // await data1.save()
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              //  await data1.save()
              await data1.push(data[k]);
            }
          }
          // }
          // }
        }
      }
    }
    res.send(data1);
  }else if (semester === 12) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8,
      user.Result[0].Semester9,
      user.Result[0].Semester10,
      user.Result[0].Semester11
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            } else {
              await data1.push(data[i]);
            }
          }
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          // for (var k=0; k<data.length;k++){
          // if(data1[j].courseName===data[k].courseName){
          if (data[i].gp === data1[j].gp) {
            // console.log(data1)
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
              // console.log(data1)
              // await data1.save()
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              //  await data1.save()
              await data1.push(data[k]);
            }
          }
          // }
          // }
        }
      }
    }
    res.send(data1);
  }
});
//-------------------FreezeSemester------------
router.post("/freezeSemester",S_authenticate,async(req,res)=>{
  const {reason,continuationTime}=req.body;
  const user=req.rootuser
  const {batch,registrationId,email,name,contactNo,address,semester,section}=user
  const {CGPA}=user.Result[0]
   const freeze= new FreezeSemester({
    batch,registrationId,semester,name,address,contactNo,email,CGPA,reason,section,continuationTime
  })
  if(!freeze){
    res.send("error")
  }else{
    await freeze.save()
    res.send(freeze)
  }
});
//reject Freeze semster request------------------
router.delete("/FreezeSemester_reject",async(req,res)=>{
  try {
    const {registrationId}=req.body;
    const data=await FreezeSemester.findOne({FreezeSemester})
    if(!data){
      res.status(400).send("no record found")
    }else{
      await data.delete();
      res.status(200).send("deleted");
    }
  } catch (error) {
    res.status(400).send(error)
  }
}) 

//----------------------------------ADD COURSE--------------------------
// on student side
//student add the course
router.post("/addcourse_request",S_authenticate, async (req,res)=>{
  try {
    const {courseName,courseCode,credits,reason,Section_to}=req.body
    const student=req.rootuser
    const {name,email,registrationId,contactNo,section,batch,address,semester}=student
    const CGPA = student.Result[0].CGPA;
    if(semester===1){
      res.status(400).send("in first semester you do not add any course")
    }else if(semester===2){
      console.log("first")
      const courses=req.rootuserSemester2
      let credit = 0;
      for (let i = 0; i < courses.length; i++) {
        credit +=courses[i].credits
      }
      console.log(credit,credits)
      if((credits==3 && credit<=18)||(credits==4 && credit <=17)){
        const data= await AddCourse.findOne({registrationId})
        // res.send(data)
        if(!data){
          const addcourse=new AddCourse({
            batch,
            registrationId,
            semester,
            name,
            email,
            contactNo,
            address,
            CGPA,
            section
            })
          await addcourse.save();
          await addcourse.add_course(courseName,courseCode,credits,reason,Section_to);
          await addcourse.save();
          res.send(addcourse);
        }else{

          for (let i = 0; i < data.courses.length; i++) {
            credit +=courses[i].credits
            }
          if((credits===3 && credit <=18)||(credits===4 && credit <=17)){
          //check that course is already added for add request or not
            let match = "";
            for (let i = 0; i < data.courses.length; i++) {
              console.log(i);
              if (data.courses[i].courseName === courseName) {
                match = i;
              }
            }
            if(match===""){
              await data.data_course(
                courseName,courseCode,credits,reason,Section_to
              );
              await data.save();
              res.status(200).send(data)
            }else{
              res.status(400).send("This course is already in add request state")
            }
          }
        }
      }else{
        res.status(400).send("you exceed the max limit..... Credit is more than 21")
      }
    }else if(semester===3){
      
    }else if(semester===4){
      
    }else if(semester===5){
      
    }else if(semester===6){
      
    }else if(semester===7){
      
    }else if(semester===8){
      
    }else if(semester===9){
      
    }else if(semester===10){
      
    }else if(semester===11){
      
    }else if(semester===12){
      
    }else{
      res.status(400).send("error: No course to add")
    }
  } catch (error) {
    res.status(400).send(error)
  }
})
//delete the course that add-------------student side
router.delete("/delete_addcourse_request",S_authenticate,async(req,res)=>{
  try {
    const {courseName}=req.body
    const user=req.rootuser
    const {registrationId}=user
     const record= await AddCourse.findOne({registrationId:registrationId}) 
     if(!record){
       res.status(400).send("no record found")
     }else{
      for (let i = 0; i < record.courses.length; i++) {
        if (record.courses[i].courseName === courseName) {
          await record.courses.splice(i, 1);
          await record.save();
          res.send("deleted");
        }
      }
      if(record.courses.length===0){
        await record.delete();
      }
     } 
      
  } catch (error) {
    res.status(400).send(error)
  }
})
//-----------------------multer----------
const feestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../frontend/public/feeChallan");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload_fee = multer({
  storage: feestorage});
//upload fee challan and submit it ----------student side
router.post("/submit_AddForm",upload_fee.single("fee"),S_authenticate, async (req, res) => {
try {
  const {courses}=req.body;
    const student=req.rootuser
    const {batch,registrationId,semester,name,email,section,address,request,contactNo}=student
    const {CGPA}=student.Result[0]
    const data=await AddCourse.findOne({registrationId})
    if(!data){
      const add= new AddCourse({
        fee: `/feeChallan/${req.file.filename}`,
        batch,
        registrationId,
        semester,
        name,
        email,
        section,
        address,
        request,
        contactNo,
        CGPA,
  
      })
      console.log(courses.length)
      for(let i=0;i<courses.length;i++){
        await add.add_course(courses[i].courseName,courses[i].courseCode,courses[i].credits,courses[i].Section_to)
        await add.save();
      }
      res.send(add)  
    }else{
    console.log(data.courses.length)
    for(let i=0;i<data.courses.length;i++){
      await data.add_course(courses[i].courseName,courses[i].courseCode,courses[i].credits,courses[i].Section_to)
      await data.save();
    }
    res.send(data)
    }
    
} catch (error) {
  res.status(400).send(error)
}     
  });
//for add course get  creidts hours
router.get("/credit_hour",S_authenticate, async(req,res)=>{
try {
      const student=req.rootuser
      const {registrationId,semester}=student
      const data= await Student.findOne({registrationId})
      if(!data){
        res.status(400).send("no record found")
      }else{
        if(semester===1){
        let credit = 0;   
        for (let i = 0; i < data.Result[0].Semester1.length; i++) {
          credit +=data.Result[0].Semester1[i].credits
        }
        res.json(credit);
        }
      }
      
} catch (error) {
  res.status(400).send(error)
}  
})
//get the specific student add request ( Add Form )
router.get("/AddForm",BA_authenticate,async(req,res)=>{
  try {
    const {registrationId}=req.body;
    const data= await AddCourse.findOne({registrationId})
    if(!data){
      res.status(400).send("no record found");
    }else{
      res.status(200).send(data);
    }
  } catch (error) {
    console.log(error)
  }
})
//delete the specific course add request ( Add Form )
router.delete("/delete_add_course",async(req,res)=>{
  try {
    const { courseName, registrationId, } = req.body;
    const data = await AddCourse.findOne({ registrationId });
    if(!data){
      res.status(400).send("no record found")
    }else{
      for(let i=0;i<data.courses.length;i++){
        if(data.courses[i].courseName===courseName){
          await data.courses.splice(i,1)
          await data.save();
          res.status(200).send("deleted successfully")
        }
      }
    }
  } catch (error) {
    res.status(400).send(error)
  }
})
//-----------------office hours------------------

router.post("/officehours/:day/:from/:to",BA_authenticate, async(req,res)=>{
  const {day,from,to}=req.params
  // console.log(day,from,to)
  const user=req.rootuser
  const {batch}=user
  const officehour= await OfficeHour.findOne({batch})
  if(!officehour){
    if(to!="--"){
      res.status(400).send("please first select the from time")
    }
    const add=new OfficeHour({
      batch
    })
    if(day==="Monday"){
      const to_time=from;
      await add.addMonday(day,from,to_time);
      const {abc1,abc2,abc3}="--"
      console.log(abc2)
      await add.addTuesday(abc1,abc2,abc3);
      await add.addWednesday(abc1,abc2,abc3);
      await add.addThursday(abc1,abc2,abc3);
      await add.addFriday(abc1,abc2,abc3);
      await add.save()
      res.send(add)
    }else if(day==="Tuesday"){
      const to_time=from;
      await add.addTuesday(day,from,to_time);
      const {abc1,abc2,abc3}="--"
      await add.addMonday(abc1,abc2,abc3);
      await add.addWednesday(abc1,abc2,abc3);
      await add.addThursday(abc1,abc2,abc3);
      await add.addFriday(abc1,abc2,abc3);
      await add.save()
      res.send(add)
    }else if(day==="Wednesday"){
      const to_time=from;
      await add.addWednesday(day,from,to_time);
      const {abc1,abc2,abc3}="--"
      await add.addTuesday(abc1,abc2,abc3);
      await add.addMonday(abc1,abc2,abc3);
      await add.addThursday(abc1,abc2,abc3);
      await add.addFriday(abc1,abc2,abc3);
      await add.save()
      res.send(add)
    }else if(day==="Thursday"){
      const to_time=from;
      await add.addThursday(day,from,to_time);
      const {abc1,abc2,abc3}="--"
      await add.addTuesday(abc1,abc2,abc3);
      await add.addWednesday(abc1,abc2,abc3);
      await add.addMonday(abc1,abc2,abc3);
      await add.addFriday(abc1,abc2,abc3);
      await add.save()
      res.send(add)
    }else if(day==="Friday"){
      const to_time=from;
      await add.addFriday(day,from,to_time);
      const {abc1,abc2,abc3}="--"
      await add.addTuesday(abc1,abc2,abc3);
      await add.addWednesday(abc1,abc2,abc3);
      await add.addThursday(abc1,abc2,abc3);
      await add.addMonday(abc1,abc2,abc3);
      await add.save()
      res.send(add)  
    }else{
      res.status(400).send("please enter the correct day")
    }
  }else{
    
    if(day==="Monday"){
      if(from==="a"||to==="a"){
        officehour.Monday[0].from="--"
        officehour.Monday[0].to="--"
        await officehour.save()
      }else{
      if(officehour.Monday[0].day==="Monday"){
        if(officehour.Monday[0].from==="--" && from!="--"){
          officehour.Monday[0].from=from;
          officehour.Monday[0].to=from;
          await officehour.save()
          res.send(officehour)
        }else if(to==="--" && officehour.Monday[0].from!="--"){
            officehour.Monday[0].from=from;
            officehour.Monday[0].to=from;
            await officehour.save()
            res.send(officehour)
        }else if(to!="--" && officehour.Monday[0].from==="--"){
          res.status(400).send("please select the from time first")
        }else if(to!="--" && officehour.Monday[0].from!="--"){
          if(officehour.Monday[0].from.charAt(0)<=to.charAt(0)){
            if(officehour.Monday[0].from.charAt(1)<=to.charAt(1)){
              if(officehour.Monday[0].from.charAt(3)<=to.charAt(3)){
                if(officehour.Monday[0].from.charAt(4)<=to.charAt(4)){
                  officehour.Monday[0].to=to;
                  await officehour.save()
                  console.log("first")
                  res.send(officehour)                        
                }else{
                  res.status(400).send("to time less than from time")
                }
              }else{
                res.status(400).send("to time less than from time")
              }
            }else{
              res.status(400).send("to time less than from time")
            }
          }else{
            res.status(400).send("to time less than from time")
          }
        }else{
          res.status(400).send("error")
        }
      }
    } 
    }else if(day==="Tuesday"){
      if(from==="a"||to==="a"){
        officehour.Tuesday[0].from="--"
        officehour.Tuesday[0].to="--"
        await officehour.save()
        res.send(officehour)
      }else{
      if(officehour.Tuesday[0].day==="Tuesday"){
        if(officehour.Tuesday[0].from==="--" && from!="--"){
          officehour.Tuesday[0].from=from;
          officehour.Tuesday[0].to=from;
          await officehour.save()
          res.send(officehour)
        }else if(to==="--" && officehour.Tuesday[0].from!="--"){
          officehour.Tuesday[0].from=from;
          officehour.Tuesday[0].to=from;
          await officehour.save()
          res.send(officehour)
      }else if(to!="--" && officehour.Tuesday[0].from==="--"){
        res.status(400).send("please select the from time first")
      }else if(to!="--" && officehour.Tuesday[0].from!="--"){
        if(officehour.Tuesday[0].from.charAt(0)<=to.charAt(0)){
          if(officehour.Tuesday[0].from.charAt(1)<=to.charAt(1)){
            if(officehour.Tuesday[0].from.charAt(3)<=to.charAt(3)){
              if(officehour.Tuesday[0].from.charAt(4)<=to.charAt(4)){
                officehour.Tuesday[0].to=to;
                await officehour.save()
                console.log("first")
                res.send(officehour)                        
              }else{
                res.status(400).send("to time less than from time")
              }
            }else{
              res.status(400).send("to time less than from time")
            }
          }else{
            res.status(400).send("to time less than from time")
          }
        }else{
          res.status(400).send("to time less than from time")
        }
      }else{
        res.status(400).send("error")
      }
      }
    }
    }else if(day==="Wednesday"){
      if(from==="a"||to==="a"){
        officehour.Wednesday[0].from="--"
        officehour.Wednesday[0].to="--"
        await officehour.save()
      }else{
      if(officehour.Wednesday[0].day==="Wednesday"){
        if(officehour.Wednesday[0].from==="--" && from!="--"){
          officehour.Wednesday[0].from=from;
          officehour.Wednesday[0].to=from;
          await officehour.save()
          res.send(officehour)
        }else if(to==="--" && officehour.Wednesday[0].from!="--"){
          officehour.Wednesday[0].from=from;
          officehour.Wednesday[0].to=from;
          await officehour.save()
          res.send(officehour)
      }else if(to!="--" && officehour.Wednesday[0].from==="--"){
        res.status(400).send("please select the from time first")
      }else if(to!="--" && officehour.Wednesday[0].from!="--"){
        if(officehour.Wednesday[0].from.charAt(0)<=to.charAt(0)){
          if(officehour.Wednesday[0].from.charAt(1)<=to.charAt(1)){
            if(officehour.Wednesday[0].from.charAt(3)<=to.charAt(3)){
              if(officehour.Wednesday[0].from.charAt(4)<=to.charAt(4)){
                officehour.Wednesday[0].to=to;
                await officehour.save()
                console.log("first")
                res.send(officehour)                        
              }else{
                res.status(400).send("to time less than from time")
              }
            }else{
              res.status(400).send("to time less than from time")
            }
          }else{
            res.status(400).send("to time less than from time")
          }
        }else{
          res.status(400).send("to time less than from time")
        }
      }else{
        res.status(400).send("error")
      }
      }
    }
    }else if(day==="Thursday"){
      if(from==="a"||to==="a"){
        officehour.Thursday[0].from="--"
        officehour.Thursday[0].to="--"
        await officehour.save()
      }else{
      if(officehour.Thursday[0].day==="Thursday"){
        if(officehour.Thursday[0].from==="--" && from!="--"){
          officehour.Thursday[0].from=from;
          officehour.Thursday[0].to=from;

          await officehour.save()
          res.send(officehour)
        }else if(to==="--" && officehour.Thursday[0].from!="--"){
          officehour.Thursday[0].from=from;
          officehour.Thursday[0].to=from;
          await officehour.save()
          res.send(officehour)
      }else if(to!="--" && officehour.Thursday[0].from==="--"){
        res.status(400).send("please select the from time first")
      }else if(to!="--" && officehour.Thursday[0].from!="--"){
        if(officehour.Thursday[0].from.charAt(0)<=to.charAt(0)){
          if(officehour.Thursday[0].from.charAt(1)<=to.charAt(1)){
            if(officehour.Thursday[0].from.charAt(3)<=to.charAt(3)){
              if(officehour.Thursday[0].from.charAt(4)<=to.charAt(4)){
                officehour.Thursday[0].to=to;
                await officehour.save()
                console.log("first")
                res.send(officehour)                        
              }else{
                res.status(400).send("to time less than from time")
              }
            }else{
              res.status(400).send("to time less than from time")
            }
          }else{
            res.status(400).send("to time less than from time")
          }
        }else{
          res.status(400).send("to time less than from time")
        }
      }else{
        res.status(400).send("error")
      }
      }
    }
    }else if(day==="Friday"){
      if(from==="a"||to==="a"){
        officehour.Friday[0].from="--"
        officehour.Friday[0].to="--"
        await officehour.save()
      }else{
      if(officehour.Friday[0].day==="Friday"){
        if(officehour.Friday[0].from==="--" && from!="--"){
          officehour.Friday[0].from=from;
          officehour.Friday[0].to=to;
          await officehour.save()
          res.send(officehour)
        }else if(to==="--" && officehour.Friday[0].from!="--"){
          officehour.Friday[0].from=from;
          officehour.Friday[0].to=from;
          await officehour.save()
          res.send(officehour)
      }else if(to!="--" && officehour.Friday[0].from==="--"){
        res.status(400).send("please select the from time first")
      }else if(to!="--" && officehour.Friday[0].from!="--"){
       
        if(officehour.Friday[0].from.charAt(0)<=to.charAt(0)){
          if(officehour.Friday[0].from.charAt(1)<=to.charAt(1)){
            if(officehour.Friday[0].from.charAt(3)<=to.charAt(3)){
              if(officehour.Friday[0].from.charAt(4)<=to.charAt(4)){
                officehour.Friday[0].to=to;
                await officehour.save()
                console.log("first")
                res.send(officehour)                        
              }else{
                res.status(400).send("to time less than from time")
              }
            }else{
              res.status(400).send("to time less than from time")
            }
          }else{
            res.status(400).send("to time less than from time")
          }
        }else{
          res.status(400).send("to time less than from time")
        }
      }else{
        res.status(400).send("error")
      }
      }
      // else{
      //   await officehour.addFriday(day,from,to);
      //   await officehour.save()
      //   res.send(officehour)
      // } 
    } 
    }else{
      res.status(400).send("please enter the correct day")
    }
  }
  
    })

//get office hours
router.get("/officehour",S_authenticate,async(req,res)=>{
  const user=req.rootuser
  const {batch}=user
  const data=await OfficeHour.findOne({batch})
  if(!data){
    res.send("error")
  }else{
    res.send(data)
  }
})
//get office hour for batch advisor
router.get("/officehours",BA_authenticate,async(req,res)=>{
  const user=req.rootuser
  const {batch}=user
  const data=await OfficeHour.findOne({batch})
  if(!data){
    res.send("error")
  }else{
    res.send(data)
  }
})
//-------------ChatBox-----------
//student chatbox
router.post("/sendmessage",S_authenticate,async(req,res)=>{
   const {subject,message}=req.body
   const user=req.rootuser
   const {registrationId,name,email,batch}=user
   const record=await ChatBox.findOne({registrationId})
   if(!record){
     const sendmessage=new ChatBox({
       registrationId,
       email,
       batch,
       subject
     })
     await sendmessage.chatbox(name,message)
     await sendmessage.save();
     res.send(sendmessage);
   }else{
    await record.chatbox(name,message)
    await record.save()
    res.send(record)
   }
})
//batchadvisor view message
router.get("/viewmessages",BA_authenticate,async(req,res)=>{
  try {
    const user=req.rootuser
    const {batch}=user
    const record=await ChatBox.find({batch})
    if(!record){
      res.status(400).send("error")
    }else{
      res.status(200).send(record)
    }
  } catch (error) {
    res.status(400).send(error)
  }
})
//student view message
router.get("/viewmessage",S_authenticate,async(req,res)=>{
  try {
    const user=req.rootuser
    const {registrationId}=user
    const record=await ChatBox.find({registrationId})
    if(!record){
      res.status(400).send("error")
    }else{
      res.status(200).send(record)
    }
  } catch (error) {
    res.status(400).send(error)
  }
})
//batchadvisor reply student message
router.post("/messageReply/:registrationId",BA_authenticate,async(req,res)=>{
  const {registrationId}=req.params
  const {message}=req.body
  const user=req.rootuser
  const {name}=user
  const record=await ChatBox.findOne({registrationId})
  if(!record){
    res.status(400).send("no record found")
  }else{
    console.log(name)
    await record.chatbox(name,message)
    await record.save()
    res.status(200).send(record);
  }
})
//delete chatbox
router.delete("/deleteChat/:registrationId",async(req,res)=>{  //can also use id
  const {registrationId}=req.params
  const record=await ChatBox.findOne({registrationId})
  if(!record){
    res.status(400).send("no record found")
  }else{
    await record.delete();
  }
})
// //delete specific sms
// router.delete("/delete_specific_chat_message/:_id",async(req,res)=>{
//   try {
//     const {_id}=req.params
//     const {registrationId}=req.body
//     const record=await ChatBox.findByIdAndDelete(
//       _id
//     )
//     if(!record){
//       res.status(400).send("error")
//     }else{
//       res.send("donbe")
//       // console.log(record.chat.length)
//       // for (let i=0;i<record.chat.length;i++){
//       //   console.log(record.chat[i]._id)
//       //     if(record.chat[i]._id===_id){
//       //     console.log("first")
//       //     await record.chat.splice(i,1)
//       //     await record.save();
//       //       res.send(record)
//       //   }
//       // }
//     }
//   } catch (error) {
//     res.status(400).send(error)
//   }

// })
module.exports = router;
