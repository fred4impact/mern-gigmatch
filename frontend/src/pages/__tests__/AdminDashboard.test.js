import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch for users
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        users: [
          { _id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'talent', isActive: true, deleted: false },
          { _id: '2', firstName: 'Deleted', lastName: 'User', email: 'deleted@example.com', role: 'talent', isActive: false, deleted: true }
        ]
      })
    })
  );
});

afterAll(() => {
  global.fetch.mockRestore();
});

describe('AdminDashboard', () => {
  it('renders and toggles showDeletedUsers', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    // Wait for users to load
    expect(await screen.findByText('Test User')).toBeInTheDocument();
    // Deleted user should not be visible by default
    expect(screen.queryByText('Deleted User')).not.toBeInTheDocument();
    // Toggle showDeletedUsers
    const toggle = screen.getByLabelText(/show deleted users/i);
    fireEvent.click(toggle);
    // Deleted user should now be visible
    expect(await screen.findByText('Deleted User')).toBeInTheDocument();
    // Deleted badge should be visible
    expect(screen.getAllByText('Deleted')[0]).toBeInTheDocument();
  });
}); 