import Retell from "retell-sdk";

// Initialize Retell client
const initializeRetellClient = () => {
    const apiKey = process.env.RETELL_API_KEY;

    if (!apiKey) {
        throw new Error("RETELL_API_KEY environment variable is required");
    }

    return new Retell({
        apiKey: apiKey,
    });
};

// Create batch call for assessment request
export const createAssessmentBatchCall = async(requestAssessmentData) => {
    try {
        const client = initializeRetellClient();

        // Extract phone numbers
        const fromNumber = process.env.RETELL_FROM_NUMBER || '+12314030748';
        const toNumber = "+91" + requestAssessmentData.phoneNumber;

        if (!toNumber) {
            throw new Error(
                "Patient phone number is required for batch call creation"
            );
        }

        // Extract date/time info
        const { assessmentDate, timeHour, timeMinute, timeAmPm, timezone, patientName } = requestAssessmentData;

        // Validate date
        if (!assessmentDate) {
            throw new Error('Assessment date is missing');
        }

        // Parse the assessment date
        const date = new Date(assessmentDate);

        // Convert to 24-hour format
        let hour24 = parseInt(timeHour, 10);
        if (timeAmPm === 'PM' && hour24 !== 12) hour24 += 12;
        if (timeAmPm === 'AM' && hour24 === 12) hour24 = 0;

        // Apply hours/minutes to date
        date.setHours(hour24, parseInt(timeMinute, 10), 0, 0);

        // Timezone offsets (in hours from UTC)
        const timezoneOffsets = {
            'Eastern Time (ET)': -5,
            'Eastern Time - Toronto (ET)': -5,
            'Central Time (CT)': -6,
            'Mountain Time (MT)': -7,
            'Pacific Time (PT)': -8,
            'Pacific Time - Vancouver (PT)': -8,
            'Arizona Time (MST)': -7,
            'Alaska Time (AKT)': -9,
            'Hawaii Time (HST)': -10,
            //   'India Standard Time (IST)': +5.5, // Added IST support
        };

        // Convert to UTC timestamp properly
        let triggerTimestamp = date.getTime();
        if (timezoneOffsets[timezone] !== undefined) {
            const offsetHours = timezoneOffsets[timezone];
            triggerTimestamp = date.getTime() - (offsetHours * 60 * 60 * 1000);
        }

        // Ensure trigger time is in the future
        const now = Date.now();
        if (triggerTimestamp <= now) {
            console.warn("⚠️ Provided time is in the past, adjusting to 2 minutes in the future...");
            triggerTimestamp = now + 2 * 60 * 1000;

            // Verify the adjusted time is actually in the future
            if (triggerTimestamp <= Date.now()) {
                console.error("❌ Error: Failed to schedule call - adjusted time is still in the past");
                return {
                    success: false,
                    message: "Unable to schedule call - the scheduled time cannot be in the past. Please select a future date and time.",
                    error: "Invalid schedule time: adjusted timestamp is still not in the future",
                    batchCallId: null,
                    batchCallData: null
                };
            }
        }

        // Logging for verification
        console.log("📞 Assessment Call Scheduling Info:");
        console.log("Patient:", patientName);
        console.log("Assessment Date:", assessmentDate);
        console.log("Time:", `${timeHour}:${timeMinute} ${timeAmPm}`);
        console.log("Timezone:", timezone);
        console.log("Final Trigger Timestamp (UTC):", triggerTimestamp);
        console.log("Date (UTC):", new Date(triggerTimestamp).toISOString());

        // Prepare the batch call request
        const batchCallRequest = {
            from_number: fromNumber,
            tasks: [{ to_number: toNumber }],
            trigger_timestamp: triggerTimestamp,
            name: `Assessment Call - ${patientName} - ${new Date().toISOString().split('T')[0]}`
        };

        // Create the batch call
        const batchCallResponse = await client.batchCall.createBatchCall(batchCallRequest);

        return {
            success: true,
            batchCallId: batchCallResponse.batch_call_id,
            batchCallData: batchCallResponse,
        };

    } catch (error) {
        console.error('❌ Error creating Retell batch call:', error);
        return {
            success: false,
            message: "Failed to create assessment batch call",
            error: error.message,
            batchCallId: null,
            batchCallData: null,
        };
    }
};

// Get batch call status
export const getBatchCallStatus = async(batchCallId) => {
    try {
        const client = initializeRetellClient();

        const batchCall = await client.batchCall.retrieveBatchCall(batchCallId);

        return {
            success: true,
            batchCall: batchCall,
        };
    } catch (error) {
        console.error("Error retrieving Retell batch call:", error);
        return {
            success: false,
            error: error.message,
            batchCall: null,
        };
    }
};

// Cancel batch call
export const cancelBatchCall = async(batchCallId) => {
    try {
        const client = initializeRetellClient();

        await client.batchCall.deleteBatchCall(batchCallId);

        return {
            success: true,
            message: "Batch call cancelled successfully",
        };
    } catch (error) {
        console.error("Error cancelling Retell batch call:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};