// src/models/CommunicationLog.js
import mongoose from 'mongoose';

const CommunicationLogSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  // Could also store customer email here for denormalization if frequently needed
  // customerEmail: String,
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered'], // 'delivered' for the bonus receipt API
    default: 'pending',
    required: true,
  },
  messageContent: { // The actual personalized message sent
    type: String,
  },
  sentAt: {
    type: Date,
  },
  failureReason: { // Optional: if status is 'failed'
    type: String,
  },
  // vendorMessageId: String, // Optional: ID from the dummy vendor API
}, {
  timestamps: true,
});

// Indexing can improve query performance for common lookups
CommunicationLogSchema.index({ campaignId: 1 });
CommunicationLogSchema.index({ customerId: 1 });
CommunicationLogSchema.index({ status: 1 });


export default mongoose.models.CommunicationLog || mongoose.model('CommunicationLog', CommunicationLogSchema);