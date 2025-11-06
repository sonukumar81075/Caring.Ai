import { Mail, Lock, User, ArrowRight, XCircle } from "lucide-react";
const InputField = ({
  name,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
}) => {
  // Determine the icon based on the input name
  const getIcon = () => {
    switch (name) {
      case "email":
        return Mail;
      case "password":
        return Lock;
      case "name": // Added support for 'name' based on the image provided earlier
        return User;
      default:
        return User;
    }
  };

  const Icon = getIcon();

  return (
    <div className="mb-6">
      <div
        className={`flex items-center bg-white border ${
          error && touched ? "border-red-500" : "border-gray-200"
        } rounded-xl shadow-xs transition-all duration-200 focus-within:ring-1 focus-within:ring-[#475569]/50 focus-within:border-transparent`}
      >
        <div className="px-4 text-gray-400">
          <Icon size={20} />
        </div>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full px-2 py-3 text-md bg-transparent focus:outline-none placeholder-gray-500"
        />
      </div>
      {error && touched && (
        <div className="flex items-center mt-2 text-red-500 text-sm pl-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default InputField;
