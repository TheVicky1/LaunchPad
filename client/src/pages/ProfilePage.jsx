import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, GraduationCap, MapPin, Code2, Sparkles, Check, Plus, X, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';

export const ProfilePage = () => {
  const { user, isAuthenticated, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Alex Sharma',
    email: user?.email || 'alex.sharma@student.edu',
    educationLevel: user?.educationLevel || '3rd Year B.Tech Computer Science',
    graduationYear: user?.graduationYear || 2027,
  });

  const [skills, setSkills] = useState(user?.skills || ['React', 'JavaScript', 'Node.js', 'Python', 'Tailwind CSS']);
  const [newSkill, setNewSkill] = useState('');

  const [interests, setInterests] = useState(
    user?.interests || ['Web Development', 'Open Source', 'Hackathons', 'Fintech']
  );
  const [newInterest, setNewInterest] = useState('');

  const [preferredLocations, setPreferredLocations] = useState(
    user?.preferredLocations || ['Bengaluru', 'Remote']
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        educationLevel: user.educationLevel || '3rd Year B.Tech Computer Science',
        graduationYear: user.graduationYear || 2027,
      });
      if (Array.isArray(user.skills) && user.skills.length > 0) setSkills(user.skills);
      if (Array.isArray(user.interests) && user.interests.length > 0) setInterests(user.interests);
      if (Array.isArray(user.preferredLocations) && user.preferredLocations.length > 0) setPreferredLocations(user.preferredLocations);
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (intToRemove) => {
    setInterests(interests.filter((i) => i !== intToRemove));
  };

  const handleToggleLocation = (loc) => {
    if (preferredLocations.includes(loc)) {
      setPreferredLocations(preferredLocations.filter((l) => l !== loc));
    } else {
      setPreferredLocations([...preferredLocations, loc]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUserProfile({
      ...formData,
      skills,
      interests,
      preferredLocations,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const availableLocations = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Remote'];

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Student Profile & Recommendations</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Tailor your skills and interests to power personalized recommendations on your Launchpad Dashboard.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-indigo-950 font-medium">
              You are currently viewing in <strong>Guest Mode</strong>. Sign in or create an account to save your profile to the database.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          Profile updated successfully! Dashboard recommendations have been refreshed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Current Education</label>
              <input
                type="text"
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Technical Skills</h3>
            <p className="text-xs text-slate-500">
              Opportunities matching these skills will be highlighted on your Dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add another skill (e.g. TypeScript, GraphQL, Rust)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Areas of Interest Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Areas of Interest</h3>
            <p className="text-xs text-slate-500">Categories you love participating in.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-100"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:text-emerald-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add interest (e.g. Distributed Systems, DevRel, Security)..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Preferred Locations</h3>
          <div className="flex flex-wrap gap-2">
            {availableLocations.map((loc) => {
              const selected = preferredLocations.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleToggleLocation(loc)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};
