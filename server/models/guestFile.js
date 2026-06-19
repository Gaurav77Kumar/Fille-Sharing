import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";


const guestFileSchema = new Schema({
  originalName: {
    type: String,
    required: true,
    trim: true,
  },

  mimeType: {
    type: String,
  },

  size: {
    type: Number,
    required: true,
  },

  cloudinaryUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },

  ipAddress: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  isPasswordProtected: {
    type: Boolean,
    default: false,
  },

  password: {
    type: String,
    default: null,
    select: false,
  },
  
  expiresAt: {
    type: Date,
    required: true,
  },

  downloadCount: {
    type: Number,
    default: 0,
  },

},
  {
   timestamps: true 
  }
);

guestFileSchema.index (
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
)

guestFileSchema.index({ ipAddress: 1, createdAt: -1 });

guestFileSchema.methods.verifyPassword = async function(candidatPassword) {
  if (!this.isPasswordProtected ) {
    return true;
    if (!this.password) return false;
  }

  return await bcrypt.compare(candidatPassword, this.password);
};

guestFileSchema.methods.isExpired = function(){
  return new Date() > this.expiresAt;
};

guestFileSchema.virtual('shareUrl').get(function() {
  return `${process.env.BASE_URL}/f/${this.slug}`;
});

guestFileSchema.virtual('sizeFormatted').get(function() {
  const bytes = this.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
});

guestFileSchema.virtual('minutesRemaining').get(function() {
  if (!this.expiresAt) return 0;
  const remaining = this.expiresAt - new Date();
  return Math.max(0, Math.floor(remaining / (1000 * 60)));
});

guestFileSchema.virtual('findOneAndDelete').get(function() {
  if (docs?.cloudinaryPublicId) {
    const {v2: cloudinary} =  import('cloudinary');
     cloudinary.uploader.destroy(docs.cloudinaryPublicId);
  }
});
export const GuestFile = mongoose.model("GuestFile", guestFileSchema);