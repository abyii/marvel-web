import mongoose from "mongoose";
import slug from 'mongoose-slug-generator';

mongoose.plugin(slug);

const userSchema = mongoose.Schema({
    slug :{type: String, slug : "name", unique : true},
    name: { type: String, required:  true },
    email: { type: String, required: true },
    profilePic : {type : String},
    regNo : { type : String },
    id: { type: String, required : true,unique:true },
    currentStuCourse : {type : String},
    currentInsCourse : { type : [String]},
    currentLevel : {type : String, enum : {values : ['1','2','3']}},
    currentRole : {type : String, enum : {values : ['STU','INS']}},
    rights: { type : String, enum : {values : ['MOD','USER']}, default:'USER'},
    joinedAt : {type : Date, default : new Date()},
    enrollmentStatus : { type : String, enum : {values : ['ACTIVE', 'INACTIVE', 'UNKNOWN']}, default : 'UNKNOWN'},
    bio : {type : String, maxLength : 200},
    gitHub : {type : String, maxLength:80},
    linkedIn : {type : String, maxLength:80},
    website : {type : String, maxLength:80},
});

export default mongoose.model("users", userSchema);