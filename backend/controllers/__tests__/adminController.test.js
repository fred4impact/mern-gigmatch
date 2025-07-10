const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');

// You may want to use a test DB or mock DB connection for real projects

describe('Admin User Management', () => {
  let adminToken;
  let adminUser;
  let testUserId;

  beforeAll(async () => {
    // Create a real admin user
    adminUser = new User({
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    // Generate a real JWT
    adminToken = adminUser.generateAuthToken();

    // Create a test user
    const user = new User({
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'talent',
      isActive: true,
      category: 'musician',
      subcategory: 'guitarist'
    });
    await user.save();
    testUserId = user._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['testuser@example.com', 'admin@example.com'] } });
    await mongoose.connection.close();
  });

  it('should get all users (including test user)', async () => {
    const res = await request(app)
      .get('/api/admin/users?includeDeleted=true')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'testuser@example.com' })
      ])
    );
  });

  it('should ban the test user', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${testUserId}/ban`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.isActive).toBe(false);
  });

  it('should unban the test user', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${testUserId}/unban`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.isActive).toBe(true);
  });

  it('should soft delete the test user', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.deleted).toBe(true);
  });
}); 