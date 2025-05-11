import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';
import Customer from '@/models/Customer';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buildMongoQueryFromRules } from '@/lib/queryBuilder'
function buildMongoQuery(rules) {
  const query = { $and: [] }; 

  rules.forEach(rule => {
    const { field, operator, value } = rule;
    let condition = {};
    let numericValue = parseFloat(value); 

    if (field === 'lastActiveDate') {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - parseInt(value, 10));
        condition[field] = { $lte: dateThreshold };
    } else if (['totalSpend', 'visitCount'].includes(field) && !isNaN(numericValue)) {
        switch (operator) {
            case '>': condition[field] = { $gt: numericValue }; break;
            case '<': condition[field] = { $lt: numericValue }; break;
            case '=': condition[field] = { $eq: numericValue }; break;
            case '>=': condition[field] = { $gte: numericValue }; break;
            case '<=': condition[field] = { $lte: numericValue }; break;
            default: condition[field] = { $eq: numericValue }; 
        }
    } else {
        condition[field] = { $eq: value };
    }
    query.$and.push(condition);
  });
  return query.$and.length > 0 ? query : {}; 
}


export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();
    const { rules } = await request.json();
    if (!rules || !Array.isArray(rules)) {
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