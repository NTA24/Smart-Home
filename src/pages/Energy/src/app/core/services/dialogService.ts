export const dialogService = {
  async confirm(message: string): Promise<boolean> {
    return Promise.resolve(window.confirm(message));
  },
  async alert(message: string): Promise<void> {
    window.alert(message);
  },
};
