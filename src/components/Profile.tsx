import { useState } from 'react';
import { User, Mail, LogOut, X } from 'lucide-react';

interface ProfileProps {
  session: any;
  onClose: () => void;
  onSignOut: () => void;
}

export default function Profile({ session, onClose, onSignOut }: ProfileProps) {
  const user = session?.user;
  const email = user?.email || 'No email';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User size={40} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail size={18} className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300 text-sm truncate">{email}</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        {/* App Info */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Likhlo v0.1.0</p>
        </div>
      </div>
    </div>
  );
}
