export interface Edge {
  id: { id: string };
  name: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export const edgeService = {
  getEdge(edgeId: string): Promise<Edge> {
    return fetchJson<Edge>(`/api/edge/${edgeId}`);
  },
};
