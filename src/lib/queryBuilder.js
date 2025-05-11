// src/lib/queryBuilder.js
export function buildMongoQueryFromRules(rules) {
  const query = { $and: [] };

  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return {}; // No rules, match all (or handle as error if preferred)
  }

  rules.forEach(rule => {
    const { field, operator, value } = rule;
    let condition = {};
    let numericValue;

    // Ensure value is not empty string before parsing
    const cleanedValue = typeof value === 'string' ? value.trim() : value;
    if (cleanedValue === '' || cleanedValue === null || cleanedValue === undefined) {
        // Skip rule if value is empty, or throw error, or handle as needed
        console.warn(`Skipping rule due to empty value: ${JSON.stringify(rule)}`);
        return; // Or continue;
    }

    if (field === 'lastActiveDate') {
      const days = parseInt(cleanedValue, 10);
      if (isNaN(days)) {
        console.warn(`Invalid day value for lastActiveDate: ${cleanedValue}`);
        return;
      }
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      dateThreshold.setHours(0, 0, 0, 0); // Start of the day for comparison
      condition[field] = { $lte: dateThreshold };
    } else if (['totalSpend', 'visitCount'].includes(field)) {
      numericValue = parseFloat(cleanedValue);
      if (isNaN(numericValue)) {
        console.warn(`Invalid numeric value for ${field}: ${cleanedValue}`);
        return;
      }
      switch (operator) {
        case '>': condition[field] = { $gt: numericValue }; break;
        case '<': condition[field] = { $lt: numericValue }; break;
        case '=': condition[field] = { $eq: numericValue }; break;
        case '>=': condition[field] = { $gte: numericValue }; break;
        case '<=': condition[field] = { $lte: numericValue }; break;
        default: condition[field] = { $eq: numericValue };
      }
    } else {
      // For other fields, assume direct equality (can be expanded)
      condition[field] = { $eq: cleanedValue };
    }

    if (Object.keys(condition).length > 0) {
        query.$and.push(condition);
    }
  });

  return query.$and.length > 0 ? query : {};
}