// src/app/api/segments/preview/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';
import Customer from '@/models/Customer';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buildMongoQueryFromRules } from '@/lib/queryBuilder'
// Helper function to build MongoDB query from rules
function buildMongoQuery(rules) {
  const query = { $and: [] }; // Default to AND logic between rule groups
                              // For more complex AND/OR within groups, this needs enhancement

  rules.forEach(rule => {
    const { field, operator, value } = rule;
    let condition = {};
    let numericValue = parseFloat(value); // Attempt to parse value as number

    if (field === 'lastActiveDate') {
        // Assuming 'value' is number of days.
        // We want customers whose lastActiveDate is older than 'value' days ago.
        // So, lastActiveDate <= (today - 'value' days)
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - parseInt(value, 10));
        condition[field] = { $lte: dateThreshold }; // Less than or equal to the threshold date
    } else if (['totalSpend', 'visitCount'].includes(field) && !isNaN(numericValue)) {
        // Numeric fields
        switch (operator) {
            case '>': condition[field] = { $gt: numericValue }; break;
            case '<': condition[field] = { $lt: numericValue }; break;
            case '=': condition[field] = { $eq: numericValue }; break;
            case '>=': condition[field] = { $gte: numericValue }; break;
            case '<=': condition[field] = { $lte: numericValue }; break;
            default: condition[field] = { $eq: numericValue }; // Default to equals
        }
    } else {
        // Basic string equality (not used by current fields, but for extensibility)
        // For more complex string ops (contains, startsWith), use $regex
        condition[field] = { $eq: value };
    }
    query.$and.push(condition);
  });
  return query.$and.length > 0 ? query : {}; // Return empty if no rules
}


export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();
    const { rules } = await request.json();
    if (!rules || !Array.isArray(rules)) { // Simplified check, queryBuilder handles empty rules
      return NextResponse.json({ message: "Rules are required and must be an array." }, { status: 400 });
    }
    const mongoQuery = buildMongoQueryFromRules(rules);
    const count = await Customer.countDocuments(mongoQuery);
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error previewing audience:", error);
    return NextResponse.json({ message: "Error previewing audience", error: error.message }, { status: 500 });
  }
}