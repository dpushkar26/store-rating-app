import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState({ error: '', success: '' });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      setStatus({ error: '', success: '' });
      await api.patch('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setStatus({ error: '', success: 'Password updated successfully!' });
      reset();
      setTimeout(() => {
        setStatus({ error: '', success: '' });
        onClose();
      }, 1500);
    } catch (err) {
      setStatus({ error: err.response?.data?.message || 'Failed to update password', success: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          &times;
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>

        {status.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {status.error}
          </div>
        )}

        {status.success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">
            {status.success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              {...register('currentPassword')}
              className="w-full p-2 border rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter current password"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              {...register('newPassword')}
              className="w-full p-2 border rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="8-16 chars, 1 uppercase, 1 special"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full p-2 border rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
