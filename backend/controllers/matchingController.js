const MatchingService = require('../services/matchingService');
const Event = require('../models/Event');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// @desc    Find talent matches for an event
// @route   GET /api/matching/events/:eventId/matches
// @access  Private (Planners/Studios only)
const findEventMatches = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { radius = 10, limit = 20, includeInactive = false } = req.query;

    // Check if user is a planner or studio
    if (!['planner', 'studio'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only planners and studios can view event matches'
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view matches for this event'
      });
    }

    // Find matches using the matching service
    const matches = await MatchingService.findMatches(event, {
      radius: parseInt(radius),
      limit: parseInt(limit),
      includeInactive: includeInactive === 'true'
    });

    // Filter matches based on user's subscription
    const filteredMatches = MatchingService.filterBySubscription(matches, req.user);

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          type: event.type,
          location: event.location,
          date: event.date
        },
        matches: filteredMatches,
        totalMatches: filteredMatches.length,
        searchRadius: radius,
        searchOptions: {
          radius: parseInt(radius),
          limit: parseInt(limit),
          includeInactive: includeInactive === 'true'
        }
      }
    });
  } catch (error) {
    console.error('Find event matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding event matches',
      error: error.message
    });
  }
};

// @desc    Find events for a talent (reverse matching)
// @route   GET /api/matching/talent/events
// @access  Private (Talents only)
const findTalentEvents = async (req, res) => {
  try {
    const { radius = 10, limit = 20, category, skills } = req.query;

    // Check if user is a talent
    if (req.user.role !== 'talent') {
      return res.status(403).json({
        success: false,
        message: 'Only talents can view event matches'
      });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (subscription && !subscription.canApplyToEvent()) {
      return res.status(403).json({
        success: false,
        message: 'You have reached your monthly application limit. Upgrade your subscription for unlimited applications.',
        subscription: {
          tier: subscription.tier,
          leadsRemaining: subscription.leadsRemaining,
          leadsUsed: subscription.usage.leadsUsed
        }
      });
    }

    // Build event query
    let eventQuery = { status: 'open' };

    // Filter by category if specified
    if (category) {
      eventQuery.musicianCategory = category;
    }

    // Filter by skills if specified
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      eventQuery.$or = [
        { musicianTypes: { $in: skillArray } },
        { tags: { $in: skillArray } }
      ];
    }

    // Find events
    const events = await Event.find(eventQuery)
      .populate('createdBy', 'firstName lastName organization.name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Calculate match scores for each event
    const eventMatches = [];
    for (const event of events) {
      const matchScore = await MatchingService.calculateEventMatchScore(req.user, event, {
        radius: parseInt(radius)
      });

      if (matchScore > 0.3) { // Only include events with decent match score
        eventMatches.push({
          event,
          matchScore: Math.round(matchScore * 100) / 100,
          matchFactors: {
            skillMatch: await MatchingService.calculateSkillMatch(req.user, event),
            locationMatch: await MatchingService.calculateLocationMatch(req.user, event, parseInt(radius)),
            availabilityMatch: await MatchingService.calculateAvailabilityMatch(req.user, event),
            ratingMatch: await MatchingService.calculateRatingMatch(req.user),
            competencyMatch: await MatchingService.calculateCompetencyMatch(req.user, event)
          }
        });
      }
    }

    // Sort by match score
    eventMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: {
        events: eventMatches,
        totalEvents: eventMatches.length,
        searchOptions: {
          radius: parseInt(radius),
          limit: parseInt(limit),
          category,
          skills
        },
        subscription: subscription ? {
          tier: subscription.tier,
          leadsRemaining: subscription.leadsRemaining,
          leadsUsed: subscription.usage.leadsUsed
        } : null
      }
    });
  } catch (error) {
    console.error('Find talent events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding event matches',
      error: error.message
    });
  }
};

// @desc    Get subscription recommendations for a talent
// @route   GET /api/matching/talent/recommendations
// @access  Private (Talents only)
const getSubscriptionRecommendations = async (req, res) => {
  try {
    // Check if user is a talent
    if (req.user.role !== 'talent') {
      return res.status(403).json({
        success: false,
        message: 'Only talents can view subscription recommendations'
      });
    }

    const subscription = await Subscription.findOne({ user: req.user.id });
    
    // Get user's application statistics
    const Application = require('../models/Application');
    const totalApplications = await Application.countDocuments({ talent: req.user.id });
    const acceptedApplications = await Application.countDocuments({ 
      talent: req.user.id, 
      status: 'accepted' 
    });

    // Calculate recommendations based on usage patterns
    const recommendations = [];

    if (!subscription || subscription.tier === 'free-basic') {
      if (totalApplications >= 3) {
        recommendations.push({
          tier: 'pro-tier',
          reason: 'You\'re actively applying to events. Upgrade to Pro for unlimited applications and AI-boosted matching.',
          benefits: ['Unlimited applications', 'AI-boosted matching', 'Priority listing']
        });
      }

      if (req.user.location.coordinates) {
        recommendations.push({
          tier: 'location-pro',
          reason: 'You have location data. Upgrade to Location Pro for smart location-based matching.',
          benefits: ['Location-based filtering', 'AI-boosted matching', 'Priority listing']
        });
      }
    }

    if (subscription && ['free-basic', 'pro-tier', 'location-pro'].includes(subscription.tier)) {
      if (req.user.skills && req.user.skills.length > 3) {
        recommendations.push({
          tier: 'skill-focused',
          reason: 'You have diverse skills. Upgrade to Skill Focused for targeted job matching.',
          benefits: ['Skill-based filtering', 'Location-based filtering', 'AI-boosted matching']
        });
      }
    }

    if (subscription && subscription.tier !== 'portfolio-plus' && subscription.tier !== 'agency-plan') {
      recommendations.push({
        tier: 'portfolio-plus',
        reason: 'Showcase your work with Portfolio Plus for better visibility.',
        benefits: ['Portfolio gallery', 'Skill-based filtering', 'Location-based filtering']
      });
    }

    res.json({
      success: true,
      data: {
        currentSubscription: subscription ? {
          tier: subscription.tier,
          features: subscription.features,
          usage: subscription.usage
        } : null,
        recommendations,
        statistics: {
          totalApplications,
          acceptedApplications,
          acceptanceRate: totalApplications > 0 ? (acceptedApplications / totalApplications * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get subscription recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting subscription recommendations',
      error: error.message
    });
  }
};

module.exports = {
  findEventMatches,
  findTalentEvents,
  getSubscriptionRecommendations
}; 