
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
  
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered'], 
    default: 'pending',
    required: true,
  },
  messageContent: { 
    type: String,
  },
  sentAt: {
    type: Date,
  },
  failureReason: { 
    type: String,
  },
  
}, {
  timestamps: true,
});

CommunicationLogSchema.index({ campaignId: 1 });
CommunicationLogSchema.index({ customerId: 1 });
CommunicationLogSchema.index({ status: 1 });


export default mongoose.models.CommunicationLog || mongoose.model('CommunicationLog', CommunicationLogSchema);