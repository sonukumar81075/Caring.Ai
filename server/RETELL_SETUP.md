# Retell Integration Setup

This document explains how to configure the Retell SDK integration for assessment request batch calls.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Retell Configuration
RETELL_API_KEY=your_retell_api_key_here
RETELL_FROM_NUMBER=+14157774444
```

## Required Environment Variables

### RETELL_API_KEY
- **Description**: Your Retell API key for authentication
- **Required**: Yes
- **Example**: `rta_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **How to get**: Sign up at [Retell AI](https://retellai.com) and get your API key from the dashboard

### RETELL_FROM_NUMBER
- **Description**: The phone number that will be used as the caller ID for batch calls
- **Required**: No (defaults to +14157774444 if not provided)
- **Example**: `+14157774444`
- **Format**: Must be in E.164 format (e.g., +1 for US numbers)

## Installation

1. Install the Retell SDK:
```bash
npm install retell-sdk
```

2. Add the environment variables to your `.env` file

3. Restart your server

## How It Works

When a clinic creates a new assessment request:

1. The system validates all required fields
2. A Retell batch call is created using the patient's phone number
3. The complete batch call response data is stored with the assessment request
4. The response includes the Retell batch call information

## Response Format

The API response now includes Retell batch call information:

```json
{
  "success": true,
  "message": "Assessment request submitted successfully",
  "data": {
    // ... assessment request data
    "retellBatchCallData": {
      "batch_call_id": "batch_call_dbcc4412483ebfc348abb",
      "name": "Assessment Call - John Doe - 2024-01-15",
      "from_number": "+14157774444",
      "scheduled_timestamp": 1735718400,
      "total_task_count": 1
    }
  },
  "retellBatchCall": {
    "success": true,
    "batchCallId": "batch_call_dbcc4412483ebfc348abb",
    "batchCallData": {
      "batch_call_id": "batch_call_dbcc4412483ebfc348abb",
      "name": "Assessment Call - John Doe - 2024-01-15",
      "from_number": "+14157774444",
      "scheduled_timestamp": 1735718400,
      "total_task_count": 1
    },
    "error": null
  }
}
```

## Error Handling

If the Retell API call fails:
- The assessment request will still be created successfully
- The `retellBatchCall.success` will be `false`
- The error message will be included in `retellBatchCall.error`
- No batch call data will be stored

## Additional Functions

The Retell service also provides these utility functions:

- `getBatchCallStatus(batchCallId)` - Get the status of a batch call
- `cancelBatchCall(batchCallId)` - Cancel a batch call

## Troubleshooting

1. **Invalid API Key**: Make sure your `RETELL_API_KEY` is correct
2. **Invalid Phone Number**: Ensure phone numbers are in E.164 format
3. **Network Issues**: Check your internet connection and Retell service status
4. **Rate Limits**: Retell has API rate limits - check their documentation
