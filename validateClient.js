// Validates client data before saving
function validateClient(client) {
  if (!client) {
    return { valid: false, error: 'Client data is required' };
  }
  if (!client.name || client.name.trim() === '') {
    return { valid: false, error: 'Name is required' };
  }
  if (!client.department || client.department.trim() === '') {
    return { valid: false, error: 'Department is required' };
  }
  return { valid: true };
}

module.exports = { validateClient };