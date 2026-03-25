import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
  path: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  downloadedContent: {
    type: Number,
    required: true,
    default: 0,
  },

  isPasswordProtected: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String, 
    default: null,
  },

  hasExpiry: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    default: null,
  },

  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
  shortUrl: {
    type: String,
    default: null,
  },
  
  createdBy: {
    type: String,
    required: true,
  },

}, { timestamps: true });

export const GuestFile = mongoose.model("GuestFile", fileSchema);