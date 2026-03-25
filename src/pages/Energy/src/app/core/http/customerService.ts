export interface Customer {
  id: { id: string };
  title: string;
  additionalInfo?: { isPublic?: boolean };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export const customerService = {
  getCustomer(customerId: string): Promise<Customer> {
    return fetchJson<Customer>(`/api/customer/${customerId}`);
  },
};
