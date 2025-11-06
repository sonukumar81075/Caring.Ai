// Scheduling.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";

// List of timezones based on your image
const timezones = [
  "Eastern Time (ET)",
  "Eastern Time - Toronto (ET)",
  "Central Time (CT)",
  "Mountain Time (MT)",
  "Pacific Time (PT)",
  "Pacific Time - Vancouver (PT)",
  "Arizona Time (MST)",
  "Alaska Time (AKT)",
  "Hawaii Time (HST)",
];

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
); // 01 to 12
const minutes = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
];
const Scheduling = ({
  initialValues,
  validationSchema,
  onSubmit,
  prevStep,
}) => {
  const initialStepValues = {
    assessmentDate: initialValues.assessmentDate || "",
    timezone: initialValues.timezone || "Eastern Time (ET)",
    timeHour: initialValues.timeHour || "09",
    timeMinute: initialValues.timeMinute || "00",
    timeAmPm: initialValues.timeAmPm || "AM",
  };

  return (
    <Formik
      initialValues={initialStepValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ isSubmitting, values, errors, touched, setFieldValue }) => {
        const isDateSelected = !!values.assessmentDate;

        const selectedTimeDisplay =
          isDateSelected &&
          values.timeHour &&
          values.timeMinute &&
          values.timeAmPm &&
          values.timezone ? (
            <p className="text-gray-600 text-sm mt-3">
              Selected:{" "}
              <span className="font-semibold">
                {values.timeHour}:{values.timeMinute} {values.timeAmPm} (
                {values.timezone})
              </span>
            </p>
          ) : null;

        return (
          <Form>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  Schedule Assessment
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    // Calculate time 5 minutes from now
                    const now = new Date();
                    const futureTime = new Date(now.getTime() + 5 * 60000); // Add 5 minutes
                    
                    // Format date as YYYY-MM-DD
                    const year = futureTime.getFullYear();
                    const month = String(futureTime.getMonth() + 1).padStart(2, '0');
                    const day = String(futureTime.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;
                    
                    // Get hours and minutes
                    let hours = futureTime.getHours();
                    const minutes = String(futureTime.getMinutes()).padStart(2, '0');
                    
                    // Convert to 12-hour format
                    const amPm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12 || 12; // Convert 0 to 12 for midnight
                    const formattedHour = String(hours).padStart(2, '0');
                    
                    // Set all the fields
                    setFieldValue('assessmentDate', formattedDate);
                    setFieldValue('timeHour', formattedHour);
                    setFieldValue('timeMinute', minutes);
                    setFieldValue('timeAmPm', amPm);
                  }}
                  className="px-4 py-2.5 border border-gray-300 text-color text-sm rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 cursor-pointer "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Schedule (+5 min)
                </button>
              </div>
              <p className="text-gray-500 mb-6">
                Choose when the assessment call should be made.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assessment Date */}
                <div>
                  <label
                    htmlFor="assessmentDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assessment Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Field
                      type="date"
                      id="assessmentDate"
                      name="assessmentDate"
                      className="mt-1 block w-full border border-gray-300   rounded-lg   p-3   focus:outline-1 outline-gray-400 placeholder-gray-500"
                    />
                    <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                  <ErrorMessage
                    name="assessmentDate"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Timezone */}
                <div className="relative">
                  <label
                    htmlFor="timezone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assessment Time ( Timezone ){" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Field
                      as="select"
                      id="timezone"
                      name="timezone"
                      className="mt-1 block appearance-none w-full border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </Field>
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                  <ErrorMessage
                    name="timezone"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Time Hour/Minute/AM/PM (Conditional) */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="timeHour"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Time <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-3 mt-1">
                    {/* Hour */}
                    <div className="w-1/3">
                      <label
                        htmlFor="timeHour"
                        className="text-xs text-gray-500 block mb-1"
                      >
                        Hour
                      </label>
                      <Field
                        as="select"
                        id="timeHour"
                        name="timeHour"
                        disabled={!isDateSelected}
                        className={`block border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 w-full placeholder-gray-500 text-black appearance-none ${
                          !isDateSelected
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {hours.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </Field>
                    </div>

                    {/* Minute */}
                    <div className="w-1/3">
                      <label
                        htmlFor="timeMinute"
                        className="text-xs text-gray-500 block mb-1"
                      >
                        Minute
                      </label>
                      <Field
                        as="select"
                        id="timeMinute"
                        name="timeMinute"
                        disabled={!isDateSelected}
                        className={`block border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black w-full appearance-none ${
                          !isDateSelected
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {minutes.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </Field>
                    </div>

                    {/* AM/PM */}
                    <div className="w-1/3">
                      <label
                        htmlFor="timeAmPm"
                        className="text-xs text-gray-500 block mb-1"
                      >
                        AM/PM
                      </label>
                      <Field
                        as="select"
                        id="timeAmPm"
                        name="timeAmPm"
                        disabled={!isDateSelected}
                        className={`block border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500 text-black w-full appearance-none ${
                          !isDateSelected
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </Field>
                    </div>
                  </div>

                  {/* Conditional Error Messages */}
                  {!isDateSelected && (
                    <div className="text-red-500 text-xs mt-1">
                      Please select an Assessment Date first.
                    </div>
                  )}
                  {/* Show time error only if date is selected */}
                  {errors.timeHour && touched.timeHour && isDateSelected && (
                    <div className="text-red-500 text-xs mt-1">
                      Please select a time.
                    </div>
                  )}

                  {selectedTimeDisplay}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 text-gray-600 font-medium rounded-lg cursor-pointer border border-gray-300 transition duration-150 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="block sm:hidden">Back</span>
                  <span className="hidden sm:block">
                    Back to Assessment Details
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !isDateSelected ||
                    (isDateSelected && !values.timeHour)
                  }
                  className="px-6 py-2.5 bg-color bg-hover text-white rounded-lg transition-colors duration-200 cursor-pointer font-medium flex items-center disabled:opacity-50"
                >
                  <span className="block sm:hidden">Continue</span>
                  <span className="hidden sm:block">Continue to Consent</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default Scheduling;
