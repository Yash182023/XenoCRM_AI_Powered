// src/models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // Reference to the Customer model
    required: [true, 'Please provide a customer ID for the order.'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an order amount.'],
    min: [0, 'Order amount cannot be negative.'],
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  // }
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);