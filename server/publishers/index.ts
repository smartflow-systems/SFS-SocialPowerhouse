/**
 * Social Media Publishers
 * Real API integrations for all supported platforms
 */

export { publishToFacebook, getFacebookPostInsights, deleteFacebookPost } from './facebook';
export { publishToTwitter, deleteTwitterPost, getTwitterPostMetrics, publishTwitterThread } from './twitter';
export { publishToLinkedIn, deleteLinkedInPost, getLinkedInPostAnalytics, publishToLinkedInOrganization } from './linkedin';
export { publishToInstagram, deleteInstagramPost, getInstagramPostInsights } from './instagram';

export type { PublishResult } from './facebook';
