export async function apiGet(path) {
	const res = await fetch(path, { credentials: 'include' });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.json();
}

export async function apiPost(path, body) {
	const res = await fetch(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.json();
}
