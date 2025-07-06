const Application = require('../models/Application');
const Event = require('../models/Event');
const User = require('../models/User');

// Apply to an event
const applyToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { message, proposedRate, availability, portfolio, experience } = req.body;
    const talentId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is open
    if (event.status !== 'open') {
      return res.status(400).json({ message: 'Event is not accepting applications' });
    }

    // Check if user is a talent
    if (req.user.role !== 'talent') {
      return res.status(403).json({ message: 'Only talents can apply to events' });
    }

    // Check subscription limits
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOne({ user: talentId });
    
    if (subscription && !subscription.canApplyToEvent()) {
      return res.status(403).json({ 
        message: 'You have reached your monthly application limit. Upgrade your subscription for unlimited applications.',
        subscription: {
          tier: subscription.tier,
          leadsRemaining: subscription.leadsRemaining,
          leadsUsed: subscription.usage.leadsUsed
        }
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ event: eventId, talent: talentId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this event' });
    }

    // Create application
    const application = new Application({
      event: eventId,
      talent: talentId,
      message,
      proposedRate,
      availability,
      portfolio,
      experience
    });

    await application.save();

    // Increment subscription usage
    if (subscription) {
      await subscription.incrementLeadsUsed();
    }

    // Populate talent and event details
    await application.populate([
      { path: 'talent', select: 'firstName lastName email avatar category subcategory' },
      { path: 'event', select: 'title type location date budget' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
      subscription: subscription ? {
        tier: subscription.tier,
        leadsRemaining: subscription.leadsRemaining,
        leadsUsed: subscription.usage.leadsUsed
      } : null
    });
  } catch (error) {
    console.error('Apply to event error:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

// Get applications for a talent
const getMyApplications = async (req, res) => {
  try {
    const talentId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { talent: talentId };
    if (status && ['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate([
        { path: 'event', select: 'title type location date budget status createdBy' },
        { path: 'event.createdBy', select: 'firstName lastName organization' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalApplications: total
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Get applications for an event (for planners/studios)
const getEventApplications = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check if event exists and user owns it
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view applications for this event' });
    }

    const query = { event: eventId };
    if (status && ['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate([
        { path: 'talent', select: 'firstName lastName email avatar category subcategory bio skills' },
        { path: 'event', select: 'title type location date budget' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalApplications: total
      }
    });
  } catch (error) {
    console.error('Get event applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Accept an application
const acceptApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { responseMessage } = req.body;

    const application = await Application.findById(applicationId)
      .populate('event');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the event
    if (application.event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept this application' });
    }

    // Check if application is pending
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application is not pending' });
    }

    application.status = 'accepted';
    application.respondedAt = new Date();
    application.responseMessage = responseMessage;
    application.isRead = true;
    application.readAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    });
  } catch (error) {
    console.error('Accept application error:', error);
    res.status(500).json({ message: 'Error accepting application' });
  }
};

// Reject an application
const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { responseMessage } = req.body;

    const application = await Application.findById(applicationId)
      .populate('event');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the event
    if (application.event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this application' });
    }

    // Check if application is pending
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application is not pending' });
    }

    application.status = 'rejected';
    application.respondedAt = new Date();
    application.responseMessage = responseMessage;
    application.isRead = true;
    application.readAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Application rejected successfully',
      data: application
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: 'Error rejecting application' });
  }
};

// Withdraw application (for talents)
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the application
    if (application.talent.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application' });
    }

    // Check if application is pending
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application cannot be withdrawn' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ message: 'Error withdrawing application' });
  }
};

// Mark application as read
const markAsRead = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('event');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the event or is the talent
    if (application.event.createdBy.toString() !== req.user.id && 
        application.talent.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark this application as read' });
    }

    application.isRead = true;
    application.readAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: 'Application marked as read',
      data: application
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking application as read' });
  }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'talent') {
      // Stats for talents
      const [pending, accepted, rejected, withdrawn] = await Promise.all([
        Application.countDocuments({ talent: userId, status: 'pending' }),
        Application.countDocuments({ talent: userId, status: 'accepted' }),
        Application.countDocuments({ talent: userId, status: 'rejected' }),
        Application.countDocuments({ talent: userId, status: 'withdrawn' })
      ]);

      stats = { pending, accepted, rejected, withdrawn };
    } else {
      // Stats for planners/studios
      const events = await Event.find({ createdBy: userId }).select('_id');
      const eventIds = events.map(event => event._id);

      const [pending, accepted, rejected, withdrawn] = await Promise.all([
        Application.countDocuments({ event: { $in: eventIds }, status: 'pending' }),
        Application.countDocuments({ event: { $in: eventIds }, status: 'accepted' }),
        Application.countDocuments({ event: { $in: eventIds }, status: 'rejected' }),
        Application.countDocuments({ event: { $in: eventIds }, status: 'withdrawn' })
      ]);

      stats = { pending, accepted, rejected, withdrawn };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ message: 'Error fetching application statistics' });
  }
};

module.exports = {
  applyToEvent,
  getMyApplications,
  getEventApplications,
  acceptApplication,
  rejectApplication,
  withdrawApplication,
  markAsRead,
  getApplicationStats
}; 