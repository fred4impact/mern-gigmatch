const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Event = require('../../models/Event');
const Application = require('../../models/Application');

let talentToken, plannerToken, talentUser, plannerUser, eventId, applicationId;

describe('Application Management', () => {
  beforeAll(async () => {
    // Create planner user
    plannerUser = new User({
      email: 'planner2@example.com',
      password: 'password123',
      firstName: 'Planner',
      lastName: 'User',
      role: 'planner',
      isActive: true
    });
    await plannerUser.save();
    plannerToken = plannerUser.generateAuthToken();
    // Create talent user
    talentUser = new User({
      email: 'talent@example.com',
      password: 'password123',
      firstName: 'Talent',
      lastName: 'User',
      role: 'talent',
      isActive: true,
      category: 'musician',
      subcategory: 'guitarist'
    });
    await talentUser.save();
    talentToken = talentUser.generateAuthToken();
    // Create an event
    const event = new Event({
      title: 'Test Event 2',
      type: 'wedding',
      date: new Date(),
      location: { city: 'Test City' },
      createdBy: plannerUser._id
    });
    await event.save();
    eventId = event._id;
  });

  afterAll(async () => {
    await Application.deleteMany({ event: eventId });
    await Event.deleteMany({ _id: eventId });
    await User.deleteMany({ email: { $in: ['planner2@example.com', 'talent@example.com'] } });
    await mongoose.connection.close();
  });

  it('should create an application as talent', async () => {
    const res = await request(app)
      .post(`/api/applications/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${talentToken}`)
      .send({
        message: 'I want to apply!'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.event._id).toBe(String(eventId));
    applicationId = res.body.data._id;
  });

  it('should fetch the application by id', async () => {
    const res = await request(app)
      .get(`/api/applications/${applicationId}`)
      .set('Authorization', `Bearer ${talentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(applicationId);
  });

  it('should withdraw the application as talent', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/withdraw`)
      .set('Authorization', `Bearer ${talentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('withdrawn');
  });
}); 