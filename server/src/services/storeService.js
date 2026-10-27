import { isMongoConnected } from '../config/db.js';
import { Opportunity } from '../models/Opportunity.js';
import { Event } from '../models/Event.js';
import { OpenSourceProgram } from '../models/OpenSourceProgram.js';
import { UserOpportunity } from '../models/UserOpportunity.js';
import { User } from '../models/User.js';
import { opportunitiesData, eventsData, openSourceData, demoUser } from '../seed/seedData.js';

// In-Memory Fallback Cache & Tracking Store
let inMemoryOpportunities = [...opportunitiesData];
let inMemoryEvents = [...eventsData];
let inMemoryOpenSource = [...openSourceData];
let inMemoryUserOpportunities = [
  {
    id: 'user-track-1',
    userId: demoUser.id,
    opportunityId: 'opp-001',
    itemType: 'Opportunity',
    applicationStatus: 'Applied',
    saved: true,
    title: 'Software Engineering Intern - 2027',
    company: 'Google',
    category: 'Internship',
    location: 'Bengaluru',
    deadline: opportunitiesData[0].deadline,
    applicationUrl: opportunitiesData[0].applicationUrl,
    notes: 'Submitted resume and portfolio on career portal.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-track-2',
    userId: demoUser.id,
    opportunityId: 'opp-004',
    itemType: 'Opportunity',
    applicationStatus: 'Preparing',
    saved: true,
    title: 'Software Engineer Program Analyst Intern',
    company: 'JPMorganChase',
    category: 'Internship',
    location: 'Bengaluru',
    deadline: opportunitiesData[3].deadline,
    applicationUrl: opportunitiesData[3].applicationUrl,
    notes: 'Reviewing Java Spring Boot concepts and Leetcode questions.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-track-3',
    userId: demoUser.id,
    opportunityId: 'evt-001',
    itemType: 'Event',
    applicationStatus: 'Saved',
    saved: true,
    title: 'HackBangalore 2027: Citywide Student Hackathon',
    company: 'Bengaluru Tech Community & Karnataka Innovation',
    category: 'Hackathon',
    location: 'Bengaluru',
    deadline: eventsData[0].registrationDeadline,
    applicationUrl: eventsData[0].registrationUrl,
    notes: 'Discussing team idea with college friends.',
    updatedAt: new Date().toISOString()
  }
];

let inMemoryCurrentUser = { ...demoUser };

