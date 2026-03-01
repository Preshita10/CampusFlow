import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

export function ProfilePage() {
  const { currentUser, loading: userLoading } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser && !userLoading) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
      loadUserData();
    }
  }, [currentUser, userLoading]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch detailed user data
      setUserData({
        ...currentUser,
        joinDate: currentUser?.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalRequests: 0,
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // In a real app, you'd update the user profile via API
      alert('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="card-vibrant p-12 text-center">
        <p className="text-rose-600 font-semibold">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-xl font-semibold text-white bg-violet-500 hover:bg-violet-600 shadow transition-all active:scale-95"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="card-vibrant p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-700 mb-4">Personal Information</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-vibrant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-vibrant"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-50 shadow transition-all active:scale-95"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: currentUser.name || '',
                    email: currentUser.email || '',
                  });
                }}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
              <p className="text-slate-800">{currentUser.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <p className="text-slate-800">{currentUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
              <p className="text-slate-800">{currentUser.role}</p>
            </div>
            {userData && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Member Since</label>
                  <p className="text-slate-800">
                    {new Date(userData.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Last Login</label>
                  <p className="text-slate-800">
                    {new Date(userData.lastLogin).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card-vibrant p-6">
        <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
        <div className="space-y-2">
          <button
            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => alert('Password change feature coming soon!')}
          >
            Change Password
          </button>
          <button
            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => alert('Notification preferences feature coming soon!')}
          >
            Notification Preferences
          </button>
          <button
            className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            onClick={() => {
              if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                alert('Account deletion feature coming soon!');
              }
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
