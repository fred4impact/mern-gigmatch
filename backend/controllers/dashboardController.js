const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Application = require('../models/Application');

// Get talent dashboard statistics
const getTalentStats = async (req, res) => {
  try {
    const talentId = req.user.id;

    // Get application statistics
    const [pendingApps, acceptedApps, rejectedApps, withdrawnApps] = await Promise.all([
      Application.countDocuments({ talent: talentId, status: 'pending' }),
      Application.countDocuments({ talent: talentId, status: 'accepted' }),
      Application.countDocuments({ talent: talentId, status: 'rejected' }),
      Application.countDocuments({ talent: talentId, status: 'withdrawn' })
    ]);

    // Get total applications
    const totalApplications = pendingApps + acceptedApps + rejectedApps + withdrawnApps;

    // Get profile views (placeholder - would need to implement view tracking)
    const profileViews = 0; // TODO: Implement profile view tracking

    // Get rating (placeholder - would need to implement rating system)
    const rating = 0; // TODO: Implement rating system

    // Get active gigs (accepted applications)
    const activeGigs = acceptedApps;

    res.json({
      success: true,
      data: {
        profileViews,
        totalApplications,
        pendingApplications: pendingApps,
        acceptedApplications: acceptedApps,
        rejectedApplications: rejectedApps,
        withdrawnApplications: withdrawnApps,
        activeGigs,
        rating
      }
    });
  } catch (error) {
    console.error('Get talent stats error:', error);
    res.status(500).json({ message: 'Error fetching talent statistics' });
  }
};

// Get planner/studio dashboard statistics
const getPlannerStats = async (req, res) => {
  try {
    const plannerId = req.user.id;

    // Get events created by this planner
    const [totalEvents, openEvents, closedEvents, cancelledEvents] = await Promise.all([
      Event.countDocuments({ createdBy: plannerId }),
      Event.countDocuments({ createdBy: plannerId, status: 'open' }),
      Event.countDocuments({ createdBy: plannerId, status: 'closed' }),
      Event.countDocuments({ createdBy: plannerId, status: 'cancelled' })
    ]);

    // Get applications for all events created by this planner
    const events = await Event.find({ createdBy: plannerId }).select('_id');
    const eventIds = events.map(event => event._id);

    const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications] = await Promise.all([
      Application.countDocuments({ event: { $in: eventIds } }),
      Application.countDocuments({ event: { $in: eventIds }, status: 'pending' }),
      Application.countDocuments({ event: { $in: eventIds }, status: 'accepted' }),
      Application.countDocuments({ event: { $in: eventIds }, status: 'rejected' })
    ]);

    // Get completed events (placeholder - would need to implement completion tracking)
    const completedEvents = 0; // TODO: Implement event completion tracking

    // Get average rating (placeholder - would need to implement rating system)
    const averageRating = 0; // TODO: Implement rating system

    res.json({
      success: true,
      data: {
        totalEvents,
        openEvents,
        closedEvents,
        cancelledEvents,
        completedEvents,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        averageRating
      }
    });
  } catch (error) {
    console.error('Get planner stats error:', error);
    res.status(500).json({ message: 'Error fetching planner statistics' });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const activities = [];

    if (userRole === 'talent') {
      // Get recent applications for talents
      const recentApplications = await Application.find({ talent: userId })
        .populate('event', 'title type')
        .sort({ createdAt: -1 })
        .limit(5);

      recentApplications.forEach(app => {
        activities.push({
          action: `Applied for ${app.event.title}`,
          time: app.createdAt,
          type: 'application',
          status: app.status
        });
      });
    } else {
      // Get recent applications for planners/studios
      const events = await Event.find({ createdBy: userId }).select('_id');
      const eventIds = events.map(event => event._id);

      const recentApplications = await Application.find({ event: { $in: eventIds } })
        .populate('talent', 'firstName lastName')
        .populate('event', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      recentApplications.forEach(app => {
        activities.push({
          action: `${app.talent.firstName} ${app.talent.lastName} applied for ${app.event.title}`,
          time: app.createdAt,
          type: 'application',
          status: app.status
        });
      });
    }

    // Add some placeholder activities for now
    if (activities.length === 0) {
      activities.push(
        {
          action: userRole === 'talent' ? 'Profile viewed by Event Planner' : 'New event created',
          time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          type: userRole === 'talent' ? 'view' : 'event',
          status: 'completed'
        },
        {
          action: userRole === 'talent' ? 'Completed Corporate Event' : 'Application received',
          time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          type: userRole === 'talent' ? 'completion' : 'application',
          status: 'completed'
        }
      );
    }

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

// Get profile completion percentage
const getProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let completionPercentage = 0;
    const requiredFields = [];

    if (user.role === 'talent') {
      // Talent profile completion
      if (user.firstName && user.lastName) completionPercentage += 20;
      if (user.email) completionPercentage += 10;
      if (user.phone) completionPercentage += 10;
      if (user.location?.city) completionPercentage += 15;
      if (user.category) completionPercentage += 15;
      if (user.subcategory) completionPercentage += 15;
      if (user.bio) completionPercentage += 10;
      if (user.skills && user.skills.length > 0) completionPercentage += 5;

      // Check missing fields
      if (!user.firstName || !user.lastName) requiredFields.push('Name');
      if (!user.phone) requiredFields.push('Phone Number');
      if (!user.location?.city) requiredFields.push('Location');
      if (!user.category) requiredFields.push('Category');
      if (!user.subcategory) requiredFields.push('Specialty');
      if (!user.bio) requiredFields.push('Bio');
      if (!user.skills || user.skills.length === 0) requiredFields.push('Skills');
    } else {
      // Planner/Studio profile completion
      if (user.firstName && user.lastName) completionPercentage += 20;
      if (user.email) completionPercentage += 10;
      if (user.phone) completionPercentage += 15;
      if (user.location?.city) completionPercentage += 20;
      if (user.organization?.name) completionPercentage += 20;
      if (user.organization?.description) completionPercentage += 15;

      // Check missing fields
      if (!user.firstName || !user.lastName) requiredFields.push('Name');
      if (!user.phone) requiredFields.push('Phone Number');
      if (!user.location?.city) requiredFields.push('Location');
      if (!user.organization?.name) requiredFields.push('Organization Name');
      if (!user.organization?.description) requiredFields.push('Organization Description');
    }

    res.json({
      success: true,
      data: {
        completionPercentage: Math.min(completionPercentage, 100),
        requiredFields,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({ message: 'Error fetching profile completion' });
  }
};

module.exports = {
  getTalentStats,
  getPlannerStats,
  getRecentActivity,
  getProfileCompletion
}; 