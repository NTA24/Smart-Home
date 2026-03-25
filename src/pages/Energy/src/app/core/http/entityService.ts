export const entityService = {
  async resolveEntityName(entityId: string): Promise<string> {
    const response = await fetch(`/api/entity/${entityId}/name`);
    if (!response.ok) {
      return entityId;
    }
    return response.text();
  },
};
