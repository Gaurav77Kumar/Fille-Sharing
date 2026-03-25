import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    totalUploads:{
        type: Number,
        default: 0
    },
    totalDownloads:{
        type: Number,
        default: 0
    },
    videoCounts:{
        type: Number,
        default: 0
    },
    imageCounts:{
        type: Number,
        default: 0
    },
    documentCounts:{
        type: Number,
        default: 0
    },
    documentCounts:{
        type: Number,
        default: 0
    },
    profilePic:{
        type: String,
    },
    lastLogin:{
        type: Date,
        default: Date.now
    },
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
    
});

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;