export const storeService = {
  // Database status
  getStatus() {
    return {
      connectedToMongo: isMongoConnected(),
      mode: isMongoConnected() ? 'mongodb' : 'in-memory-demo',
      counts: {
        opportunities: inMemoryOpportunities.length,
        events: inMemoryEvents.length,
        openSource: inMemoryOpenSource.length,
        tracked: inMemoryUserOpportunities.length
      }
    };
  },

  // OPPORTUNITIES
  async getOpportunities(query = {}) {
    const {
      search,
      category,
      location,
      mode,
      skills,
      sort = 'newest',
      page = 1,
      limit = 12,
      includeExpired = false
    } = query;

    if (isMongoConnected()) {
      try {
        const filter = {};

        if (!includeExpired) {
          filter.status = { $ne: 'Expired' };
        }

        if (category && category !== 'All') {
          filter.category = category;
        }

        if (location && location !== 'All') {
          filter.location = new RegExp(location, 'i');
        }

        if (mode && mode !== 'All') {
          filter.mode = mode;
        }

        if (skills) {
          const skillsList = skills.split(',').map((s) => s.trim());
          filter.skills = { $in: skillsList.map((s) => new RegExp(s, 'i')) };
        }

        if (search) {
          const searchRegex = new RegExp(search, 'i');
          filter.$or = [
            { title: searchRegex },
            { company: searchRegex },
            { description: searchRegex },
            { skills: searchRegex }
          ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'deadline') {
          sortOption = { deadline: 1 };
        } else if (sort === 'company') {
          sortOption = { company: 1 };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [total, items] = await Promise.all([
          Opportunity.countDocuments(filter),
          Opportunity.find(filter).sort(sortOption).skip(skip).limit(Number(limit))
        ]);

        return {
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          data: items
        };
      } catch (err) {
        console.warn('Mongo query failed, falling back to in-memory store:', err.message);
      }
    }

    // In-Memory search & filter logic
    let results = inMemoryOpportunities.filter((item) => {
      if (!includeExpired && item.status === 'Expired') return false;
      if (category && category !== 'All' && item.category !== category) return false;
      if (location && location !== 'All' && !item.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (mode && mode !== 'All' && item.mode !== mode) return false;

      if (skills) {
        const skillsList = skills.toLowerCase().split(',').map((s) => s.trim());
        const hasSkill = item.skills.some((sk) =>
          skillsList.some((querySkill) => sk.toLowerCase().includes(querySkill))
        );
        if (!hasSkill) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCompany = item.company.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSkill = item.skills.some((sk) => sk.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesSkill) return false;
      }

      return true;
    });

    if (sort === 'deadline') {
      results.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === 'company') {
      results.sort((a, b) => a.company.localeCompare(b.company));
    } else {
      // Newest
      results.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    }

    const total = results.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = results.slice(startIndex, startIndex + Number(limit));

    return {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: paginated
    };
  },

  async getOpportunityById(id) {
    if (isMongoConnected()) {
      try {
        const found = await Opportunity.findById(id);
        if (found) return found;
      } catch {
        // Fallback to checking in-memory
      }
    }
    return inMemoryOpportunities.find((item) => item.id === id || item._id === id);
  },

  async getFeaturedOpportunities() {
    const res = await this.getOpportunities({ limit: 4 });
    return res.data;
  },

  // EVENTS
  async getEvents(query = {}) {
    const {
      search,
      city,
      category,
      mode,
      upcoming = true,
      sort = 'date',
      page = 1,
      limit = 12
    } = query;

    if (isMongoConnected()) {
      try {
        const filter = {};

        if (city && city !== 'All') {
          filter.city = new RegExp(`^${city}$`, 'i');
        }

        if (category && category !== 'All') {
          filter.category = category;
        }

        if (mode && mode !== 'All') {
          filter.mode = mode;
        }

        if (upcoming) {
          filter.startDate = { $gte: new Date(Date.now() - 86400000) };
        }

        if (search) {
          const searchRegex = new RegExp(search, 'i');
          filter.$or = [
            { title: searchRegex },
            { organizer: searchRegex },
            { description: searchRegex },
            { tags: searchRegex }
          ];
        }

        let sortOption = { startDate: 1 };
        if (sort === 'newest') {
          sortOption = { createdAt: -1 };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [total, items] = await Promise.all([
          Event.countDocuments(filter),
          Event.find(filter).sort(sortOption).skip(skip).limit(Number(limit))
        ]);

        return {
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          data: items
        };
      } catch (err) {
        console.warn('Mongo event query failed, falling back to in-memory store:', err.message);
      }
    }

    // In-memory events logic
    let results = inMemoryEvents.filter((item) => {
      if (city && city !== 'All') {
        if (item.city.toLowerCase() !== city.toLowerCase()) return false;
      }

      if (category && category !== 'All' && item.category !== category) return false;
      if (mode && mode !== 'All' && item.mode !== mode) return false;

      if (upcoming) {
        const eventDate = new Date(item.startDate);
        if (eventDate < new Date(Date.now() - 86400000)) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesOrg = item.organizer.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesOrg && !matchesDesc && !matchesTag) return false;
      }

      return true;
    });

    if (sort === 'date') {
      results.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else {
      results.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    }

    const total = results.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = results.slice(startIndex, startIndex + Number(limit));

    return {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: paginated
    };
  },

  async getEventById(id) {
    if (isMongoConnected()) {
      try {
        const found = await Event.findById(id);
        if (found) return found;
      } catch {
        // Fallback
      }
    }
    return inMemoryEvents.find((item) => item.id === id || item._id === id);
  },

  // OPEN SOURCE
  async getOpenSource(query = {}) {
    const {
      search,
      technology,
      difficulty,
      programStatus,
      beginnerFriendly,
      page = 1,
      limit = 12
    } = query;

    if (isMongoConnected()) {
      try {
        const filter = {};

        if (technology && technology !== 'All') {
          filter.technologies = new RegExp(technology, 'i');
        }

        if (difficulty && difficulty !== 'All') {
          filter.difficulty = difficulty;
        }

        if (programStatus && programStatus !== 'All') {
          filter.programStatus = programStatus;
        }

        if (beginnerFriendly === 'true' || beginnerFriendly === true) {
          filter.isBeginnerFriendly = true;
        }

        if (search) {
          const searchRegex = new RegExp(search, 'i');
          filter.$or = [
            { name: searchRegex },
            { organization: searchRegex },
            { description: searchRegex },
            { technologies: searchRegex }
          ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [total, items] = await Promise.all([
          OpenSourceProgram.countDocuments(filter),
          OpenSourceProgram.find(filter).skip(skip).limit(Number(limit))
        ]);

        return {
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          data: items
        };
      } catch (err) {
        console.warn('Mongo OSS query failed, falling back:', err.message);
      }
    }

    let results = inMemoryOpenSource.filter((item) => {
      if (technology && technology !== 'All') {
        const hasTech = item.technologies.some((t) =>
          t.toLowerCase().includes(technology.toLowerCase())
        );
        if (!hasTech) return false;
      }

      if (difficulty && difficulty !== 'All' && item.difficulty !== difficulty) return false;
      if (programStatus && programStatus !== 'All' && item.programStatus !== programStatus) return false;
      if ((beginnerFriendly === 'true' || beginnerFriendly === true) && !item.isBeginnerFriendly) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesOrg = item.organization.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTech = item.technologies.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesOrg && !matchesDesc && !matchesTech) return false;
      }

      return true;
    });

    const total = results.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = results.slice(startIndex, startIndex + Number(limit));

    return {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: paginated
    };
  },

  async getOpenSourceById(id) {
    if (isMongoConnected()) {
      try {
        const found = await OpenSourceProgram.findById(id);
        if (found) return found;
      } catch {
        // Fallback
      }
    }
    return inMemoryOpenSource.find((item) => item.id === id || item._id === id);
  },

  // USER TRACKING (SAVED & APPLICATIONS)
  async getUserOpportunities(userId = demoUser.id, statusFilter) {
    if (isMongoConnected()) {
      try {
        const query = { userId };
        if (statusFilter && statusFilter !== 'All') {
          query.applicationStatus = statusFilter;
        }
        return await UserOpportunity.find(query).sort({ updatedAt: -1 });
      } catch {
        // Fallback
      }
    }

    return inMemoryUserOpportunities.filter((item) => {
      if (item.userId !== userId) return false;
      if (statusFilter && statusFilter !== 'All') {
        return item.applicationStatus === statusFilter;
      }
      return true;
    });
  },

  async saveOpportunityForUser(userId = demoUser.id, data) {
    const { opportunityId, applicationStatus = 'Saved', itemType = 'Opportunity', notes = '', ...rest } = data;

    if (isMongoConnected()) {
      try {
        const existing = await UserOpportunity.findOne({ userId, opportunityId });
        if (existing) {
          existing.applicationStatus = applicationStatus;
          existing.saved = true;
          if (notes) existing.notes = notes;
          await existing.save();
          return existing;
        }
        return await UserOpportunity.create({
          userId,
          opportunityId,
          applicationStatus,
          itemType,
          saved: true,
          notes,
          ...rest
        });
      } catch {
        // Fallback to in-memory
      }
    }

    const index = inMemoryUserOpportunities.findIndex(
      (item) => item.userId === userId && item.opportunityId === opportunityId
    );

    if (index >= 0) {
      inMemoryUserOpportunities[index] = {
        ...inMemoryUserOpportunities[index],
        applicationStatus,
        saved: true,
        notes: notes || inMemoryUserOpportunities[index].notes,
        updatedAt: new Date().toISOString()
      };
      return inMemoryUserOpportunities[index];
    }

    const newRecord = {
      id: `user-track-${Date.now()}`,
      userId,
      opportunityId,
      itemType,
      applicationStatus,
      saved: true,
      notes,
      ...rest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryUserOpportunities.unshift(newRecord);
    return newRecord;
  },

  async updateOpportunityStatus(userId = demoUser.id, opportunityId, applicationStatus, notes) {
    if (isMongoConnected()) {
      try {
        const existing = await UserOpportunity.findOne({ userId, opportunityId });
        if (existing) {
          existing.applicationStatus = applicationStatus;
          if (notes !== undefined) existing.notes = notes;
          await existing.save();
          return existing;
        }
      } catch {
        // Fallback
      }
    }

    const item = inMemoryUserOpportunities.find(
      (i) => i.userId === userId && i.opportunityId === opportunityId
    );
    if (item) {
      item.applicationStatus = applicationStatus;
      if (notes !== undefined) item.notes = notes;
      item.updatedAt = new Date().toISOString();
      return item;
    }

    // Auto-create if not found
    return await this.saveOpportunityForUser(userId, {
      opportunityId,
      applicationStatus,
      notes: notes || ''
    });
  },

  async removeOpportunityForUser(userId = demoUser.id, opportunityId) {
    if (isMongoConnected()) {
      try {
        await UserOpportunity.deleteOne({ userId, opportunityId });
        return true;
      } catch {
        // Fallback
      }
    }

    const initialLength = inMemoryUserOpportunities.length;
    inMemoryUserOpportunities = inMemoryUserOpportunities.filter(
      (item) => !(item.userId === userId && item.opportunityId === opportunityId)
    );
    return inMemoryUserOpportunities.length < initialLength;
  },

  // USER PROFILE
  getUserProfile(userId = demoUser.id) {
    return inMemoryCurrentUser;
  },

  updateUserProfile(userId = demoUser.id, updates = {}) {
    inMemoryCurrentUser = {
      ...inMemoryCurrentUser,
      ...updates
    };
    return inMemoryCurrentUser;
  }
};
