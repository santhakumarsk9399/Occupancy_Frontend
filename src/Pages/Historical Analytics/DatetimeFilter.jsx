
import React, {
    createContext,
    useContext,
    forwardRef
} from 'react';

import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';

import 'react-datepicker/dist/react-datepicker.css';
import './DateTimeFilter.css';

const TimeContext = createContext(null);

// Main input: displays date + start time + end time
const CustomDateInput = forwardRef(
    ({ displayValue, ...props }, ref) => (
        <input
            {...props}
            ref={ref}
            value={displayValue}
            readOnly
            placeholder="Select date and time"
            className="filter-input"
        />
    )
);

CustomDateInput.displayName = 'CustomDateInput';

// Calendar with Start Time and End Time at the bottom
const CalendarContainer = ({ className, children }) => {
    const {
        startTime,
        endTime,
        onStartTimeChange,
        onEndTimeChange
    } = useContext(TimeContext);

    return (
        <div className={`${className || ''} custom-calendar-container`}>
            <div className="calendar-section">
                {children}
            </div>

            <div className="calendar-time-footer">

                <div className="calendar-time-field">
                    <label>Start time</label>

                    <input
                        type="time"
                        value={startTime || ''}
                        onChange={(e) => onStartTimeChange(e.target.value)}
                    />
                </div>

                <div className="calendar-time-field">
                    <label>End time</label>

                    <input
                        type="time"
                        value={endTime || ''}
                        min={startTime || undefined}
                        onChange={(e) => onEndTimeChange(e.target.value)}
                    />
                </div>

            </div>
        </div>
    );
};

// Convert 24-hour time to AM/PM
const formatTime = (time) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const DateTimeFilter = ({
    date,
    startTime,
    endTime,
    onDateChange,
    onStartTimeChange,
    onEndTimeChange,
    onClear,
    onApply,
    disableClear
}) => {

    const today = new Date();

    // Show only the current year and previous 4 years
    const minDate = new Date(
        today.getFullYear() - 4,
        0,
        1
    );

    // Convert YYYY-MM-DD to Date object using local time
    const selectedDate = date
        ? new Date(`${date}T00:00:00`)
        : null;

    // Display selected date and both times in the main input
    const displayValue = date
        ? `${date.split('-').reverse().join('-')} | ${formatTime(startTime)} - ${formatTime(endTime)}`
        : '';

    // Apply validation
    const handleApply = () => {

        if (!date || !startTime || !endTime) {
            toast.error('Please select date, start time and end time');
            return;
        }

        if (startTime >= endTime) {
            toast.error('End time must be greater than start time');
            return;
        }

        onApply();
    };

    const contextValue = {
        startTime,
        endTime,
        onStartTimeChange,
        onEndTimeChange
    };

    return (
        <div className="datetime-filter">

            <TimeContext.Provider value={contextValue}>

                <div className="date-picker-wrapper">

                    <label>Select Date & Time</label>

                    <DatePicker
                        selected={selectedDate}

                        onChange={(value) => {
                            if (!value) return;

                            const year = value.getFullYear();

                            const month = String(
                                value.getMonth() + 1
                            ).padStart(2, '0');

                            const day = String(
                                value.getDate()
                            ).padStart(2, '0');

                            onDateChange(`${year}-${month}-${day}`);
                        }}

                        customInput={
                            <CustomDateInput
                                displayValue={displayValue}
                            />
                        }

                        dateFormat="dd-MM-yyyy"

                        minDate={minDate}
                        maxDate={today}

                        calendarContainer={CalendarContainer}

                        shouldCloseOnSelect={false}
                        showPopperArrow={false}

                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"

                        isClearable={false}
                    />

                </div>

            </TimeContext.Provider>

            {/* Apply and Clear buttons */}
            <div className="filter-actions">

                <button
                    type="button"
                    className="apply-btn"
                    onClick={handleApply}
                >
                    Apply
                </button>

                <button
                    type="button"
                    className="clear-btn"
                    onClick={onClear}
                    disabled={disableClear}
                >
                    Clear
                </button>

            </div>

        </div>
    );
};

DateTimeFilter.propTypes = {
    date: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,

    onDateChange: PropTypes.func.isRequired,
    onStartTimeChange: PropTypes.func.isRequired,
    onEndTimeChange: PropTypes.func.isRequired,

    onClear: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,

    disableClear: PropTypes.bool.isRequired
};

export default DateTimeFilter;
