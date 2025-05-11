// src/models/Customer.js
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
    unique: true, // Ensures email is unique in the customers collection
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
  // To associate with the user who created/owns this customer data (optional but good)
  // For now, we'll make it simple. If you want to tie customers to specific app users,
  // you'd add a field like:
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming you have a User model for app users
  // }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// If the model is already defined, use it. Otherwise, define it.
// This is important for Next.js hot-reloading environments.
export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);