const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Event = require('../../models/Event');

let adminToken, plannerToken, adminUser, plannerUser, eventId;

describe('Event Management', () => {
  beforeAll(async () => {
    // Create admin user
    adminUser = new User({
      email: 'admin2@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    adminToken = adminUser.generateAuthToken();
    // Create planner user
    plannerUser = new User({
      email: 'planner@example.com',
      password: 'password123',
      firstName: 'Planner',
      lastName: 'User',
      role: 'planner',
      isActive: true
    });
    await plannerUser.save();
    plannerToken = plannerUser.generateAuthToken();
  });

  afterAll(async () => {
    await Event.deleteMany({ title: 'Test Event' });
    await User.deleteMany({ email: { $in: ['admin2@example.com', 'planner@example.com'] } });
    await mongoose.connection.close();
  });

  it('should create an event as planner', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        title: 'Test Event',
        type: 'wedding',
        date: new Date(),
        location: { city: 'Test City' },
        createdBy: plannerUser._id
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Test Event');
    eventId = res.body.data._id;
  });

  it('should approve the event as admin', async () => {
    const res = await request(app)
      .patch(`/api/admin/events/${eventId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.event.status).toBe('open');
  });

  it('should remove the event as admin', async () => {
    const res = await request(app)
      .patch(`/api/admin/events/${eventId}/remove`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.event.status).toBe('cancelled');
  });

  it('should fetch the event by id', async () => {
    const res = await request(app)
      .get(`/api/admin/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.event._id).toBe(eventId);
  });
}); 