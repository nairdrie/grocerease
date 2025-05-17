// lib/api.ts
// const BASE_URL = 'http://localhost:3000/api'
const BASE_URL = 'http://192.168.2.193:3000/api'

export async function getLists() {
  const res = await fetch(`${BASE_URL}/list`)
  if (!res.ok) throw new Error('Failed to fetch lists')
  return await res.json()
}

export async function getList(id: string) {
  const res = await fetch(`${BASE_URL}/list/${id}`)
  if (!res.ok) throw new Error('Failed to fetch list')
  return await res.json()
}

export async function updateList(id: string, data: any) {
  const res = await fetch(`${BASE_URL}/list/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update list')
  return await res.json()
}

export async function createList(weekStart: string) {
  const res = await fetch(`${BASE_URL}/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStart }),
  });

  if (!res.ok) throw new Error('Failed to create list');
  return await res.json(); // should return the created list { id, weekStart }
}
