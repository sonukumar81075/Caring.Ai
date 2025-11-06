import { ErrorMessage, Field } from "formik";

export const DetailField = ({
  label,
  name,
  isEditing,
  type = "text",
  readOnlyValue,
  mockInitialData,
}) => (
  <div className=" ">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    {isEditing ? (
      // EDIT STATE: Editable Input Field
      <>
        <Field
          name={name}
          type={type}
          className="w-full px-3 py-2 h-12 border border-gray-300 rounded-lg p-3 focus:outline-1 outline-gray-400 placeholder-gray-500"
        />
        <ErrorMessage
          name={name}
          component="div"
          className="text-red-600 text-xs mt-1"
        />
      </>
    ) : (
      // VIEW STATE: Read-Only Display
      <p className="p-2 bg-white border h-12 border-gray-200 rounded-md text-gray-800 cursor-not-allowed overflow-hidden">
        {readOnlyValue || mockInitialData?.[name] || ""}
      </p>
    )}
  </div>
);
