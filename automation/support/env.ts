export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env variable ${name}, see .env.example`);
  return value;
}
