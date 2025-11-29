// wrapper small for window.storage used in tu app
export async function getStorage(key) {
try {
if (window.storage?.get) return await window.storage.get(key);
const raw = localStorage.getItem(key);
return raw ? { value: raw } : null;
} catch (e) {
console.error('getStorage error', e);
return null;
}
}


export async function setStorage(key, value) {
try {
if (window.storage?.set) return await window.storage.set(key, value);
localStorage.setItem(key, value);
} catch (e) {
console.error('setStorage error', e);
}
}