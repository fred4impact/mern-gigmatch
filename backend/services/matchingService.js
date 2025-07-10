const Event = require('../models/Event');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

class MatchingService {
  /**
   * Main matching function that implements the 6-step algorithm
   * @param {Object} event - The event to find matches for
   * @param {Object} options - Matching options
   * @returns {Array} - Array of matched users with scores
   */
  static async findMatches(event, options = {}) {
    const {
      radius = 10, // Default 10km radius
      limit = 20,
      includeInactive = false
    } = options;

    try {
      // Step 1: Get all potential talents
      let query = {
        role: 'talent',
        isActive: true
      };

      if (!includeInactive) {
        query.isActive = true;
      }

      // Step 2: Skill Match
      if (event.musicianCategory && event.musicianTypes) {
        query.$or = [
          { category: event.musicianCategory },
          { subcategory: { $in: event.musicianTypes } },
          { skills: { $in: event.musicianTypes } }
        ];
      }

      // Step 3: Location Proximity (if coordinates are available)
      if (event.location && event.location.coordinates) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: event.location.coordinates
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      }

      let talents = await User.find(query)
        .populate('subscription')
        .lean();

      // Step 4: Apply matching algorithm
      const matches = await this.applyMatchingAlgorithm(talents, event, options);

      // Step 5: Sort by match score and limit results
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in findMatches:', error);
      throw error;
    }
  }

  /**
   * Apply the 6-step matching algorithm
   * @param {Array} talents - Array of potential talents
   * @param {Object} event - The event
   * @param {Object} options - Matching options
   * @returns {Array} - Array of talents with match scores
   */
  static async applyMatchingAlgorithm(talents, event, options) {
    const matches = [];

    for (const talent of talents) {
      let matchScore = 0;
      const matchDetails = {
        talent,
        event,
        score: 0,
        factors: {}
      };

      // Step 1: Skill Match (30% weight)
      const skillScore = this.calculateSkillMatch(talent, event);
      matchScore += skillScore * 0.3;
      matchDetails.factors.skillMatch = skillScore;

      // Step 2: Location Proximity (25% weight)
      const locationScore = this.calculateLocationMatch(talent, event, options.radius);
      matchScore += locationScore * 0.25;
      matchDetails.factors.locationMatch = locationScore;

      // Step 3: Availability Check (20% weight)
      const availabilityScore = this.calculateAvailabilityMatch(talent, event);
      matchScore += availabilityScore * 0.2;
      matchDetails.factors.availabilityMatch = availabilityScore;

      // Step 4: Rating Priority (15% weight)
      const ratingScore = this.calculateRatingMatch(talent);
      matchScore += ratingScore * 0.15;
      matchDetails.factors.ratingMatch = ratingScore;

      // Step 5: Competency Level (10% weight)
      const competencyScore = this.calculateCompetencyMatch(talent, event);
      matchScore += competencyScore * 0.1;
      matchDetails.factors.competencyMatch = competencyScore;

      // Step 6: AI Match Boost (for Pro users)
      const boostScore = this.calculateAIBoost(talent);
      matchScore += boostScore;
      matchDetails.factors.aiBoost = boostScore;

      matchDetails.score = Math.round(matchScore * 100) / 100;
      matchDetails.matchScore = matchDetails.score;

      matches.push(matchDetails);
    }

    return matches;
  }

  /**
   * Calculate skill match score
   * @param {Object} talent - Talent user object
   * @param {Object} event - Event object
   * @returns {Number} - Score between 0-1
   */
  static calculateSkillMatch(talent, event) {
    let score = 0;
    let totalFactors = 0;

    // Category match
    if (event.musicianCategory && talent.category === event.musicianCategory) {
      score += 0.4;
    }
    totalFactors += 0.4;

    // Subcategory/skill match
    if (event.musicianTypes && talent.subcategory) {
      const skillMatch = event.musicianTypes.some(type => 
        talent.subcategory.toLowerCase().includes(type.toLowerCase()) ||
        talent.skills.some(skill => skill.toLowerCase().includes(type.toLowerCase()))
      );
      if (skillMatch) {
        score += 0.4;
      }
    }
    totalFactors += 0.4;

    // Genre match
    if (event.genre && talent.skills) {
      const genreMatch = talent.skills.some(skill => 
        skill.toLowerCase().includes(event.genre.toLowerCase())
      );
      if (genreMatch) {
        score += 0.2;
      }
    }
    totalFactors += 0.2;

    return totalFactors > 0 ? score / totalFactors : 0;
  }

  /**
   * Calculate location match score
   * @param {Object} talent - Talent user object
   * @param {Object} event - Event object
   * @param {Number} radius - Search radius in km
   * @returns {Number} - Score between 0-1
   */
  static calculateLocationMatch(talent, event, radius = 10) {
    if (!talent.location.coordinates || !event.location.coordinates) {
      return 0.5; // Neutral score if no coordinates
    }

    const distance = this.calculateDistance(
      talent.location.coordinates,
      event.location.coordinates
    );

    // Score based on distance (closer = higher score)
    if (distance <= radius * 0.5) return 1.0; // Within 50% of radius
    if (distance <= radius) return 0.8; // Within radius
    if (distance <= radius * 1.5) return 0.6; // Within 150% of radius
    if (distance <= radius * 2) return 0.4; // Within 200% of radius
    return 0.2; // Beyond 200% of radius
  }

  /**
   * Calculate availability match score
   * @param {Object} talent - Talent user object
   * @param {Object} event - Event object
   * @returns {Number} - Score between 0-1
   */
  static calculateAvailabilityMatch(talent, event) {
    // For now, return a neutral score
    // This would be enhanced with calendar integration
    if (!talent.availability) return 0.5;
    
    // Simple keyword matching for availability
    const availability = talent.availability.toLowerCase();
    const eventDate = new Date(event.date);
    const dayOfWeek = eventDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (availability.includes('flexible') || availability.includes('anytime')) {
      return 1.0;
    }
    
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      if (availability.includes('weekend')) return 1.0;
      if (availability.includes('saturday') || availability.includes('sunday')) return 0.9;
    } else { // Weekday
      if (availability.includes('weekday')) return 1.0;
      if (availability.includes('evening')) return 0.8;
    }
    
    return 0.5; // Default neutral score
  }

  /**
   * Calculate rating match score
   * @param {Object} talent - Talent user object
   * @returns {Number} - Score between 0-1
   */
  static calculateRatingMatch(talent) {
    const rating = talent.rating?.average || 0;
    const totalReviews = talent.rating?.totalReviews || 0;
    
    // Base score from rating (0-5 scale)
    let score = rating / 5;
    
    // Bonus for having reviews (trust factor)
    if (totalReviews >= 10) score += 0.1;
    else if (totalReviews >= 5) score += 0.05;
    else if (totalReviews >= 1) score += 0.02;
    
    // Bonus for verified status
    if (talent.isVerified) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate competency match score
   * @param {Object} talent - Talent user object
   * @param {Object} event - Event object
   * @returns {Number} - Score between 0-1
   */
  static calculateCompetencyMatch(talent, event) {
    const competencyLevels = {
      'beginner': 0.3,
      'intermediate': 0.6,
      'pro': 0.8,
      'expert': 1.0
    };
    
    const level = talent.competencyLevel || 'beginner';
    let score = competencyLevels[level] || 0.5;
    
    // Adjust based on event type
    if (event.type && event.type.toLowerCase().includes('corporate')) {
      // Corporate events prefer higher competency
      if (level === 'beginner') score *= 0.7;
      if (level === 'expert') score *= 1.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate AI boost for Pro users
   * @param {Object} talent - Talent user object
   * @returns {Number} - Boost score
   */
  static calculateAIBoost(talent) {
    if (!talent.subscription) return 0;
    
    const subscription = talent.subscription;
    let boost = 0;
    
    // Only 'pro' tier gets AI boost
    if (subscription.tier === 'pro' && subscription.features.aiBoosted) {
      boost += 0.1; // 10% boost for pro
    }
    
    // Priority listing boost
    if (subscription.features.priorityListing) {
      boost += 0.05; // 5% additional boost for priority
    }
    
    return boost;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Array} coord1 - [lng, lat]
   * @param {Array} coord2 - [lng, lat]
   * @returns {Number} - Distance in kilometers
   */
  static calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(coord2[1] - coord1[1]);
    const dLon = this.deg2rad(coord2[0] - coord1[0]);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1[1])) * Math.cos(this.deg2rad(coord2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {Number} deg - Degrees
   * @returns {Number} - Radians
   */
  static deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Get subscription-based filtered matches
   * @param {Array} matches - Array of matches
   * @param {Object} user - Current user
   * @returns {Array} - Filtered matches based on subscription
   */
  static filterBySubscription(matches, user) {
    if (!user.subscription) return matches;
    
    const subscription = user.subscription;
    
    // Apply subscription-based filtering
    if (subscription.features.skillFiltering) {
      // Filter by user's preferred skills
      matches = matches.filter(match => 
        user.skills.some(skill => 
          match.talent.skills.some(talentSkill => 
            talentSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    return matches;
  }
}

module.exports = MatchingService; 