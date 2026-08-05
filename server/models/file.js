import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
    originalName: {
        type: String,
        required: true,
        trim: true
    },

    mimeType: {
        type: String,
        required: true
    },

    size: {
        type: Number,
        required: true
    },

    cloudinaryUrl: {
        type: String,
        required: true
    },

    cloudinaryPublicId: {
        type: String,
        required: true
    },

    hash: {
        type: String,
        required: true,
        
    },

    CreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    isPublic: {
        type: Boolean,
        default: true
    },

    isPasswordProtected: {
        type: Boolean,
        default: false
    },

    password: {
        type: String,
        default: null,
        select: false
    },

    expiresAt: {
        type: Date,
        default: null
    },

    downloadCount: {
        type: Number,
        default: 0
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
},
    {
        timestamps: true
    }
);

fileSchema.index({ createdBy: 1, deletedAt: 1, createdAt: -1 });
fileSchema.index({ expiresAt: 1 , deletedAt: 1 });

fileSchema.methods.verifyPassword = async function(candidatePassword){
    if(!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

fileSchema.methods.isExpired = function(){
    if(!this.expiresAt) return false;
    return new Date() > this.expiresAt;
};

fileSchema.methods.isDeleted = function(){
    return this.deletedAt !== null;
}

fileSchema.virtual('sizeFormatted').get(function (){
    const bytes = this.size;
    if(bytes < 1024) return `${bytes} B`;
    if(bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if(bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
});

fileSchema.virtual('sharedUrl').get(function(){
    return `${process.env.BASE_URL}/file/${this.slug}`;
});

fileSchema.query.active = function() {
    return this.where({ deletedAt: null, status: 'active' });
};

export const File = mongoose.model('File', fileSchema);
export default File;