// Valide params, query et body avec des schémas zod ; le résultat nettoyé (champs inconnus retirés,
// types convertis) est rangé dans req.valid. Les contrôleurs ne lisent que req.valid.
export function validate(schemas) {
  return (req, res, next) => {
    req.valid ??= {}; // peut être appelé deux fois (params avant l'upload, body après)
    for (const part of ['params', 'query', 'body']) {
      if (schemas[part]) req.valid[part] = schemas[part].parse(req[part] ?? {});
    }
    next();
  };
}
