function validateProperty(value, schema, path = "") {
  const errors = [];
  if (schema.type) {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    const expectedType = schema.type;
    if (expectedType === "integer") {
      if (!Number.isInteger(value)) {
        errors.push({
          path,
          message: `Expected integer, got ${actualType}`,
          value
        });
        return errors;
      }
    } else if (actualType !== expectedType) {
      errors.push({
        path,
        message: `Expected ${expectedType}, got ${actualType}`,
        value
      });
      return errors;
    }
  }
  if (typeof value === "string") {
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          path,
          message: `Value does not match pattern: ${schema.pattern}`,
          value
        });
      }
    }
    if (schema.minLength !== void 0 && value.length < schema.minLength) {
      errors.push({
        path,
        message: `String length ${value.length} is less than minimum ${schema.minLength}`,
        value
      });
    }
    if (schema.maxLength !== void 0 && value.length > schema.maxLength) {
      errors.push({
        path,
        message: `String length ${value.length} exceeds maximum ${schema.maxLength}`,
        value
      });
    }
  }
  if (typeof value === "number") {
    if (schema.minimum !== void 0 && value < schema.minimum) {
      errors.push({
        path,
        message: `Value ${value} is less than minimum ${schema.minimum}`,
        value
      });
    }
    if (schema.maximum !== void 0 && value > schema.maximum) {
      errors.push({
        path,
        message: `Value ${value} exceeds maximum ${schema.maximum}`,
        value
      });
    }
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in value)) {
          errors.push({
            path: `${path}.${requiredProp}`,
            message: `Required property missing: ${requiredProp}`,
            value: void 0
          });
        }
      }
    }
    if (schema.properties) {
      for (const [propName, propValue] of Object.entries(value)) {
        const propSchema = schema.properties[propName];
        if (propSchema) {
          const propErrors = validateProperty(
            propValue,
            propSchema,
            path ? `${path}.${propName}` : propName
          );
          errors.push(...propErrors);
        }
      }
    }
  }
  return errors;
}
function validateConfig(config, schema) {
  const errors = [];
  if (!config || typeof config !== "object") {
    return {
      valid: false,
      errors: [{
        path: "",
        message: "Configuration must be an object",
        value: config
      }]
    };
  }
  if (schema.patternProperties) {
    const pattern = Object.keys(schema.patternProperties)[0];
    const appSchema = schema.patternProperties[pattern];
    const regex = new RegExp(pattern);
    if (schema.minProperties && Object.keys(config).length < schema.minProperties) {
      errors.push({
        path: "",
        message: `Configuration must have at least ${schema.minProperties} app(s)`,
        value: config
      });
    }
    for (const [appName, appConfig] of Object.entries(config)) {
      if (!regex.test(appName)) {
        errors.push({
          path: appName,
          message: `App name does not match pattern: ${pattern}`,
          value: appName
        });
        continue;
      }
      const appErrors = validateProperty(appConfig, appSchema, appName);
      errors.push(...appErrors);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function loadConfig(config, schema, options = {}) {
  const { strict = true, onError } = options;
  const validationResult = validateConfig(config, schema);
  if (!validationResult.valid) {
    const errorMessage = `Configuration validation failed:
${validationResult.errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`;
    if (onError) {
      onError(validationResult.errors);
    }
    if (strict) {
      const error = new Error(errorMessage);
      error.validationErrors = validationResult.errors;
      throw error;
    }
    console.warn("[CONFIG LOADER]", errorMessage);
    return null;
  }
  console.log("[CONFIG LOADER] Configuration validated successfully");
  return config;
}
function getEntryUrl(entry, env) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Invalid entry configuration");
  }
  let targetEnv = env;
  if (!targetEnv) {
    targetEnv = "development";
    console.warn(
      `[CONFIG LOADER] No explicit env provided, defaulting to 'development'. Pass env parameter explicitly from consuming app to ensure correct environment.`
    );
  }
  console.log(`[CONFIG LOADER] Environment detection: ${targetEnv}`);
  const url = entry[targetEnv];
  if (!url) {
    const fallbackUrl = entry.development || entry.production;
    if (!fallbackUrl) {
      throw new Error(`No URL found for environment: ${targetEnv}`);
    }
    console.warn(
      `[CONFIG LOADER] No URL for environment '${targetEnv}', using fallback: ${fallbackUrl}`
    );
    return fallbackUrl;
  }
  return url;
}
function mergeConfig(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = mergeConfig(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
function createWujieConfig(appConfig, env) {
  if (!appConfig) {
    throw new Error("App configuration is required");
  }
  const { name, entry, wujie = {} } = appConfig;
  return {
    name,
    url: getEntryUrl(entry, env),
    exec: wujie.exec !== void 0 ? wujie.exec : true,
    alive: wujie.alive !== void 0 ? wujie.alive : true,
    sync: wujie.sync !== void 0 ? wujie.sync : true,
    props: wujie.props || {},
    attrs: wujie.attrs || {}
  };
}
function validatePortUniqueness(config) {
  const portMap = /* @__PURE__ */ new Map();
  const conflicts = [];
  for (const [appName, appConfig] of Object.entries(config)) {
    const port = appConfig.port;
    if (portMap.has(port)) {
      conflicts.push({
        port,
        apps: [portMap.get(port), appName],
        message: `Port ${port} is used by multiple apps: ${portMap.get(port)}, ${appName}`
      });
    } else {
      portMap.set(port, appName);
    }
  }
  return conflicts;
}
function validateBasePathUniqueness(config) {
  const pathMap = /* @__PURE__ */ new Map();
  const conflicts = [];
  for (const [appName, appConfig] of Object.entries(config)) {
    const basePath = appConfig.basePath;
    if (pathMap.has(basePath)) {
      conflicts.push({
        basePath,
        apps: [pathMap.get(basePath), appName],
        message: `BasePath ${basePath} is used by multiple apps: ${pathMap.get(basePath)}, ${appName}`
      });
    } else {
      pathMap.set(basePath, appName);
    }
  }
  return conflicts;
}
const configLoader = {
  validateConfig,
  loadConfig,
  getEntryUrl,
  mergeConfig,
  createWujieConfig,
  validatePortUniqueness,
  validateBasePathUniqueness
};

export { createWujieConfig, configLoader as default, getEntryUrl, loadConfig, mergeConfig, validateBasePathUniqueness, validateConfig, validatePortUniqueness };
//# sourceMappingURL=config-loader.js.map
