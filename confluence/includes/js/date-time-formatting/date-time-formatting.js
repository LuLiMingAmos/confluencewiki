var AJS = AJS || {};

/*
 * Functions for creating formatted strings from dates. All parameters representing points in time can be passed as numbers, Date objects, or anything else with a valueOf method.
 */
AJS.DateTimeFormatting = {

    /*
     * Returns the number of minutes between from and to, rounded down.
     */
    wholeMinutesBetween: function(from, to) {
        var millisPerMinute = 60 * 1000;
        return Math.floor((to.valueOf() - from.valueOf()) / millisPerMinute);
    },

    /*
     * Returns the number of hours between from and to, rounded to nearest hour.
     */
    roundedHoursBetween: function(from, to) {
        var millisPerHour = 60 * 60 * 1000;
        return Math.round((to.valueOf() - from.valueOf()) / millisPerHour);
    },

    /*
     * Returns true iff date is yesterday relative to now, in the timezone where local time is timezoneOffsetMillis milliseconds ahead of UTC.
     */
    isYesterdayRelativeTo: function(date, now, timezoneOffsetMillis) {
        var twentyFourHours = 24 * 60 * 60 * 1000;
        var dateInTimeZone = new Date(date.valueOf() + timezoneOffsetMillis);
        var yesterdayInTimeZone = new Date(now.valueOf() + timezoneOffsetMillis - twentyFourHours)
        return dateInTimeZone.getUTCFullYear() == yesterdayInTimeZone.getUTCFullYear() &&
               dateInTimeZone.getUTCMonth() == yesterdayInTimeZone.getUTCMonth() &&
               dateInTimeZone.getUTCDate() == yesterdayInTimeZone.getUTCDate();
    },

    /*
     * Returns the time portion of date as a formatted string. For now, the format is hardcoded.
     */
    formatTime: function(date, timezoneOffsetMillis) {
        return moment(date.valueOf() + timezoneOffsetMillis).utc().format("h:mm A");
    },

    /*
     * Returns the date portion of date as a formatted string. For now, the format is hardcoded.
     */
    formatDate: function(date, timezoneOffsetMillis) {
        return moment(date.valueOf() + timezoneOffsetMillis).utc().format("MMM DD, YYYY");
    },

    /*
     * Returns the date and time portions of date as a formatted string. For now, the format is hardcoded.
     */
    formatDateTime: function(date, timezoneOffsetMillis) {
        return moment(date.valueOf() + timezoneOffsetMillis).utc().format("MMM DD, YYYY HH:mm");
    },

    /*
     * Returns date as a formatted string. Should produce results identical to the FriendlyDateFormatter Java class.
     */
    friendlyFormatDateTime: function(date, now, timezoneOffsetMillis) {
        var fourSeconds = 4 * 1000;
        var oneMinute = 60 * 1000;
        var twoMinutes = 2 * 60 * 1000;
        var fiftyMinutes = 50 * 60 * 1000;
        var ninetyMinutes = 90 * 60 * 1000;
        var fiveHours = 5 * 60 * 60 * 1000;
        var twentyFourHours = 24 * 60 * 60 * 1000;

        var timeSinceDate = now.valueOf() - date.valueOf();

        if (timeSinceDate < 0) {
            return AJS.DateTimeFormatting.formatDateTime(date, timezoneOffsetMillis);
        } else if (timeSinceDate == 0) {
            return AJS.I18n.getText("date.friendly.now");
        } else if (timeSinceDate < fourSeconds) {
            return AJS.I18n.getText("date.friendly.a.moment.ago");
        } else if (timeSinceDate < oneMinute) {
            return AJS.I18n.getText("less.than.one.min");
        } else if (timeSinceDate < twoMinutes) {
            return AJS.I18n.getText("one.min.ago");
        } else if (timeSinceDate < fiftyMinutes) {
            return AJS.I18n.getText("x.mins.ago", AJS.DateTimeFormatting.wholeMinutesBetween(date, now));
        } else if (timeSinceDate < ninetyMinutes) {
            return AJS.I18n.getText("date.friendly.about.one.hour.ago");
        } else if (timeSinceDate > fiveHours && AJS.DateTimeFormatting.isYesterdayRelativeTo(date, now, timezoneOffsetMillis)) {
            return AJS.I18n.getText("date.friendly.yesterday", AJS.DateTimeFormatting.formatTime(date, timezoneOffsetMillis));
        } else if (timeSinceDate < twentyFourHours) {
            return AJS.I18n.getText("date.friendly.about.x.hours.ago", AJS.DateTimeFormatting.roundedHoursBetween(date, now));
        }

        return AJS.DateTimeFormatting.formatDate(date, timezoneOffsetMillis);
    }
};
