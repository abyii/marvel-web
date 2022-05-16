import mongoose from "mongoose";
import slug from 'mongoose-slug-generator';

mongoose.plugin(slug);

const projectReportSchema = mongoose.Schema({
    // IDENTITY DATA. CANNOT DIRECTLY EDIT
    authorId: { type : String, required : true },
    authorName : { type : String, required : true },
    authorSlug : { type : String, required:true},
    authorImage : {type : String},
    level : {type : Number, required:true},
    courseCode : {type : String, required:true},
    domain : {type : String, required:true},
    slug : {type : String, slug : ['title', 'authorName'], unique : true},

    // EDITABLE DATA
    title :{ type : String, maxLength : 120, required : true},
    content : { type : String, required : true, maxLength : 15000},
    tags : { type : [String], default : []},

    // META DATA
    reviewStatus : { type : String, 
                enum : {values : ['PENDING', 'APPROVED', 'FLAGGED', 'FEATURED']}, default : 'PENDING'},
    feedback : { type : String, maxLength : 500 },
    rankingScore : {type : Number, default: 1}
},
{timestamps : true});

export default mongoose.model("projectReports", projectReportSchema);