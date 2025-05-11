import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a campaign name.'],
    trim: true,
  },
  segmentRules: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Please define segment rules for the campaign.'],
  },
  messageTemplate: {
    type: String,
    required: [true, 'Please provide a message template for the campaign.'],
  },
  createdByUserId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'draft',        // Campaign created but not yet processed/launched
      'processing',   // Campaign is actively being processed (finding audience, queueing messages)
      'active',       // Messages have been dispatched to vendor (still ongoing)
      'completed',    // All messages processed by vendor (or campaign manually marked complete)
      'completed_no_audience', // Processed, but no audience found
      'archived'      // Campaign is archived
    ],
    default: 'draft',
  }
}, {
  timestamps: true,
});

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);