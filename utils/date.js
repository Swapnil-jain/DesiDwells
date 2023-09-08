// Create a module called "dateFormatter" to find current date in a specific format.
const dateFormatter = (() => {
    // Define an array to map months to their names
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    // Function to add ordinal suffix to the day
    function addOrdinalSuffix(day) {
        if (day >= 11 && day <= 13) {
            return day + "th";
        } else {
            switch (day % 10) {
                case 1:
                    return day + "st";
                case 2:
                    return day + "nd";
                case 3:
                    return day + "rd";
                default:
                    return day + "th";
            }
        }
    }

    // Function to format the current date
    function getCurrentFormattedDate() {
        const currentDate = new Date();
        const day = currentDate.getDate();
        const monthIndex = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const formattedDate = `${addOrdinalSuffix(day)} ${months[monthIndex]
            }, ${year}`;
        return formattedDate;
    }

    // Export the getCurrentFormattedDate function
    return {
        getCurrentFormattedDate,
    };
})();

module.exports = dateFormatter;
