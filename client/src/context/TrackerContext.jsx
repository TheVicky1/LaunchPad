import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const TrackerContext = createContext();

const INITIAL_TRACKED = [
  {
    id: 'user-track-1',
    opportunityId: 'opp-001',
    itemType: 'Opportunity',
    applicationStatus: 'Applied',
    saved: true,
    title: 'Software Engineering Intern - 2027',
    company: 'Google',
    category: 'Internship',
    location: 'Bengaluru',
    deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    applicationUrl: 'https://careers.google.com/jobs/results/',
    notes: 'Submitted resume and portfolio on career portal.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-track-2',
    opportunityId: 'opp-004',
    itemType: 'Opportunity',
    applicationStatus: 'Preparing',
    saved: true,
    title: 'Software Engineer Program Analyst Intern',
    company: 'JPMorganChase',
    category: 'Internship',
    location: 'Bengaluru',
    deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    applicationUrl: 'https://careers.jpmorgan.com/global/en/students/programs',
    notes: 'Reviewing Java Spring Boot concepts and Leetcode questions.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-track-3',
    opportunityId: 'evt-001',
    itemType: 'Event',
    applicationStatus: 'Saved',
    saved: true,
    title: 'HackBangalore 2027: Citywide Student Hackathon',
    company: 'Bengaluru Tech Community & Karnataka Innovation',
    category: 'Hackathon',
    location: 'Bengaluru',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    applicationUrl: 'https://unstop.com/hackathons/hackbangalore',
    notes: 'Discussing team idea with college friends.',
    updatedAt: new Date().toISOString()
  }
];

export const TrackerProvider = ({ children }) => {
  const [trackedItems, setTrackedItems] = useState(() => {
    const cached = localStorage.getItem('launchpad_tracked_items');
    return cached ? JSON.parse(cached) : INITIAL_TRACKED;
  });
  const [loading, setLoading] = useState(false);

  // Sync with API on mount
  useEffect(() => {
    const fetchTracked = async () => {
      try {
        const data = await api.getMyOpportunities();
        if (Array.isArray(data) && data.length > 0) {
          setTrackedItems(data);
          localStorage.setItem('launchpad_tracked_items', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Backend tracking sync fallback to local storage:', err.message);
      }
    };
    fetchTracked();
  }, []);

  const isSaved = (opportunityId) => {
    return trackedItems.some(
      (item) => (item.opportunityId === opportunityId || item.id === opportunityId) && item.saved !== false
    );
  };

  const getStatus = (opportunityId) => {
    const item = trackedItems.find(
      (item) => item.opportunityId === opportunityId || item.id === opportunityId
    );
    return item ? item.applicationStatus : null;
  };

  const toggleSave = async (item) => {
    const oppId = item.id || item.opportunityId;
    const exists = trackedItems.find((t) => t.opportunityId === oppId || t.id === oppId);

    if (exists) {
      // Remove from tracking
      const updated = trackedItems.filter((t) => t.opportunityId !== oppId && t.id !== oppId);
      setTrackedItems(updated);
      localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));
      try {
        await api.removeOpportunity(oppId);
      } catch (e) {
        // Local state preserved
      }
      return false;
    } else {
      // Add to tracking
      const newItem = {
        opportunityId: oppId,
        itemType: item.category === 'Hackathon' || item.venue ? 'Event' : (item.technologies ? 'OpenSourceProgram' : 'Opportunity'),
        applicationStatus: 'Saved',
        saved: true,
        title: item.title || item.name,
        company: item.company || item.organizer || item.organization,
        category: item.category || (item.difficulty ? `${item.difficulty} OSS` : 'Opportunity'),
        location: item.location || item.city || 'Remote',
        deadline: item.deadline || item.registrationDeadline || item.applicationDeadline,
        applicationUrl: item.applicationUrl || item.registrationUrl || item.officialUrl,
        notes: '',
        updatedAt: new Date().toISOString()
      };
      const updated = [newItem, ...trackedItems];
      setTrackedItems(updated);
      localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));
      try {
        await api.saveOpportunity(newItem);
      } catch (e) {
        // Local state preserved
      }
      return true;
    }
  };

  const updateStatus = async (opportunityId, newStatus, notes) => {
    const updated = trackedItems.map((item) => {
      if (item.opportunityId === opportunityId || item.id === opportunityId) {
        return {
          ...item,
          applicationStatus: newStatus,
          ...(notes !== undefined ? { notes } : {}),
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    setTrackedItems(updated);
    localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));

    try {
      await api.updateOpportunityStatus(opportunityId, newStatus, notes);
    } catch (e) {
      console.warn('API update failed, updated locally:', e.message);
    }
  };

  const removeItem = async (opportunityId) => {
    const updated = trackedItems.filter(
      (item) => item.opportunityId !== opportunityId && item.id !== opportunityId
    );
    setTrackedItems(updated);
    localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));

    try {
      await api.removeOpportunity(opportunityId);
    } catch (e) {
      console.warn('API removal failed, removed locally:', e.message);
    }
  };

  const savedCount = trackedItems.filter((item) => item.applicationStatus === 'Saved').length;
  const appliedCount = trackedItems.filter((item) => item.applicationStatus === 'Applied').length;
  const totalCount = trackedItems.length;

  return (
    <TrackerContext.Provider
      value={{
        trackedItems,
        loading,
        isSaved,
        getStatus,
        toggleSave,
        updateStatus,
        removeItem,
        savedCount,
        appliedCount,
        totalCount
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => useContext(TrackerContext);
