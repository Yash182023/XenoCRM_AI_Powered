import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the customer.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email for the customer.'],
    unique: true, 
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  totalSpend: {
    type: Number,
    default: 0,
  },
  visitCount: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  
}, {
  timestamps: true, 
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);