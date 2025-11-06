import React from "react";

export const BookingQueueCards = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] p-6 border flex sm:flex-row justify-between border-gray-200 outline-1 outline-offset-[-1px] outline-white/40 ">
      <p className="text-gray-500 mb-2">{title}</p>
      <h2
        className={` ${
          title === "Top Action" ? "text-md" : "text-xl"
        } font-semibold text-gray-800`}
      >
        {value}
      </h2>
    </div>
  );
};
