/**
 * Utility to check user validity based on registration date and package status.
 * 
 * Logic:
 * A user is VALID if:
 * 1. They have an active package (isActive === true)
 * OR
 * 2. They are within the validity period:
 *    - Validity Period starts at Registration Date
 *    - Ends at 11:59:59 PM of the NEXT DAY (Next Day Night 12 PM as per request, likely meaning Midnight)
 * 
 * Example:
 * Registered: 2023-10-25 10:00 AM
 * Valid Until: 2023-10-26 11:59:59 PM
 * 
 * After this time, if isActive is false, the user is "flushed" (invalid).
 */

const getValidityDeadline = (registrationDate) => {
    if (!registrationDate) return new Date(0); // Invalid date

    const regDate = new Date(registrationDate);

    // Add 1 day
    const nextDay = new Date(regDate);
    nextDay.setDate(regDate.getDate() + 1);

    // Set to end of that day (23:59:59.999)
    nextDay.setHours(23, 59, 59, 999);

    return nextDay;
};

const isUserValid = (user) => {
    if (!user) return false;

    // 1. If user has active package, they are always valid
    if (user.isActive) return true;

    // 2. Check validity period
    const deadline = getValidityDeadline(user.createdAt || user.registrationDate);
    const now = new Date();

    return now <= deadline;
};

// MongoDB Query Helper for "Valid Users"
// Returns a query object that filters for valid users
// Usage: User.find({ ...otherQuery, ...getValidUserQuery() })
const getValidUserQuery = () => {
    const now = new Date();

    // Calculate the cutoff date for creation
    // If createdAt < Cutoff, then (Now > Deadline)
    // Deadline = (createdAt + 1 Day) @ 23:59:59
    // Roughly: createdAt must be AFTER (Now - 2 Days) to be safe, 
    // but exact logic is tighter.

    // Since "End of Next Day" depends on the specific createdAt day, 
    // it's harder to express as a simple $gt query without aggregation/expr.
    // However, we can approximate or use $expr.

    /* 
       Logic:
       User is valid IF (isActive == true) OR (
          createdAt >= Start of Yesterday
       )
       
       Why Start of Yesterday?
       - If created Today (Day 0), valid till Day 1 End. (Valid)
       - If created Yesterday (Day -1), valid till Day 0 End (Today End). (Valid)
       - If created Day Before Yesterday (Day -2), valid till Day -1 End. (Invalid today)
       
       So valid users are created >= Start of Yesterday.
    */

    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(now.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    return {
        $or: [
            { isActive: true },
            { createdAt: { $gte: startOfYesterday } }
        ]
    };
};

module.exports = {
    getValidityDeadline,
    isUserValid,
    getValidUserQuery
};
