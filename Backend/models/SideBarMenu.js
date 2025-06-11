// models/SidebarMenu.js
const mongoose = require('mongoose');

const SidebarMenuSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['menu-title', 'collapsible', 'route']
  },
  icon: String,
  route: String,
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SidebarMenu' }],
  order: Number,
  status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SidebarMenu', SidebarMenuSchema);
