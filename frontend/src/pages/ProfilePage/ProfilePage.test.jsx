import React from 'react';
import { screen } from '@testing-library/react';
import useAuth from '../../hooks/useAuth';
import useProfileImage from '../../hooks/useProfileImage';
import ProfilePage from './ProfilePage';
import { renderWithProviders } from '../../utils/testUtils';

// Mock hooks used by ProfilePage
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useProfileImage');

describe('ProfilePage', () => {
  const mockHandleFetchProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        isEmailVerified: true,
      },
      loading: false,
      handleFetchProfile: mockHandleFetchProfile,
      handleUpdateProfile: jest.fn(),
      handleChangePassword: jest.fn().mockResolvedValue(true),
      handleDeleteAccount: jest.fn(),
    });

    useProfileImage.mockReturnValue({
      imageLoading: false,
      imageError: null,
      imageSuccess: false,
      removeImageModal: false,
      fileInputRef: { current: null },
      setRemoveImageModal: jest.fn(),
      setImageError: jest.fn(),
      handleImageUpload: jest.fn(),
      confirmRemoveImage: jest.fn(),
    });
  });

  it('renders profile page hero with user name and email', () => {
    const { container } = renderWithProviders(<ProfilePage />, {
      initialEntries: ['/profile'],
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    // Back to Dashboard button
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });
});