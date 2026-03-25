import mongoose from 'mongoose';
const { Schema } = mongoose;


const fileSchema = new Schema({
    path:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    size:{
        type: Number,
        required: true
    },
    downloadContent:{
        type: Number,
        required: true,
        default: 0
    },

    isPasswordProtected:{
        type: Boolean,
        default: false,
    },
    password:{
        type: String,
        default: null
    },
    hasExpiry:{
        type: Boolean,
        
    },
    expiresAt:{
        type: Date,
        default: null
    },
    status:{
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    },
    shortUrl:{
        type: String,
        required: true,
        unique: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

}, { timestamps: true })

export const File = mongoose.model('File', fileSchema);
