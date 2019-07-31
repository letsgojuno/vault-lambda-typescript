const DEFAULT_PREFIX = 'SECRET';

export interface SecretDefinition {
  envVar: string;
  path: string;
  key: string;
}

export function extract(prefix: string = DEFAULT_PREFIX): SecretDefinition[] {
  const envVars = Object.entries(process.env).filter(([key]) =>
    key.startsWith(prefix)
  );

  return envVars.reduce<SecretDefinition[]>((acc, [envVar, value]) => {
    if (value === undefined) return acc;

    const split = value.split(':');
    if (split.length !== 2) return acc;

    const [path, key] = split;
    return acc.concat({
      envVar: envVar.replace(`${prefix}_`, ''),
      key,
      path
    });
  }, []);
}
