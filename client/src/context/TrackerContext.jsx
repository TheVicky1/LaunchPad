import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const TrackerContext = createContext();

export const TrackerProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [trackedItems, setTrackedItems] = useState(() => {
    if (isAuthenticated) {
      const cached = localStorage.getItem('launchpad_tracked_items');
      return cached ? JSON.parse(cached) : [];
    }
    const cachedGuest = localStorage.getItem('launchpad_guest_tracked_items');
    return cachedGuest ? JSON.parse(cachedGuest) : [];
  });
  const [loading, setLoading] = useState(false);
  const prevUserRef = useRef(user?.id);

  // Sync / Reconcile whenever authentication state changes
  useEffect(() => {
    const prevUserId = prevUserRef.current;
    prevUserRef.current = user?.id;

    if (!isAuthenticated || !user) {
      // User logged out: clear private tracker data and revert to guest demo items
      if (prevUserId) {
        const cachedGuest = localStorage.getItem('launchpad_guest_tracked_items');
        setTrackedItems(cachedGuest ? JSON.parse(cachedGuest) : []);
      }
      return;
    }

    // User is authenticated: reconcile local items with server items
    const reconcileAndFetch = async () => {
      setLoading(true);
      try {
        // Fetch server tracker data
        const serverData = await api.getMyOpportunities();
        const serverItems = Array.isArray(serverData) ? serverData : [];

        // Check if there are local guest items to reconcile
        const localGuestRaw = localStorage.getItem('launchpad_guest_tracked_items');
        const localGuestItems = localGuestRaw ? JSON.parse(localGuestRaw) : [];

        // Upload any local items that are not yet on the server
        for (const localItem of localGuestItems) {
          const oppId = localItem.opportunityId || localItem.id;
          const alreadyOnServer = serverItems.some(
            (s) => s.opportunityId === oppId || s.id === oppId
          );
          if (!alreadyOnServer && oppId) {
            try {
              await api.saveOpportunity({
                opportunityId: oppId,
                itemType: localItem.itemType || 'Opportunity',
                applicationStatus: localItem.applicationStatus || 'Saved',
                title: localItem.title,
                company: localItem.company,
                category: localItem.category,
                location: localItem.location,
                deadline: localItem.deadline,
                applicationUrl: localItem.applicationUrl,
                notes: localItem.notes || ''
              });
            } catch (err) {
              console.warn('Reconciliation item upload skipped:', err.message);
            }
          }
        }

        // Fetch refreshed consolidated server data
        const consolidated = await api.getMyOpportunities();
        if (Array.isArray(consolidated)) {
          setTrackedItems(consolidated);
          localStorage.setItem('launchpad_tracked_items', JSON.stringify(consolidated));
        } else {
          setTrackedItems(serverItems);
        }
      } catch (err) {
        console.warn('Tracker sync error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    reconcileAndFetch();
  }, [isAuthenticated, user?.id]);

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

      if (isAuthenticated && api.hasToken()) {
        localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));
        try {
          await api.removeOpportunity(oppId);
        } catch (e) {
          console.warn('Backend removal failed, preserved locally:', e.message);
        }
      } else {
        localStorage.setItem('launchpad_guest_tracked_items', JSON.stringify(updated));
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

      if (isAuthenticated && api.hasToken()) {
        localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));
        try {
          await api.saveOpportunity(newItem);
        } catch (e) {
          console.warn('Backend save failed, preserved locally:', e.message);
        }
      } else {
        localStorage.setItem('launchpad_guest_tracked_items', JSON.stringify(updated));
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

    if (isAuthenticated && api.hasToken()) {
      localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));
      try {
        await api.updateOpportunityStatus(opportunityId, newStatus, notes);
      } catch (e) {
        console.warn('API update failed, updated locally:', e.message);
      }
    } else {
      localStorage.setItem('launchpad_guest_tracked_items', JSON.stringify(updated));
    }
  };

  const removeItem = async (opportunityId) => {
    const updated = trackedItems.filter(
      (item) => item.opportunityId !== opportunityId && item.id !== opportunityId
    );
    setTrackedItems(updated);

    if (isAuthenticated && api.hasToken()) {
      localStorage.setItem('launchpad_tracked_items', JSON.stringify(updated));
      try {
        await api.removeOpportunity(opportunityId);
      } catch (e) {
        console.warn('API removal failed, removed locally:', e.message);
      }
    } else {
      localStorage.setItem('launchpad_guest_tracked_items', JSON.stringify(updated));
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
