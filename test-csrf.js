const { doubleCsrf } = require('csrf-csrf');

console.log('doubleCsrf:', doubleCsrf);
console.log('Type:', typeof doubleCsrf);

try {
  const result = doubleCsrf({
    getSecret: () => 'test-secret',
    cookieName: 'test',
  });
  console.log('Result:', result);
  console.log('Keys:', Object.keys(result));
} catch (err) {
  console.log('Error:', err);
}
