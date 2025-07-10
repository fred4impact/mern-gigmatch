// Admin Controller - Placeholder implementations for all admin endpoints

const User = require('../models/User');
const Event = require('../models/Event');
const Application = require('../models/Application');
const Review = require('../models/Review');
const Subscription = require('../models/Subscription');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ deleted: { $ne: true } }).select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deleted: { $ne: true } }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User banned', user });
  } catch (err) {
    res.status(500).json({ message: 'Error banning user', error: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unbanned', user });
  } catch (err) {
    res.status(500).json({ message: 'Error unbanning user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.deleted = true;
    user.isActive = false;
    await user.save();
    res.json({ message: 'User soft deleted', user });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'firstName lastName email role');
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'firstName lastName email role');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event', error: err.message });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'open' },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event approved (opened)', event });
  } catch (err) {
    res.status(500).json({ message: 'Error approving event', error: err.message });
  }
};

exports.removeEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event removed (cancelled)', event });
  } catch (err) {
    res.status(500).json({ message: 'Error removing event', error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Application.find()
      .populate('event', 'title date')
      .populate('talent', 'firstName lastName email role');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Application.findById(req.params.id)
      .populate('event', 'title date')
      .populate('talent', 'firstName lastName email role');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booking', error: err.message });
  }
};

exports.getAllDisputes = async (req, res) => {
  try {
    const disputes = await Review.find({ status: 'pending' })
      .populate('reviewer', 'firstName lastName email')
      .populate('reviewedUser', 'firstName lastName email')
      .populate('event', 'title');
    res.json({ disputes });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching disputes', error: err.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Dispute (review) not found' });
    review.status = action === 'approve' ? 'approved' : 'rejected';
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    if (note) review.moderationNote = note;
    await review.save();
    res.json({ message: `Dispute ${action}d`, review });
  } catch (err) {
    res.status(500).json({ message: 'Error resolving dispute', error: err.message });
  }
};

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const [userCount, eventCount, bookingCount, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Application.countDocuments(),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$paymentInfo.amount' } } }
      ])
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    res.json({
      users: userCount,
      events: eventCount,
      bookings: bookingCount,
      revenue: totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics overview', error: err.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    // Group revenue by month for the last 12 months
    const now = new Date();
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    const monthlyRevenue = await Subscription.aggregate([
      { $match: { status: 'active', 'paymentInfo.lastPaymentDate': { $gte: lastYear } } },
      { $project: {
          amount: '$paymentInfo.amount',
          month: { $month: '$paymentInfo.lastPaymentDate' },
          year: { $year: '$paymentInfo.lastPaymentDate' }
        }
      },
      { $group: {
          _id: { year: '$year', month: '$month' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({ monthlyRevenue });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching revenue analytics', error: err.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'firstName lastName email role');
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: err.message });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('user', 'firstName lastName email role');
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ subscription });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subscription', error: err.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelledAt: new Date(), cancelledBy: req.user._id },
      { new: true }
    ).populate('user', 'firstName lastName email role');
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ message: 'Subscription cancelled', subscription });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling subscription', error: err.message });
  }
}; 