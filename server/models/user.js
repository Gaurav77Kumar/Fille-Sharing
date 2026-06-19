import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true,
        trim: true 
    },

    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    password:{
        type: String,
        required: true,
        minlength: 8,
        select: false  
    },

    profilePic: {
        type: String,
        default: ''
    },

    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    storageUsed: {  
        type: Number,
        default: 0     // bytes
    },

    storageLimit: {  
        type: Number,
        default: 524_288_000   // 500 MB in bytes
    },

    lastLogin: {
        type: Date,
        default: Date.now
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true
    }

);
 
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 12);
    next();
});


userSchema.methods.comparePassword = async function(candidatePassword){
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual("storageUsedPercent").get(function(){
    if(this.storageLimit === 0) return 0;
    return ((this.storageUsed / this.storageLimit) * 100).toFixed(2);
})

userSchema.virtual('storageUsedFormatted').get(function(){
    const bytes = this.storageUsed;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mb`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Gb`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Tb`;
})


const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;