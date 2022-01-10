import mongoose from 'mongoose';
import slug from 'mongoose-slug-generator';

mongoose.plugin(slug);

const blogPostSchema = mongoose.Schema({
    // IDENTITY DATA
    authorId: { type : String, required : true },
    authorName : { type : String, required : true },
    authorSlug : { type : String},
    authorImage : {type : String},
    slug : {type : String, slug : ['title', 'authorName'], unique : true},
    authorCourseCode : { type : String},

    // EDITABLE DATA
    title : {type : String},
    tags : {type : [String], default : []},
    coverPhoto : {type : String},
    content : {type : String, maxLength : 15000},

    // META DATA
    reviewStatus : { type : String, 
        enum : {values : ['PENDING', 'APPROVED', 'FLAGGED','FEATURED']}, default : 'PENDING'},
    feedback : { type : String, maxLength : 500 },
    rankingScore : {type : Number, default: 1}
},
{ timestamps : true });

export default mongoose.model('blogPosts',blogPostSchema);