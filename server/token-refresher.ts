/**
 * Background job for automatic OAuth token refresh
 * Runs periodically to refresh tokens before they expire
 */

import { storage } from './storage';
import { refreshAccessToken } from './oauth';

/**
 * Refresh tokens for all accounts that are expiring soon
 */
export async function refreshExpiringTokens(): Promise<void> {
  try {
    // Get all accounts that need token refresh (expiring within 24 hours)
    const accounts = await storage.getAccountsNeedingRefresh();

    if (accounts.length === 0) {
      console.log('[Token Refresher] No accounts need token refresh');
      return;
    }

    console.log(`[Token Refresher] Found ${accounts.length} account(s) needing token refresh`);

    // Refresh each account's tokens
    const results = await Promise.allSettled(
      accounts.map(async (account) => {
        try {
          // Skip if no refresh token
          if (!account.refreshToken) {
            console.warn(`[Token Refresher] Account ${account.id} (${account.platform}) has no refresh token - skipping`);
            return {
              success: false,
              accountId: account.id,
              platform: account.platform,
              error: 'No refresh token'
            };
          }

          // Skip if account is not active
          if (!account.isActive) {
            console.log(`[Token Refresher] Account ${account.id} (${account.platform}) is inactive - skipping`);
            return {
              success: false,
              accountId: account.id,
              platform: account.platform,
              error: 'Account inactive'
            };
          }

          console.log(`[Token Refresher] Refreshing tokens for account ${account.id} (${account.platform})`);

          // Refresh the token
          const newTokens = await refreshAccessToken(account.platform, account.refreshToken);

          if (!newTokens) {
            throw new Error('Token refresh returned null');
          }

          // Update account with new tokens
          await storage.updateSocialAccount(account.id, {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken || account.refreshToken,
            expiresAt: newTokens.expiresAt || null
          });

          console.log(`[Token Refresher] Successfully refreshed tokens for account ${account.id} (${account.platform})`);

          return {
            success: true,
            accountId: account.id,
            platform: account.platform,
            expiresAt: newTokens.expiresAt
          };
        } catch (error: any) {
          console.error(
            `[Token Refresher] Failed to refresh tokens for account ${account.id} (${account.platform}):`,
            error.message
          );

          // Mark account as inactive if token refresh fails
          // This could indicate revoked access or invalid credentials
          try {
            await storage.updateSocialAccount(account.id, {
              userId: account.userId,
              platform: account.platform,
              accountName: account.accountName,
              accountId: account.accountId,
              accessToken: account.accessToken,
              profileData: {
                ...account.profileData,
                isActive: false,
                lastRefreshError: error.message,
                lastRefreshAttempt: new Date().toISOString()
              }
            });
            console.log(`[Token Refresher] Marked account ${account.id} as inactive due to refresh failure`);
          } catch (updateError) {
            console.error(`[Token Refresher] Failed to mark account ${account.id} as inactive:`, updateError);
          }

          return {
            success: false,
            accountId: account.id,
            platform: account.platform,
            error: error.message
          };
        }
      })
    );

    // Log summary
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`[Token Refresher] Refresh complete: ${successful} successful, ${failed} failed`);

    // Log detailed failures
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && !result.value.success) {
        console.log(
          `[Token Refresher] Failed: ${result.value.platform} (${result.value.accountId}) - ${result.value.error}`
        );
      } else if (result.status === 'rejected') {
        console.error(`[Token Refresher] Unexpected error for account ${accounts[index]?.id}:`, result.reason);
      }
    });
  } catch (error: any) {
    console.error('[Token Refresher] Fatal error in refresh job:', error);
  }
}

/**
 * Start the token refresh background job
 * Runs every 6 hours by default
 */
export function startTokenRefreshJob(intervalHours: number = 6): NodeJS.Timeout {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`[Token Refresher] Starting token refresh job (runs every ${intervalHours} hours)`);

  // Run immediately on startup
  refreshExpiringTokens().catch(error => {
    console.error('[Token Refresher] Error in initial token refresh:', error);
  });

  // Schedule recurring refresh
  const interval = setInterval(() => {
    refreshExpiringTokens().catch(error => {
      console.error('[Token Refresher] Error in scheduled token refresh:', error);
    });
  }, intervalMs);

  return interval;
}

/**
 * Stop the token refresh background job
 */
export function stopTokenRefreshJob(interval: NodeJS.Timeout): void {
  console.log('[Token Refresher] Stopping token refresh job');
  clearInterval(interval);
}
