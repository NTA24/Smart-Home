export const mobileService = {
  isMobileApp(): boolean {
    return false;
  },
  onDashboardLoaded(_hasRightLayout: boolean, _isRightLayoutOpen: boolean) {
    // Hook point for mobile bridge integrations.
  },
};
