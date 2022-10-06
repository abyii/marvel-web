import course from "../models/course.js";
import user from "../models/user.js";

export const createCourse = async (req, res) => {
  try {
    // const newCourse = new course(courseData);
    // const createdCourse = await newCourse.save();
    // return res.json({createdCourse : createdCourse});
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
};

export const assignIns = async (req, res) => {
  // try {
  //     const ins = [
  //         { email: "grsharma2003@gmail.com", currentInsCourse: ["AI-ML-001"] },
  //         { email: "ananyacsebtech@gmail.com", currentInsCourse: ["AI-ML-001"] },
  //         { email: "bhargav.adya.510@gmail.com", currentInsCourse:["AI-ML-001"] },
  //         { email: "abhilashbhatt69@gmail.com", currentInsCourse:["IOT-001"] },
  //         { email: "yuankavumkal652@gmail.com", currentInsCourse: ["EV-RE-001", "IOT-001"] },
  //         { email: "pranava.shastry@gmail.com", currentInsCourse: ["D-P-001"] },
  //         { email: "rahul.sandli.ramesh@gmail.com", currentInsCourse: ["D-P-001"] },
  //         { email: "vineeth.raghavan02@gmail.com", currentInsCourse : ["CL-CY-001"], },
  //         { email: "meghuaithal@gmail.com", currentInsCourse: ["CL-CY-001"] },
  //         { email: "nitin.reddy340@gmail.com", currentInsCourse: ["EV-RE-001"] },
  //         { email: "mohammednowfal7228@gmail.com", currentInsCourse: ["EV-RE-001"] },
  //     ];
  //     let modifiedPeople = [];
  //     let person;
  //     ins.forEach( async (u)=>{
  //         person = {};
  //         person = await user.findOne({email : u?.email}).exec();
  //         if(!person){console.log(u?.email, "not found")}
  //         else if(person?.enrollmentStatus==="ACTIVE"&&person?.currentRole=='INS') {
  //             console.log("Already assigned",person?.email);
  //         }else if(person?.enrollmentStatus==='UNKNOWN'||person?.currentRole=='STU'){
  //             Object.assign(person, {
  //                 enrollmentStatus: "ACTIVE",
  //                 currentRole: "INS",
  //                 currentInsCourse : (ins.find((i)=>(i.email===person?.email))).currentInsCourse,
  //                 roleHistory:[...person?.roleHistory, {
  //                     role: "INS",
  //                     insCourse: (ins.find((i)=>(i.email===person?.email))).currentInsCourse,
  //                     startTime : new Date()
  //                 }]
  //             });
  //             const newDoc = await person.save();
  //             console.log(newDoc.name," got assigned ",newDoc.currentInsCourse,"\n");
  //         }else if(person?.currentRole=='INS'){
  //             console.log("edge case")
  //         }
  //     });
  // return res.json({modifiedPeople});
  // } catch (error) {
  //     return res.json({error});
  // }
};

export const assignStu = async (req, res) => {
  try {
    const aiml = [
      "liyana.zuhur@gmail.com",
      "abhinavpandeyjee@gmail.com",
      "shashankts123@gmail.com",
      "shreyashsuryawanshi926@gmail.com",
      "vikasuvcecs@gmail.com",
      "kg01062003@gmail.com",
    ];
    const clcy = [
      "bhavyajonnagadla01@gmail.com", //not acknowledged
      "sujayvikramuvce@gmail.com",
      "harshvardhanhpatil55@gmail.com",
      "ssshrushtib2021@gmail.com",
      "vinay.basavaraddi@gmail.com",
      "shashankgurunaga@gmail.com",
      "husoumya@gmail.com",
    ];
    const dp = [
      "jdarshan098@gmail.com",
      "nischithatiwari833@gmail.com",
      "somteakhiangte02@gmail.com",
      "k.lalrinchhana@gmail.com",
    ];
    const ev = [
      "bhuvankoonur68630@gmail.com",
      "xeomatrix369@gmail.com",
      "lokeshjinkala333@gmail.com",
      "prajwal.gkvk@gmail.com",
      "bharathtech15@gmail.com",
      "sureshaptel9210@gmail.com", //not acknowledged
    ];
    const iot = [
      "knabhishek02@gmail.com",
      "bhavidashok@gmail.com",
      "deepaksinghpanwar111@gmail.com",
      "shreyasdas54@gmail.com",
      "utkarshraghu9@gmail.com",
      "vishnuvb243@gmail.com",
      "sarithaac1753@gmail.com",
      "sushmitachougala5@gmail.com",
    ];
    const found = await user
      .find({ email: { $in: ["bhavyajonnagadla01@gmail.com"] } })
      .select(
        "name email currentStuCourse currentLevel currentRole roleHistory enrollmentStatus"
      )
      .lean();
    // const updated = await user.updateMany(
    //   {
    //     email: { $in: ["bhavyajonnagadla01@gmail.com"] },
    //   },
    //   {
    //     enrollmentStatus: "ACTIVE",
    //     currentRole: "STU",
    //     currentStuCourse: "CL-CY-001",
    //     currentLevel: 1,
    //     // currentInsCourse:["AI-ML-001"],
    //     $push: {
    //       roleHistory: [
    //         {
    //           role: "STU",
    //           // insCourse: ["AI-ML-001"],
    //           stuCourse: "CL-CY-001",
    //           startTime: new Date(),
    //         },
    //       ],
    //     },
    //   },
    //   { new: true, timestamps: true }
    // );
    return res.json({ found });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
};

export const play = async (req, res) => {
  try {
    // const updated = await user.updateMany(
    //     {
    //         email:{$in:[
    //             'uvcemarvel@gmail.com',
    //         ]}
    //     },
    //     {
    //         enrollmentStatus: "ACTIVE",
    //         currentRole: "INS",
    //         currentInsCourse : ['AI-ML-001','IOT-001','D-P-001','CL-CY-001','EV-RE-001'],
    //         roleHistory:[{
    //             role: "INS",
    //             insCourse: ['AI-ML-001','IOT-001','D-P-001','CL-CY-001','EV-RE-001'],
    //             startTime : new Date()
    //         }]
    //     },
    //     {new:true, timestamps:true}
    // );
    // return res.json(updated);
  } catch (error) {
    return res.json(error);
  }
};

export const play2 = async (req, res) => {
  try {
    // const find = await user.find({
    //             email:new RegExp("prath",'i')
    //         }).lean().exec();
    // return res.json(find);
  } catch (error) {
    return res.json(error);
  }
};

export const play3 = async (req, res) => {
  try {
    // const updated = await user.updateOne({'email':'anushalnayaka789@gmail.com'},
    // {
    //     enrollmentStatus:"ACTIVE",
    //     currentRole:"STU",
    //     currentStuCourse:"EV-RE-001",
    //     currentLevel: 1,
    //     // currentInsCourse:["AI-ML-001"],
    //     $push:{roleHistory:{
    //         role: "STU",
    //         insCourse: ['CL-CY-001'],
    //         startTime : new Date()
    //     }}
    // }, {new:true, timestamps:true});
    // return res.json({updated});
  } catch (error) {
    return res.json({ error });
  }
};
