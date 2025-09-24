// const fetch = require('node-fetch');

// Function to get public holidays for a given year and country code
async function getHolidays (year, countryCode = 'ZA') {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) {
        throw new Error('Failed to fetch holidays');
    }
    const holidays = await response.json();
    return holidays.map(holiday => new Date(holiday.date));
}

// function to count working days that are not public holidays
async function countWorkingDays (startDate, endDate, countryCode = 'ZA') {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    let allHolidays = [];
    for (let year = startYear; year <= endYear; year++) {
        const holidays = await getHolidays(year, countryCode);
        allHolidays.push(...holidays);
    }

    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        const dateStr = currentDate.toISOString().split('T')[0];

        if( dayOfWeek !== 0 && dayOfWeek !== 6 && !allHolidays.includes(dateStr) ) {
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;

}
module.exports = { countWorkingDays };
