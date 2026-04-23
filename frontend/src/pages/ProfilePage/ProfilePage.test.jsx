import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../../context/AuthContext';
import * as profileService from '../../services/profile.service';

jest.mock('../../services/profile.service');

const mockUser = { name: 'Abdul Baseer', email: 'abdul@test.com' };

const renderProfile = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: mockUser, login: jest.fn(), logout: jest.fn() }}>
        <ProfilePage />
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('ProfilePage', () => {
  beforeEach(() => {
    profileService.getProfileService.mockResolvedValue({
      data: { user: mockUser },
    });
  });

  it('renders profile page with user info', async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('abdul@test.com')).toBeInTheDocument();
    });
  });

  it('shows danger zone section', async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText(/Danger Zone/i)).toBeInTheDocument();
      expect(screen.getByText(/Delete My Account/i)).toBeInTheDocument();
    });
  });

  it('shows update profile button', async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
    });
  });
});