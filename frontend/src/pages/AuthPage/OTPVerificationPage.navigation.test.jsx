import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders } from '../../utils/testUtils';
import OTPVerificationPage from './OTPVerificationPage';
import { verifyOTPService } from '../../services/auth.service';

jest.mock('../../services/auth.service', () => ({ verifyOTPService: jest.fn(), sendOTPService: jest.fn() }));

function ResetDestination() {
  const { state } = useLocation();
  return <h1>{state?.resetToken === 'test-reset-token' ? 'Reset password ready' : 'Missing reset token'}</h1>;
}

test.each(['verify', 'reset'])('successful %s OTP reaches the next route', async (purpose) => {
  verifyOTPService.mockResolvedValue({ data: purpose === 'reset' ? { resetToken: 'test-reset-token' } : null });
  renderWithProviders(<Routes>
    <Route path="/verify-otp" element={<OTPVerificationPage />} />
    <Route path="/login" element={<h1>Login ready</h1>} />
    <Route path="/reset-password" element={<ResetDestination />} />
  </Routes>, { initialEntries: [{ pathname: '/verify-otp', state: { email: 'test@example.com', purpose } }] });
  screen.getAllByRole('textbox').forEach((input, i) => fireEvent.change(input, { target: { value: String(i + 1) } }));
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' })); });
  await waitFor(() => expect(screen.getByRole('heading', { name: purpose === 'verify' ? 'Login ready' : 'Reset password ready' })).toBeInTheDocument(), { timeout: 2000 });
});
