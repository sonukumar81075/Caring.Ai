import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import requestAssessmentService from "../services/requestAssessmentService";
import { AiFillCheckCircle, AiOutlineUnorderedList } from "react-icons/ai";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import { MdInfoOutline } from "react-icons/md";
import { ScoreProgressBar } from "../components/ScoreProgressBar";

const CognitiveReportPrint = () => {
  const { id } = useParams();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  // Fetch assessment data by ID
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Decode the base64 ID
        const normalized = id.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized + "===".slice((normalized.length + 3) % 4);
        const decodedId = atob(padded);

        // Fetch assessment data
        const response =
          await requestAssessmentService.getRequestAssessmentById(decodedId);

        if (response.success) {
          setAssessmentData(response.data);
        } else {
          setError(response.message || "Failed to fetch assessment data");
        }
      } catch (e) {
        console.error("Failed to fetch assessment data:", e);
        setError(e.message || "Failed to fetch assessment data");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [id]);

  // Helper function to format date
  const formatDate = (dateString, format = "long") => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (format === "short") {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.log(error);
      return "N/A";
    }
  };

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.log(error);

      return "N/A";
    }
  };

  // Helper function to calculate age group from age
  const getAgeGroup = (age) => {
    if (!age) return "N/A";
    if (age < 18) return "<18";
    if (age >= 18 && age < 25) return "18–24";
    if (age >= 25 && age < 35) return "25–34";
    if (age >= 35 && age < 45) return "35–44";
    if (age >= 45 && age < 55) return "45–54";
    if (age >= 55 && age < 65) return "55–64";
    if (age >= 65 && age < 75) return "65–74";
    if (age >= 75 && age < 85) return "75–84";
    if (age >= 85 && age < 95) return "85–94";
    return "95+";
  };

  // Helper function to calculate date of birth from age and assessment date
  const calculateDateOfBirth = (age, assessmentDate) => {
    if (!age || !assessmentDate) return null;
    try {
      const assessDate = new Date(assessmentDate);
      const birthYear = assessDate.getFullYear() - age;
      // Approximate date of birth (using mid-year)
      return new Date(birthYear, 5, 15); // June 15th of birth year
    } catch (error) {
      console.log(error);

      return null;
    }
  };

  // Get patient data with fallbacks
  const getPatientData = () => {
    if (!assessmentData) {
      return {
        name: "Loading...",
        dateOfBirth: "Loading...",
        gender: "Loading...",
        ageGroup: "Loading...",
        assessmentDate: "Loading...",
        assessmentId: "Loading...",
        reportGenerated: new Date().toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    }

    const age = assessmentData.age || 0;
    const assessmentDate = assessmentData.assessmentDate;
    const dateOfBirth = calculateDateOfBirth(age, assessmentDate);

    return {
      name: assessmentData.patientName || "N/A",
      dateOfBirth: dateOfBirth ? formatDate(dateOfBirth) : "N/A",
      gender: assessmentData.gender || "N/A",
      ageGroup: getAgeGroup(age),
      assessmentDate: formatDate(assessmentDate, "short"),
      assessmentId: assessmentData._id || "N/A",
      reportGenerated: formatDateTime(new Date()),
    };
  };

  const patientData = getPatientData();

  // Function to recursively convert all oklch colors in element styles to RGB
  const fixOklchColors = (element) => {
    if (!element) return;

    const allElements = element.querySelectorAll("*");
    const colorProperties = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
    ];

    allElements.forEach((el) => {
      const originalStyle = window.getComputedStyle(el);

      colorProperties.forEach((prop) => {
        try {
          const value = originalStyle.getPropertyValue(prop);

          // Check if the computed value is in oklch format
          if (value && (value.includes("oklch") || value.trim() === "")) {
            // Get the actual computed color value (which browser converts to rgb)
            const computedValue = originalStyle[prop];

            // If it's a valid RGB value, apply it
            if (
              computedValue &&
              (computedValue.startsWith("rgb") ||
                computedValue.startsWith("rgba") ||
                computedValue === "transparent")
            ) {
              el.style.setProperty(prop, computedValue, "important");
            } else if (value.includes("oklch")) {
              // Create a temporary element with same classes to get RGB value
              const tempEl = document.createElement("div");
              tempEl.className = el.className;
              tempEl.style.cssText = window.getComputedStyle(el).cssText;
              document.body.appendChild(tempEl);
              const tempComputed = window.getComputedStyle(tempEl);
              const rgbValue = tempComputed[prop];
              document.body.removeChild(tempEl);

              if (
                rgbValue &&
                (rgbValue.startsWith("rgb") || rgbValue.startsWith("rgba"))
              ) {
                el.style.setProperty(prop, rgbValue, "important");
              }
            }
          }
        } catch (e) {
          console.log(e);

          // Ignore errors for specific properties
        }
      });
    });
  };

  console.log("fixOklchColors", fixOklchColors);

  // Function to inject CSS that converts all colors to RGB
  const injectRgbCss = (clonedDoc) => {
    try {
      // Remove the download button from clone
      const downloadBtn = clonedDoc.querySelector(".fixed");
      if (downloadBtn) {
        downloadBtn.remove();
      }

      // Remove style tags that contain oklch, but keep others
      const styleTags = clonedDoc.querySelectorAll("style");
      styleTags.forEach((style) => {
        try {
          const cssText = style.textContent || style.innerHTML || "";
          if (cssText.includes("oklch")) {
            style.remove();
          }
        } catch (e) {
          console.log(e);
          // Ignore
        }
      });

      // Create a comprehensive style element with all necessary CSS (including layout)
      const styleElement = clonedDoc.createElement("style");
      styleElement.id = "pdf-rgb-override";

      // Comprehensive CSS with RGB colors AND layout styles
      const rgbOverrides = `
        /* Reset and base styles */
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        /* Page layout */
        .page {
          background: rgb(255, 255, 255) !important;
          width: 210mm !important;
          min-height: 297mm !important;
          padding: 32px !important;
          margin: 0 auto 20px !important;
          box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
          page-break-after: always;
          page-break-inside: avoid;
        }
        
        /* Typography */
        .eyebrow {
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: rgb(100, 116, 139) !important;
          margin-bottom: 4px !important;
        }
        
        .h2 {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: rgb(30, 41, 59) !important;
          margin-bottom: 16px !important;
        }
        
        .h3 {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: rgb(30, 41, 59) !important;
          margin-bottom: 12px !important;
        }
        
        /* Slate colors */
        .text-slate-900, [class*="text-slate-900"] { color: rgb(15, 23, 42) !important; }
        .text-slate-800, [class*="text-slate-800"] { color: rgb(30, 41, 59) !important; }
        .text-slate-700, [class*="text-slate-700"] { color: rgb(51, 65, 85) !important; }
        .text-slate-600, [class*="text-slate-600"] { color: rgb(71, 85, 105) !important; }
        .text-slate-500, [class*="text-slate-500"] { color: rgb(100, 116, 139) !important; }
        .bg-slate-50, [class*="bg-slate-50"] { background-color: rgb(248, 250, 252) !important; }
        .bg-slate-100, [class*="bg-slate-100"] { background-color: rgb(241, 245, 249) !important; }
        .border-slate-200, [class*="border-slate-200"] { border-color: rgb(226, 232, 240) !important; }
        
        /* blue colors */
        .text-[#BAA377], [class*="text-[#BAA377]"] { color: rgb(67, 56, 202) !important; }
        .bg-[#BAA377], [class*="bg-[#BAA377]"] { background-color: rgb(79, 70, 229) !important; }
        .bg-blue-50, [class*="bg-blue-50"] { background-color: rgb(238, 242, 255) !important; }
        .border-blue-200, [class*="border-blue-200"] { border-color: rgb(199, 210, 254) !important; }
        
        /* Emerald colors */
        .text-emerald-700, [class*="text-emerald-700"] { color: rgb(16, 185, 129) !important; }
        .bg-emerald-50, [class*="bg-emerald-50"] { background-color: rgb(236, 253, 245) !important; }
        .border-emerald-200, [class*="border-emerald-200"] { border-color: rgb(167, 243, 208) !important; }
        l
        /* Rose colors */
        .bg-rose-600, [class*="bg-rose-600"] { background-color: rgb(225, 29, 72) !important; }
        .bg-rose-50, [class*="bg-rose-50"] { background-color: rgb(255, 241, 242) !important; }
        .border-rose-200, [class*="border-rose-200"] { border-color: rgb(254, 205, 211) !important; }
        
        /* Amber colors */
        .bg-amber-50, [class*="bg-amber-50"] { background-color: rgb(255, 251, 235) !important; }
        .border-amber-200, [class*="border-amber-200"] { border-color: rgb(253, 230, 138) !important; }
        
        /* White */
        .bg-white, [class*="bg-white"] { background-color: rgb(255, 255, 255) !important; }
        .text-white, [class*="text-white"] { color: rgb(255, 255, 255) !important; }
        
        /* Gray colors */
        .bg-gray-100, [class*="bg-gray-100"] { background-color: rgb(243, 244, 246) !important; }
        .bg-gray-400, [class*="bg-gray-400"] { background-color: rgb(156, 163, 175) !important; }
        .text-gray-700, [class*="text-gray-700"] { color: rgb(55, 65, 81) !important; }
        .border-gray-200, [class*="border-gray-200"] { border-color: rgb(229, 231, 235) !important; }
        
        /* Layout utilities - Flexbox */
        .flex { display: flex !important; }
        .grid { display: grid !important; }
        .items-center { align-items: center !important; }
        .items-start { align-items: flex-start !important; }
        .justify-between { justify-content: space-between !important; }
        .justify-start { justify-content: flex-start !important; }
        .justify-end { justify-content: flex-end !important; }
        
        /* Gaps */
        .gap-2 { gap: 0.5rem !important; }
        .gap-3 { gap: 0.75rem !important; }
        .gap-4 { gap: 1rem !important; }
        .gap-6 { gap: 1.5rem !important; }
        
        /* Margins */
        .mb-4 { margin-bottom: 1rem !important; }
        .mb-6 { margin-bottom: 1.5rem !important; }
        .mb-8 { margin-bottom: 2rem !important; }
        .mt-1 { margin-top: 0.25rem !important; }
        .mt-2 { margin-top: 0.5rem !important; }
        .mt-3 { margin-top: 0.75rem !important; }
        .mt-4 { margin-top: 1rem !important; }
        .mt-6 { margin-top: 1.5rem !important; }
        .mt-8 { margin-top: 2rem !important; }
        .mr-1 { margin-right: 0.25rem !important; }
        .mr-3 { margin-right: 0.75rem !important; }
        
        /* Padding */
        .p-4 { padding: 1rem !important; }
        .p-5 { padding: 1.25rem !important; }
        .p-6 { padding: 1.5rem !important; }
        .p-8 { padding: 2rem !important; }
        .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
        .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
        .pt-2 { padding-top: 0.5rem !important; }
        .pt-4 { padding-top: 1rem !important; }
        .pb-4 { padding-bottom: 1rem !important; }
        .pl-5 { padding-left: 1.25rem !important; }
        .pl-6 { padding-left: 1.5rem !important; }
        
        /* Border radius */
        .rounded { border-radius: 0.25rem !important; }
        .rounded-lg { border-radius: 0.5rem !important; }
        .rounded-xl { border-radius: 0.75rem !important; }
        .rounded-full { border-radius: 9999px !important; }
        
        /* Borders */
        .border { border-width: 1px !important; border-style: solid !important; }
        .border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
        .border-t { border-top-width: 1px !important; border-top-style: solid !important; }
        .border-l { border-left-width: 1px !important; border-left-style: solid !important; }
        .border-r { border-right-width: 1px !important; border-right-style: solid !important; }
        
        /* Overflow */
        .overflow-hidden { overflow: hidden !important; }
        
        /* Typography - Line height */
        .leading-tight { line-height: 1.25 !important; }
        .leading-relaxed { line-height: 1.625 !important; }
        .leading-normal { line-height: 1.5 !important; }
        
        /* Typography - Font weight */
        .font-medium { font-weight: 500 !important; }
        .font-semibold { font-weight: 600 !important; }
        .font-bold { font-weight: 700 !important; }
        
        /* Typography - Font size */
        .text-sm { font-size: 0.875rem !important; }
        .text-xs { font-size: 0.75rem !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-base { font-size: 1rem !important; }
        /* Arbitrary font sizes */
        [class*="text-[13px]"], [class*="13px"] { font-size: 13px !important; }
        [class*="text-[15px]"], [class*="15px"] { font-size: 15px !important; }
        
        /* Typography - Text align */
        .text-right { text-align: right !important; }
        .text-left { text-align: left !important; }
        .text-center { text-align: center !important; }
        
        /* Lists */
        .list-disc { list-style-type: disc !important; }
        .list-decimal { list-style-type: decimal !important; }
        
        /* Spacing utilities */
        .space-y-2 > * + * { margin-top: 0.5rem !important; }
        .space-y-3 > * + * { margin-top: 0.75rem !important; }
        .space-y-4 > * + * { margin-top: 1rem !important; }
        .space-y-5 > * + * { margin-top: 1.25rem !important; }
        
        /* Grid */
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .md\\:grid-cols-2, [class*="md:grid-cols-2"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .md\\:grid-cols-3, [class*="md:grid-cols-3"] { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .md\\:grid-cols-4, [class*="md:grid-cols-4"] { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .md\\:col-span-1, [class*="md:col-span-1"] { grid-column: span 1 / span 1 !important; }
        .md\\:col-span-2, [class*="md:col-span-2"] { grid-column: span 2 / span 2 !important; }
        
        /* Width & Height */
        .min-h-screen { min-height: 100vh !important; }
        .w-full { width: 100% !important; }
        .h-full { height: 100% !important; }
        .h-8 { height: 2rem !important; }
        .w-8 { width: 2rem !important; }
        .max-w-none { max-width: none !important; }
        
        /* Position */
        .relative { position: relative !important; }
        .absolute { position: absolute !important; }
        .fixed { position: fixed !important; }
        
        /* Z-index */
        .z-50 { z-index: 50 !important; }
        
        /* Object fit */
        .object-cover { object-fit: cover !important; }
        
        /* Images */
        img { max-width: 100% !important; height: auto !important; display: block !important; }
        
        /* Buttons */
        button { cursor: pointer !important; }
        button:disabled { cursor: not-allowed !important; opacity: 0.6 !important; }
        
        /* Shadows */
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
        
        /* Prose styling */
        .prose { max-width: 65ch !important; }
        .prose h3 { font-size: 1.125rem !important; font-weight: 600 !important; margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; }
        .prose ul { margin-top: 0.75rem !important; margin-bottom: 0.75rem !important; padding-left: 1.25rem !important; }
        .prose li { margin-bottom: 0.5rem !important; }
        
        /* No break for PDF */
        .no-break { page-break-inside: avoid !important; break-inside: avoid !important; }
        
        /* HTML elements */
        section { display: block !important; }
        div { display: block !important; }
        .section { display: block !important; }
        p { display: block !important; margin: 0.5em 0 !important; }
        ul { display: block !important; margin: 1em 0 !important; padding-left: 2rem !important; }
        li { display: list-item !important; }
        ol { display: block !important; margin: 1em 0 !important; padding-left: 2rem !important; }
        em { font-style: italic !important; }
        strong { font-weight: 600 !important; }
        span { display: inline !important; }
        aside { display: block !important; }
        
        /* Arbitrary width values */
        [class*="w-[210mm]"] { width: 210mm !important; }
        [class*="min-h-[297mm]"] { min-height: 297mm !important; }
        
        /* Flex shrink */
        .flex-shrink-0 { flex-shrink: 0 !important; }
        
        /* Ensure content is visible */
        [class*="page"] { display: block !important; visibility: visible !important; opacity: 1 !important; }
        [class*="bg-"] { display: block !important; }
        
        /* Custom spacing for prose */
        .prose-slate { color: rgb(51, 65, 85) !important; }
        
        /* Button states */
        .hover\\:bg-blue-700:hover { background-color: rgb(67, 56, 202) !important; }
        .hover\\:bg-gray-800:hover { background-color: rgb(31, 41, 55) !important; }
        .hover\\:bg-gray-700:hover { background-color: rgb(55, 65, 81) !important; }
        
        /* Transition */
        .transition-colors { transition-property: color, background-color, border-color !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
      `;

      styleElement.textContent = rgbOverrides;
      clonedDoc.head.insertBefore(styleElement, clonedDoc.head.firstChild);
    } catch (e) {
      console.warn("Error injecting RGB CSS:", e);
    }
  };

  // Function to generate and download PDF using html2canvas and jsPDF directly
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      setIsGeneratingPDF(true);

      const element = reportRef.current;
      const patientName = patientData.name || "Report";
      const fileName = `Cognitive_Assessment_Report_${patientName.replace(
        /\s+/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.pdf`;

      // Check if content exists
      const pages = element.querySelectorAll(".page");
      if (pages.length === 0) {
        alert(
          "Report content not found. Please refresh the page and try again."
        );
        setIsGeneratingPDF(false);
        return;
      }

      console.log("PDF Generation - Pages found:", pages.length);

      // Create PDF instance
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      });

      // Get A4 dimensions in mm
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Ensure page is visible
        page.style.display = "block";
        page.style.visibility = "visible";
        page.style.opacity = "1";
        page.style.position = "relative";
        page.style.margin = "0 auto";

        console.log(`Processing page ${i + 1}/${pages.length}`);

        // Capture the page as canvas
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: true,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
          onclone: async (clonedDoc, clonedElement) => {
            try {
              // Inject RGB CSS in the cloned document
              injectRgbCss(clonedDoc);

              // Wait for styles to apply
              await new Promise((resolve) => setTimeout(resolve, 50));

              // Copy important computed styles as inline styles
              const allElements = clonedElement.querySelectorAll("*");
              allElements.forEach((el) => {
                try {
                  const computedStyle =
                    clonedDoc.defaultView?.getComputedStyle(el);
                  if (!computedStyle) return;

                  // Fix visibility
                  if (
                    computedStyle.display === "none" &&
                    !el.classList.contains("hidden")
                  ) {
                    el.style.display = "";
                  }
                  if (computedStyle.visibility === "hidden") {
                    el.style.visibility = "visible";
                  }
                  if (computedStyle.opacity === "0") {
                    el.style.opacity = "1";
                  }

                  // Copy important layout properties as inline styles
                  const importantProps = [
                    "display",
                    "flexDirection",
                    "alignItems",
                    "justifyContent",
                    "gap",
                    "gridTemplateColumns",
                    "gridTemplateRows",
                    "gridColumn",
                    "gridRow",
                    "width",
                    "height",
                    "minWidth",
                    "minHeight",
                    "maxWidth",
                    "maxHeight",
                    "marginTop",
                    "marginBottom",
                    "marginLeft",
                    "marginRight",
                    "paddingTop",
                    "paddingBottom",
                    "paddingLeft",
                    "paddingRight",
                    "fontSize",
                    "fontWeight",
                    "lineHeight",
                    "color",
                    "backgroundColor",
                    "borderWidth",
                    "borderStyle",
                    "borderColor",
                    "borderRadius",
                    "textAlign",
                    "listStyleType",
                  ];

                  importantProps.forEach((prop) => {
                    try {
                      const value = computedStyle[prop];
                      if (
                        value &&
                        value !== "none" &&
                        value !== "auto" &&
                        value !== "normal"
                      ) {
                        // Convert camelCase to kebab-case for CSS
                        const cssProp = prop
                          .replace(/([A-Z])/g, "-$1")
                          .toLowerCase();
                        el.style.setProperty(cssProp, value, "important");
                      }
                    } catch (e) {
                      console.log(e);
                      // Ignore individual property errors
                    }
                  });
                } catch (e) {
                  console.log(e);
                  // Ignore per-element errors
                }
              });
            } catch (e) {
              console.warn("Error in onclone:", e);
            }
          },
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Convert pixels to mm (96 DPI standard)
        const pixelsToMM = 0.264583; // 1 pixel = 0.264583 mm at 96 DPI
        const imgWidthMM = imgWidth * pixelsToMM;
        const imgHeightMM = imgHeight * pixelsToMM;

        // Calculate scaling to fit A4 page
        const widthRatio = pdfWidth / imgWidthMM;
        const heightRatio = pdfHeight / imgHeightMM;
        const ratio = Math.min(widthRatio, heightRatio);

        const scaledWidth = imgWidthMM * ratio;
        const scaledHeight = imgHeightMM * ratio;

        // Add new page (except for first page)
        if (i > 0) {
          pdf.addPage();
        }

        // Center the image on the page
        const xOffset = (pdfWidth - scaledWidth) / 2;
        const yOffset = (pdfHeight - scaledHeight) / 2;

        // Add image to PDF
        pdf.addImage(
          imgData,
          "JPEG",
          xOffset,
          yOffset,
          scaledWidth,
          scaledHeight,
          undefined,
          "FAST"
        );
      }

      // Save PDF
      pdf.save(fileName);
      console.log("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Show loading or error state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-700">
            Loading report...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .page {
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0;
            padding: 32px;
          }
          
          .page:last-child {
            page-break-after: auto;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        }
        
        .page {
          background: white;
          // width: 350mm;
          min-height: 297mm;
          padding: 32px;
          margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        @media (max-width: 639px) {
          .page {
            padding: 20px;
          }
        }
        @media print {
          .page {
            margin: 0;
            box-shadow: none;
          }
          
          body {
            background: white;
          }
        }
        
        .eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 4px;
        }
        
        .h2 {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
        }
        
        .h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        
        .prose {
          color: #334155;
        }
        
        .prose h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        
        .prose ul {
          margin-top: 12px;
          margin-bottom: 12px;
        }
        
        .prose li {
          margin-bottom: 8px;
        }
      `}</style>

      {/* Download PDF Button - Fixed position */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF || loading}
          className="flex items-center gap-2 px-4 py-3  bg-color bg-hover text-white cursor-pointer rounded-md shadow-lg   transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="Download Report as PDF"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </span>
        </button>
      </div>

      <div
        ref={reportRef}
        className="min-h-screen bg-gray-100   print:bg-white "
      >
        {/* PAGE 1 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="sm:grid grid-cols-3 items-center flex  justify-between sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight s   items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 1 of 14</div>
            </div>
          </div>

          {/* <div className="leading-tight items-center text-center sm:hidden block justify-end mb-6  ">
            <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
            <div className="text-[13px] text-slate-500">
              Cognitive Assessment Report
            </div>
          </div> */}

          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="rounded-xl overflow-hidden mb-8">
            <div className="p-4 bg-[#334155] border-b border-slate-200 ">
              <div className="text-lg font-[600] text-white items-center text-center ">
                Patient Details
              </div>
            </div>
            <div className="space-y-3 grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6 mb-8 p-5 border-l border-r border-b rounded-br-xl rounded-bl-xl bg-gray-50  border-slate-200">
              <div>
                <div className="text-md text-slate-800 font-[600]">
                  Patient Name:
                </div>
                <div className="text-md font-medium">{patientData.name}</div>
              </div>
              <div>
                <div className="text-md text-slate-800 font-[600]">
                  Date of Birth:
                </div>
                <div className="text-md font-medium">
                  {patientData?.dateOfBirth}
                </div>
              </div>
              <div>
                <div className="text-md text-slate-800 font-[600]">Gender:</div>
                <div className="text-md font-medium">{patientData.gender}</div>
              </div>
              <div>
                <div className="text-md text-slate-800 font-[600]">Group:</div>
                <div className="text-md font-medium">
                  {patientData.ageGroup}
                </div>
              </div>
              <div>
                <div className="text-md text-slate-800 font-[600]">
                  Assessment Date:
                </div>
                <div className="text-md font-medium">
                  {patientData.assessmentDate}
                </div>
              </div>

              <div>
                <div className="text-md text-slate-800 font-[600]">
                  Assessment ID:
                </div>
                <div className="text-md font-medium">
                  {patientData.assessmentId}
                </div>
              </div>
              <div>
                <div className="text-md text-slate-800 font-[600]">
                  Report Generated:
                </div>
                <div className="text-md font-medium">
                  {patientData.reportGenerated}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden">
            <div className="p-4 bg-[#334155] border-b border-slate-200 ">
              <div className="text-lg font-[600] text-white items-center text-center ">
                Clinical Triage Recommendation
              </div>
            </div>
            <div className=" bg-gray-50 space-y-5 p-5 border-l border-r border-b rounded-br-xl rounded-bl-xl  border-slate-200">
              <div>
                <div className="eyebrow">Cognitive Status Interpretation</div>
                <p className="mt-1 leading-relaxed">
                  Recommend urgent neurological or geriatric psychiatry
                  evaluation for multi-domain cognitive impairment with safety
                  concerns; initiate dementia care management services
                  immediately.
                </p>
                <p className="mt-3 text-slate-700 leading-relaxed">
                  <span className="font-medium">Rationale:</span> Assessment
                  findings indicate probable Major Neurocognitive Disorder with
                  multi-domain cognitive impairment affecting attention,
                  executive function, and memory creating immediate safety risks
                  requiring urgent specialist evaluation and dementia care
                  management coordination.
                </p>
                <div className="mt-4">
                  <button className="px-4 py-1 rounded-full border border-rose-600 text-rose-600  text-sm font-medium">
                    REFER NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl   mt-8 overflow-hidden">
            {/* Header */}
            <div className="bg-[#334155] text-white text-center p-4 text-lg font-semibold">
              Cognitive Status Interpretation
            </div>

            {/* DSM-5 Section */}
            <div className="sm:p-6 p-3 border-l border-r border-b rounded-br-xl rounded-bl-xl bg-gray-50  border-slate-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                DSM-5 Criteria Assessment
              </h2>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl ">
                <table className="min-w-full text-sm border-l border-r border-b rounded-br-xl rounded-bl-xl bg-white  border-slate-200">
                  <thead>
                    <tr className="bg-[#334155] text-white text-left">
                      <th className="px-4 py-4 font-medium">Criteria</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="px-4 py-4 font-medium">
                        Supporting Evidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    <tr>
                      <td className="px-4 py-5 font-medium text-gray-900">
                        A. Cognitive Deficits
                      </td>
                      <td className="px-4 py-5 text-emerald-600 font-semibold flex items-center gap-1">
                        ✅ MET
                      </td>
                      <td className="px-4 py-5">
                        Significant impairment in Memory (14th percentile) and
                        Reasoning (14th percentile) domains
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-5 font-medium text-gray-900">
                        B. Functional Impact
                      </td>
                      <td className="px-4 py-5 text-emerald-600 font-semibold flex items-center gap-1">
                        ✅ MET
                      </td>
                      <td className="px-4 py-5">
                        IADL score 6/8 – Mild Functional decline affecting
                        telephone use and shopping independently
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-5 font-medium text-gray-900">
                        C. Not Due to Delirium
                      </td>
                      <td className="px-4 py-5 text-emerald-600 font-semibold flex items-center gap-1">
                        ✅ MET
                      </td>
                      <td className="px-4 py-5">
                        No acute confusion or fluctuating consciousness reported
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-5 font-medium text-gray-900">
                        D. Not Due to Mental Disorder
                      </td>
                      <td className="px-4 py-5 text-emerald-600 font-semibold flex items-center gap-1">
                        ✅ MET
                      </td>
                      <td className="px-4 py-5">
                        Minimal depression (GDS-15: 2/15) and anxiety (GAD-7:
                        1/21) symptoms
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 border border-gray-200 bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 text-base">
                    Clinical Interpretation
                  </h3>
                  <p className="mt-1 text-sm text-gray-800 leading-relaxed">
                    <span className="font-semibold">
                      Probable Major Neurocognitive Disorder
                    </span>{" "}
                    — Patient meets all DSM-5 criteria for Major NCD with
                    evidence of significant cognitive decline that interferes
                    with independence in everyday activities.
                  </p>
                </div>
              </div>

              {/* Clinical Interpretation */}
            </div>
          </div>
        </section>
        {/* PAGE 2 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 2 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Care Plan Recommendations
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            {/* Header */}

            {/* High-Risk Areas */}
            <div className="sm:p-6 p-3 ">
              <div className="p-4  bg-white rounded-xl ">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-bold text-[#BAA377]">
                    High-Risk Areas Requiring Immediate Attention:
                  </h2>
                  {/* List Icon */}
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6  text-gray-400 "
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
                </div>
                <ul className="list-disc ml-5 space-y-2 text-gray-700">
                  <li className="text-base">
                    <span className="font-bold">Financial management:</span>{" "}
                    Mathematical reasoning and executive deficits increase
                    vulnerability
                  </li>
                  <li className="text-base">
                    <span className="font-bold">Medication management:</span>{" "}
                    Memory and attention deficits affect adherence and safety
                  </li>
                </ul>
              </div>
            </div>

            {/* Recommended Immediate Actions */}
            <div className="sm:p-6 p-3 pt-0">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Recommended Immediate Actions
              </h2>
              <div className="space-y-6">
                {/* --- Priority 1 Section (Static) --- */}
                <div className="  bg-white  rounded-xl  ">
                  {/* Priority Title Bar */}
                  <div className="flex justify-between items-start p-4  ">
                    <div>
                      <h3 className="text-lg font-bold text-[#BAA377]">
                        Priority 1: Safety Assessment{" "}
                        <span className="font-bold">(Within 1–2 weeks)</span>
                      </h3>
                    </div>
                    {/* List Icon */}
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400 "
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Actions List */}
                  <ul className="list-disc ml-5 mr-3 px-4 pb-4 space-y-3 text-gray-700">
                    <li className="text-base leading-relaxed">
                      Comprehensive evaluation of driving capacity given
                      attention and executive deficits
                    </li>
                    <li className="text-base leading-relaxed">
                      Medication management review with pharmacist consultation
                    </li>
                    <li className="text-base leading-relaxed">
                      Financial management assessment and potential protective
                      measures
                    </li>
                    <li className="text-base leading-relaxed">
                      Home safety evaluation focusing on cognitive demands
                    </li>
                  </ul>
                </div>

                {/* --- Priority 2 Section (Static) --- */}
                <div className="bg-white rounded-xl">
                  {/* Priority Title Bar */}
                  <div className="flex justify-between items-start p-4 border-gray-200">
                    <div>
                      <h3 className="text-lg font-bold text-[#BAA377]">
                        Priority 2: Specialist Referral{" "}
                        <span className="font-bold">(Within 2–4 weeks)</span>
                      </h3>
                    </div>
                    {/* List Icon */}
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400 "
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Actions List */}
                  <ul className="list-disc ml-5 mr-3 px-4 pb-4 space-y-3 text-gray-700">
                    <li className="text-base leading-relaxed">
                      Neurological or geriatric psychiatry evaluation for
                      diagnostic confirmation
                    </li>
                    <li className="text-base leading-relaxed">
                      Neuropsychological testing for comprehensive cognitive
                      assessment
                    </li>
                    <li className="text-base leading-relaxed">
                      Medical workup to exclude reversible causes of cognitive
                      impairment
                    </li>
                  </ul>
                </div>

                {/* --- Priority 3 Section (Static) --- */}
                <div className="bg-white  rounded-xl">
                  {/* Priority Title Bar */}
                  <div className="flex justify-between items-start p-4 ">
                    <div>
                      <h3 className="text-lg font-bold text-[#BAA377]">
                        Priority 3: Care Coordination{" "}
                        <span className="font-bold">(Within 1–3 months)</span>
                      </h3>
                    </div>
                    {/* List Icon */}
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400 "
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Actions List */}
                  <ul className="list-disc ml-5 mr-3 px-4 pb-4 space-y-3 text-gray-700">
                    <li className="text-base leading-relaxed">
                      Multidisciplinary care team development
                    </li>
                    <li className="text-base leading-relaxed">
                      Caregiver education and support resource identification
                    </li>
                    <li className="text-base leading-relaxed">
                      Implementation of cognitive and functional support
                      strategies
                    </li>
                    <li className="text-base leading-relaxed">
                      Regular monitoring schedule establishment
                      <sup className="text-xs">20</sup>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 3 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 3 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Cognitive Domain Performance Summary
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="sm:p-6 p-3 ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Domains of Concern
                  </h2>
                  <div className="p-2 bg-red-50 rounded-full flex items-center justify-center">
                    <MdInfoOutline className="h-5 w-5 text-red-500" />
                  </div>
                </div>

                {/* Separator Line */}
                <div className="border-t border-gray-200 mb-6"></div>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-[600] text-gray-800 mb-1">
                        Complex Attention (18th percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Below typical range in attentional control
                      </p>
                    </div>
                  </div>

                  {/* Domain 2 */}
                  <div className="flex items-start">
                    {/* Orange Dot */}
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-[600] text-gray-800 mb-1">
                        Working Memory (8th percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Below typical range in delayed recall
                      </p>
                    </div>
                  </div>

                  {/* Domain 3 */}
                  <div className="flex items-start">
                    {/* Orange Dot */}
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-[600] text-gray-800 mb-1">
                        Executive Function (12th percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Below typical range in logical reasoning tasks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:px-6 px-3 pb-6">
              <div className=" w-full mx-auto bg-white  rounded-xl p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Preserved Domains
                  </h2>
                  <div className="p-2 bg-blue-50 rounded-full flex items-center justify-center">
                    <AiFillCheckCircle className="h-5 w-5 text-[#BAA377]" />
                  </div>
                </div>

                <div className="border-t border-gray-200 mb-6"></div>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-bold text-gray-800 mb-1">
                        Working Memory (22nd percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Within typical range
                      </p>
                    </div>
                  </div>

                  {/* Domain 2: Attention */}
                  <div className="flex items-start">
                    {/* Green Dot */}
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-bold text-gray-800 mb-1">
                        Attention (22nd percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Within typical range
                      </p>
                    </div>
                  </div>

                  {/* Domain 3: Executive Function */}
                  <div className="flex items-start">
                    {/* Green Dot */}
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-bold text-gray-800 mb-1">
                        Executive Function (22nd percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Within typical range
                      </p>
                    </div>
                  </div>

                  {/* Domain 4: Language */}
                  <div className="flex items-start">
                    {/* Green Dot */}
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-bold text-gray-800 mb-1">
                        Language (42nd percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Within typical range
                      </p>
                    </div>
                  </div>

                  {/* Domain 5: Orientation */}
                  <div className="flex items-start">
                    {/* Green Dot */}
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-lg font-bold text-gray-800 mb-1">
                        Orientation (31st percentile)-
                      </p>
                      <p className="text-base text-gray-600">
                        Within typical range
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 4 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 4 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />
          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Care Plan Recommendations
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-3 sm:p-6 md:p-6 lg:p-6 bg-gray-50   space-y-8">
              {/* Instrumental Activities of Daily Living (IADL) Card */}
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Instrumental Activities of Daily Living (IADL): 6/8
                  </h2>
                  {/* List Icon using React Icons */}
                  <div className="p-2 bg-blue-50 rounded-full flex items-center justify-center">
                    <AiOutlineUnorderedList className="h-5 w-5 text-[#BAA377]" />
                  </div>
                </div>

                {/* IADL Details List */}
                <ul className="list-disc ml-5 space-y-3 text-gray-700 mb-6">
                  <li className="text-base leading-relaxed">
                    <span className="font-semibold">Functional Status:</span>{" "}
                    Mild functional decline with selective dependencies
                  </li>
                  <li className="text-base leading-relaxed">
                    <span className="font-semibold">
                      Areas of Independence:
                    </span>{" "}
                    Housekeeping, laundry, meal preparation, medication
                    management, handling finances, transportation
                  </li>
                  <li className="text-base leading-relaxed">
                    <span className="font-semibold">
                      Areas Requiring Support:
                    </span>{" "}
                    Telephone use, shopping assistance needed
                  </li>
                </ul>
                <ScoreProgressBar current={6} total={8} label="Score" />
              </div>

              {/* Mental Health Screening Card */}
              <div className="w-full mx-auto bg-white   rounded-lg p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                  Mental Health Screening:
                </h2>

                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                  {/* Depression Card */}
                  <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center space-x-4">
                    <div className="text-center">
                      <div className="bg-white shadow-sm text-[#BAA377] font-semibold py-1 px-3 rounded-md text-sm">
                        Score <br /> 2/15
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[#BAA377]">
                        Depression (GDS-15)
                      </p>
                      <p className="text-gray-600 text-sm">
                        2/15 – Minimal symptoms<sup className="text-xs">4</sup>
                      </p>
                    </div>
                  </div>

                  {/* Anxiety Card */}
                  <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center space-x-4">
                    <div className="text-center">
                      <div className="bg-white shadow-sm text-[#BAA377] font-semibold py-1 px-3 rounded-md text-sm">
                        Score <br /> 1/21
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[#BAA377]">
                        Anxiety (GAD-7):
                      </p>
                      <p className="text-gray-600 text-sm">
                        1/21 – Minimal symptoms<sup className="text-xs">5</sup>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold mt-6 rounded-tl-xl rounded-tr-xl tracking-wide">
            Follow-up Schedule
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:px-14 bg-gray-50   space-y-8">
              <div className="w-full mx-auto bg-white   rounded-lg overflow-hidden">
                {/* Table Container */}
                <div className="w-full">
                  {/* Table Header */}
                  <div className="grid grid-cols-3 bg-[#334155] text-white font-semibold text-sm sm:text-base">
                    <div className="p-4 border-r border-[#BAA377]">
                      Timeframe
                    </div>
                    <div className="p-4 border-r border-[#BAA377]">
                      Action Required
                    </div>
                    <div className="p-4">Provider</div>
                  </div>

                  {/* Table Body - Static Rows */}
                  <div className="text-gray-700">
                    {/* Row 1 */}
                    <div className="grid grid-cols-3 border-b border-gray-200">
                      <div className="p-4 font-medium text-sm sm:text-base border-r border-gray-200">
                        1–2 weeks
                      </div>
                      <div className="p-4 text-sm sm:text-base border-r border-gray-200">
                        Safety Assessment
                      </div>
                      <div className="p-4 text-sm sm:text-base">
                        Primary Care/Care Management
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-3 border-b border-gray-200">
                      <div className="p-4 font-medium text-sm sm:text-base border-r border-gray-200">
                        2–4 weeks
                      </div>
                      <div className="p-4 text-sm sm:text-base border-r border-gray-200">
                        Specialist Referral
                      </div>
                      <div className="p-4 text-sm sm:text-base">
                        Neurology/Geriatrics
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-3 border-b border-gray-200">
                      <div className="p-4 font-medium text-sm sm:text-base border-r border-gray-200">
                        1–3 months
                      </div>
                      <div className="p-4 text-sm sm:text-base border-r border-gray-200">
                        Care Plan Development
                      </div>
                      <div className="p-4 text-sm sm:text-base">
                        Primary Care/Care Management
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-3">
                      <div className="p-4 font-medium text-sm sm:text-base border-r border-gray-200">
                        6–12 months
                      </div>
                      <div className="p-4 text-sm sm:text-base border-r border-gray-200">
                        Cognitive reassessment
                      </div>
                      <div className="p-4 text-sm sm:text-base">
                        CaringAI/Specialist
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 5 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 5 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Detailed Assessment Results
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50  ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                {/* Executive Summary Section */}
                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Executive Summary:
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    This comprehensive cognitive assessment utilizes a battery
                    of standardized tasks across five major cognitive domains:
                    **Complex Attention, Executive Function, Language, Learning
                    & Memory, and Orientation.** The assessment reveals a
                    pattern of selective cognitive impairment with specific
                    deficits in complex attention, memory systems, and executive
                    function while demonstrating relative preservation in the
                    other domains. This profile requires immediate clinical
                    attention and comprehensive care planning.
                  </p>
                </section>
                <hr className="border-0 h-px bg-gray-300 mb-8" />
                <section className="">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#BAA377] mb-8">
                    Domains of Concern
                  </h2>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    Complex Attention Domain
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base mb-6">
                    Complex attention encompasses the ability to sustain focus,
                    divide attention between tasks, and manage cognitive load
                    during demanding activities. This domain showed significant
                    impairment across multiple measures, indicating
                    **substantial difficulties** with attentional control and
                    executive strain.
                  </p>

                  <div className="p-4 sm:p-6 bg-gray-100   rounded-2xl">
                    <h4 className="text-base font-bold text-[#BAA377] mb-4">
                      Count Backward 20 to 1 (6CIT)
                    </h4>

                    <ul className="list-none space-y-4 text-gray-700">
                      <li className="text-base">
                        <span className="font-bold">Score:</span> 18th
                        percentile ( Below Typical Range )
                      </li>

                      <li className="text-base">
                        <span className="font-bold">Task Description:</span>{" "}
                        Assesses sustained attention and executive control by
                        requiring participants to maintain focus while
                        manipulating numerical sequences in working memory.
                      </li>

                      <li className="text-base">
                        <span className="font-bold">
                          Clinical Significance:
                        </span>{" "}
                        The impaired performance indicates dysfunction in
                        prefrontal–parietal attention networks and suggests
                        difficulties with tasks requiring sustained cognitive
                        effort.
                      </li>

                      <li className="text-base">
                        <span className="font-bold">Functional Impact:</span>{" "}
                        The inability to successfully complete backward counting
                        reflects compromised executive attention systems that
                        are crucial for daily activities requiring focus and
                        mental manipulation.
                      </li>

                      <li className="text-base">
                        <span className="font-bold">
                          Recommended Interventions:
                        </span>{" "}
                        Break down complex tasks into smaller components; review
                        medication management and financial decision-making
                        risks with caregiver oversight.
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 6 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 6 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Cognitive Domain Analysis
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 min-h-screen">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8 md:p-10 space-y-8">
                {/* --- Learning & Memory Domain Section --- */}
                <section className="border-b border-gray-200 pb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Learning & Memory Domain
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base mb-6">
                    Memory assessment revealed significant impairment in
                    episodic memory formation and retention, characteristic of
                    medial temporal lobe dysfunction.
                    <sup className="text-xs">4</sup>
                  </p>

                  {/* --- Nested Test Result Box (Delayed Address Recall) --- */}
                  <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl">
                    <h4 className="text-base font-bold text-[#BAA377] mb-4">
                      Delayed Address Recall (6CIT)
                    </h4>

                    <ul className="list-none space-y-4 text-gray-700">
                      {/* Score */}
                      <li className="text-base">
                        <span className="font-bold">Score:</span> 8th percentile
                        ( Below Typical Range )
                      </li>

                      {/* Task Description */}
                      <li className="text-base">
                        <span className="font-bold">Task Description:</span>{" "}
                        Assesses the ability to remember a list of words after a
                        delay, often impaired early in Alzheimer's disease
                      </li>

                      {/* Clinical Significance */}
                      <li className="text-base">
                        <span className="font-bold">
                          Clinical Significance:
                        </span>{" "}
                        This finding suggests significant difficulties with
                        episodic memory consolidation and retrieval
                      </li>

                      {/* Functional Impact */}
                      <li className="text-base">
                        <span className="font-bold">Functional Impact:</span>{" "}
                        This level of impairment significantly affects daily
                        functioning, including difficulty remembering recent
                        conversations, appointments, and important information
                        necessary for independent living.
                      </li>

                      {/* Recommended Interventions */}
                      <li className="text-base">
                        <span className="font-bold">
                          Recommended Interventions:
                        </span>{" "}
                        Implement external memory aids including calendars and
                        pill organizers; review medication management systems.
                      </li>
                    </ul>
                  </div>
                  {/* --- End Test Result Box --- */}
                </section>

                {/* --- Executive Function Domain Section --- */}
                <section>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Executive Function Domain
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base mb-6">
                    Executive function encompasses higher-order cognitive
                    processes including working memory, cognitive flexibility,
                    and abstract reasoning. This domain demonstrated significant
                    impairment across multiple measures, indicating
                    **substantial dysfunction** in prefrontal cortical systems.
                    <sup className="text-xs">6</sup>
                  </p>

                  {/* --- Nested Test Result Box (Digit Span Backwards) --- */}
                  <div className="p-4 sm:p-6 bg-gray-100   rounded-2xl">
                    <h4 className="text-base font-bold text-[#BAA377] mb-4">
                      Digit Span Backwards (Supplemental)
                    </h4>

                    <ul className="list-none space-y-4 text-gray-700">
                      {/* Score */}
                      <li className="text-base">
                        <span className="font-bold">Score:</span> 12th
                        percentile ( Below Typical Range )
                      </li>

                      {/* Task Description */}
                      <li className="text-base">
                        <span className="font-bold">Task Description:</span>{" "}
                        Backward digit counting requires working memory
                        manipulation and executive control, representing more
                        demanding cognitive processing than forward counting.
                      </li>

                      {/* Clinical Significance */}
                      <li className="text-base">
                        <span className="font-bold">
                          Clinical Significance:
                        </span>{" "}
                        Impaired performance indicates dysfunction in
                        dorsolateral prefrontal cortex and associated working
                        memory networks.
                      </li>

                      {/* Functional Impact */}
                      <li className="text-base">
                        <span className="font-bold">Functional Impact:</span>{" "}
                        This deficit significantly impacts the ability to
                        complete multi-step tasks and maintain complex
                        information in mind while manipulating it.
                      </li>

                      {/* Recommended Interventions */}
                      <li className="text-base">
                        <span className="font-bold">
                          Recommended Interventions:
                        </span>{" "}
                        Establish structured daily routines; provide stepwise
                        instructions for complex activities.
                      </li>
                    </ul>
                  </div>
                  {/* --- End Test Result Box --- */}
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 7 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 7 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Cognitive Domain Analysis
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50  ">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8 md:p-10 space-y-8">
                {/* --- Preserved Domains Header (Overall) --- */}
                <h2 className="text-xl sm:text-2xl font-bold text-[#BAA377] mb-4">
                  Preserved Domains
                </h2>

                {/* --- Orientation Domain Section --- */}
                <section className="border-b border-gray-200 pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    Orientation Domain
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base mb-6">
                    Orientation assessment revealed disorientation to temporal
                    information, indicating dysfunction in basic orientation
                    systems.
                  </p>

                  {/* --- Nested Test Result Box (Year / Month / Day of Week) --- */}
                  <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl">
                    <h4 className="text-base font-bold text-[#BAA377] mb-4">
                      Year / Month / Day of Week (6CIT)
                    </h4>

                    <ul className="list-none space-y-4 text-gray-700">
                      {/* Score */}
                      <li className="text-base">
                        <span className="font-bold">Score:</span> 31st
                        percentile ( Within Typical Range )
                      </li>

                      {/* Task Description */}
                      <li className="text-base">
                        <span className="font-bold">Task Description:</span>{" "}
                        Temporal orientation requires intact memory systems and
                        awareness of current context.
                      </li>

                      {/* Clinical Significance */}
                      <li className="text-base">
                        <span className="font-bold">
                          Clinical Significance:
                        </span>{" "}
                        Performance indicates preserved function in systems
                        responsible for maintaining awareness of time and date.
                      </li>
                    </ul>
                  </div>
                  {/* --- End Test Result Box --- */}
                </section>

                {/* --- Language Domain Section --- */}
                <section>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    Language Domain
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base mb-6">
                    Language assessment revealed mixed performance, with
                    specific deficits in fluency measures while maintaining some
                    basic language comprehension and expression abilities.
                  </p>

                  {/* --- Nested Test Result Box (Sentence Repetition) --- */}
                  <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl">
                    <h4 className="text-base font-bold text-[#BAA377] mb-4">
                      Sentence Repetition (2 phrases)
                    </h4>

                    <ul className="list-none space-y-4 text-gray-700">
                      {/* Score */}
                      <li className="text-base">
                        <span className="font-bold">Score:</span> 42nd
                        percentile (
                        <span className="text-green-600">
                          Within Typical Range
                        </span>
                        )
                      </li>

                      {/* Task Description */}
                      <li className="text-base">
                        <span className="font-bold">Task Description:</span>{" "}
                        Sentence repetition requires repeating two short
                        sentence prompts.
                      </li>

                      {/* Clinical Significance */}
                      <li className="text-base">
                        <span className="font-bold">
                          Clinical Significance:
                        </span>{" "}
                        Performance suggests preserved function in language
                        processing networks requiring both comprehension and
                        expression abilities.
                      </li>

                      {/* Functional Impact */}
                      <li className="text-base">
                        <span className="font-bold">Functional Impact:</span>{" "}
                        This indicates preserved effective communication,
                        following spoken instructions for daily interactions.
                      </li>
                    </ul>
                  </div>
                  {/* --- End Test Result Box --- */}
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 8 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 8 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Functional Assessment Details{" "}
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 ">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-6 md:p-10">
                {/* Header and Description */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                  Instrumental Activities of Daily Living (IADL)
                </h2>
                <p className="text-gray-700 leading-relaxed text-base mb-8">
                  The IADL scale evaluates an individual's ability to perform
                  complex daily tasks necessary for independent living. This
                  assessment is crucial for determining the level of support
                  needed and monitoring changes over time.
                  <sup className="text-xs">7</sup>
                </p>

                {/* --- Progress Bar and Score Section --- */}
                <ScoreProgressBar current={6} total={8} />
                {/* --- End Progress Bar and Score Section --- */}

                {/* List of IADL Activities (Multi-Column) */}
                <div className="text-gray-700 mt-10">
                  <ul className="list-disc columns-2 sm:columns-3 space-y-1 ml-5">
                    <li className="text-sm sm:text-base">
                      Housekeeping activities
                    </li>
                    <li className="text-sm sm:text-base">
                      Medication management
                    </li>
                    <li className="text-sm sm:text-base">Financial handling</li>
                    <li className="text-sm sm:text-base">Laundry management</li>
                    <li className="text-sm sm:text-base">Meal preparation</li>
                    <li className="text-sm sm:text-base">
                      Transportation arrangements
                    </li>
                    {/* Note: I'm keeping the list items as static JSX elements, but using `map` here for the numbers (0-8) is a standard practice for generating repetitive visual elements. */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#334155] text-white mt-6 p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Functional Assessment Details{" "}
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 ">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8 md:p-10">
                {/* --- Areas Requiring Support Section --- */}
                <section className="mb-8 border-b border-gray-200 pb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                    Areas Requiring Support (2/8 domains):
                  </h2>

                  {/* Progress Bar and Score Section */}
                  <ScoreProgressBar current={6} total={8} />
                  {/* End Progress Bar and Score Section */}

                  {/* List of Supported Areas */}
                  <ul className="list-disc ml-5 space-y-2 text-gray-700">
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">Telephone Use:</span> Patient
                      does not independently use telephone
                    </li>
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">Shopping:</span> Requires
                      accompaniment for shopping activities
                    </li>
                  </ul>
                </section>

                {/* --- Clinical Interpretation Section --- */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Clinical Interpretation:
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    The IADL score of 6/8 indicates **"low function,
                    dependent"** status, suggesting that while basic self-care
                    may be preserved, complex instrumental activities require
                    increasing support. This level of functional decline is
                    consistent with the cognitive impairments observed and
                    supports the diagnosis of **Major Neurocognitive Disorder**.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 9 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 9 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Mental Health Assessment Details
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                {/* Header and Description */}
                <section className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Depression Screening (GDS-15)
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    The Geriatric Depression Scale-15 is a validated 15-item
                    screening tool for depression in older adults with cutoff
                    $\geq$5 indicating possible depression and $\geq$10
                    indicating likely depression.
                    <sup className="text-xs">4</sup>
                  </p>
                </section>

                {/* --- Score and Reported Symptoms Box --- */}
                <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl flex flex-col sm:flex-row items-start sm:space-x-8 mb-8">
                  {/* Score Column (Left) */}
                  <div className="flex-shrink-0 text-center mb-4 sm:mb-0">
                    <div className="bg-white border border-gray-300 text-gray-800 py-2 px-4 flex rounded-md text-center ">
                      <span className="text-base font-bold text-[#BAA377]">
                        Score
                      </span>
                      <br />
                      <span className="text-lg font-bold ml-3">2/15</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      (Minimal symptoms)
                    </p>
                  </div>

                  {/* Reported Symptoms Column (Right) */}
                  <div>
                    <h3 className="font-bold text-[#BAA377] mb-2 text-base sm:text-lg">
                      Reported Symptoms:
                    </h3>
                    <ul className="list-disc ml-5 space-y-1 text-gray-700">
                      <li className="text-base">Mild endorsement on 2 items</li>
                      <li className="text-base">
                        All other items: No symptoms reported
                      </li>
                    </ul>
                  </div>
                </div>

                {/* --- Clinical Interpretation Section --- */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Clinical Interpretation:
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    The minimal depression score suggests that cognitive
                    symptoms are not primarily attributable to mood disorder,
                    supporting the differential diagnosis of neurocognitive
                    disorder.
                  </p>
                </section>
              </div>
            </div>
          </div>

          <div className="bg-[#334155] text-white mt-6 p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Mental Health Assessment Details
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                {/* Header and Description */}
                <section className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Anxiety Screening (GAD-7)
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    The Generalized Anxiety Disorder-7 scale screens for anxiety
                    symptoms and severity.
                    <sup className="text-xs">9</sup>
                  </p>
                </section>

                {/* --- Score and Reported Symptoms Box --- */}
                <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl flex flex-col sm:flex-row items-start sm:space-x-8 mb-8">
                  {/* Score Column (Left) */}
                  <div className="flex-shrink-0 text-center mb-4 sm:mb-0">
                    <div className="bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded-md text-center flex">
                      <span className="text-base font-bold text-[#BAA377]">
                        Score
                      </span>
                      <br />
                      <span className="text-lg font-bold ml-2">1/15</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      (Minimal symptoms)
                    </p>
                  </div>

                  {/* Reported Symptoms Column (Right) */}
                  <div>
                    <h3 className="font-bold text-[#BAA377] mb-2 text-base sm:text-lg">
                      Reported Symptoms:
                    </h3>
                    <ul className="list-disc ml-5 space-y-1 text-gray-700">
                      <li className="text-base">
                        Trouble controlling worry (several days in past 2 weeks)
                      </li>
                      <li className="text-base">All other items: Not at all</li>
                    </ul>
                  </div>
                </div>

                {/* --- Clinical Interpretation Section --- */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Clinical Interpretation:
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    Minimal anxiety symptoms further support that cognitive
                    impairments are not primarily due to psychiatric
                    comorbidities.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 10 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 10 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Understanding Cognitive Decline and Dementia
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50  ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                {/* Cognitive Assessment in Clinical Practice Section */}
                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Cognitive Assessment in Clinical Practice
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    Cognitive decline represents a spectrum from normal aging
                    through **Mild Cognitive Impairment (MCI)** to **Major
                    Neurocognitive Disorder (dementia)**. Early identification
                    is crucial for implementing appropriate interventions and
                    support systems.<sup className="text-xs">10</sup>
                  </p>
                </section>

                {/* DSM-5 Diagnostic Framework Section */}
                <section className="mb-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    DSM-5 Diagnostic Framework
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base mb-6">
                    The Diagnostic and Statistical Manual of Mental Disorders,
                    Fifth Edition (DSM-5), provides standardized criteria for
                    neurocognitive disorders:
                  </p>

                  {/* --- Mild Neurocognitive Disorder (MCI) Box --- */}
                  <div className="p-4 sm:p-6 bg-gray-100   rounded-2xl">
                    <h3 className="text-lg font-bold text-[#BAA377] mb-3">
                      Mild Neurocognitive Disorder (MCI):
                    </h3>

                    <ul className="list-disc ml-5 space-y-2 text-gray-700">
                      <li className="text-base leading-relaxed">
                        Evidence of modest cognitive decline from previous level
                        of performance
                      </li>
                      <li className="text-base leading-relaxed">
                        Cognitive deficits do not interfere with capacity for
                        independence in everyday activities
                      </li>
                      <li className="text-base leading-relaxed">
                        May represent prodromal stage of dementia
                      </li>
                    </ul>
                  </div>
                  {/* --- End MCI Box --- */}
                </section>
              </div>
            </div>
          </div>

          <div className="bg-[#334155] text-white mt-6 p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Understanding Cognitive Decline and Dementia
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50  ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                <section className=" ">
                  <div className="p-4 sm:p-6 bg-gray-100   rounded-2xl">
                    <h3 className="text-lg font-bold text-[#BAA377] mb-3">
                      Major Neurocognitive Disorder (Dementia):
                    </h3>

                    <ul className="list-disc ml-5 space-y-2 text-gray-700">
                      <li className="text-base leading-relaxed">
                        Evidence of significant cognitive decline from previous
                        level of performance
                      </li>
                      <li className="text-base leading-relaxed">
                        Cognitive deficits interfere with independence in
                        everyday activities
                      </li>
                      <li className="text-base leading-relaxed">
                        Represents substantial functional impairment requiring
                        care planning
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 11 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 11 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Understanding Cognitive Decline and Dementia
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50  ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                {/* Cognitive Assessment in Clinical Practice Section */}
                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Cognitive Domains Assessed
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    CaringAI Listen evaluates key cognitive domains identified
                    as early markers of neurodegenerative disease:
                    <sup className="text-xs">11</sup>.
                  </p>
                </section>

                <section className="mb-6">
                  <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl">
                    <h3 className="text-lg font-bold text-[#BAA377] mb-3">
                      Memory Systems:
                    </h3>

                    <ul className="list-disc ml-5 space-y-2 text-gray-700">
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Episodic Memory:</span>{" "}
                        Storage and retrieval of personal experiences and events
                      </li>
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Working Memory:</span>{" "}
                        Temporary maintenance and manipulation of information
                      </li>
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Spatial Memory:</span>{" "}
                        Navigation and location-based memory systems
                      </li>
                    </ul>
                  </div>
                  {/* --- End MCI Box --- */}
                </section>
                <section className="mb-6">
                  <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl">
                    <h3 className="text-lg font-bold text-[#BAA377] mb-3">
                      Executive Functions:
                    </h3>

                    <ul className="list-disc ml-5 space-y-2 text-gray-700">
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">
                          Planning and Organization:{" "}
                        </span>{" "}
                        Goal-directed behavior and strategy development
                      </li>
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Inhibitory Control: </span>{" "}
                        Suppression of inappropriate responses
                      </li>
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">
                          {" "}
                          Cognitive Flexibility:{" "}
                        </span>
                        Adaptation to changing task demands
                      </li>
                    </ul>
                  </div>
                  {/* --- End MCI Box --- */}
                </section>
                <section className="mb-6">
                  <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl">
                    <h3 className="text-lg font-bold text-[#BAA377] mb-3">
                      Attention and Processing:
                    </h3>

                    <ul className="list-disc ml-5 space-y-2 text-gray-700">
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Sustained Attention: </span>{" "}
                        Maintenance of focus over time
                      </li>
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Selective Attention: </span>{" "}
                        Filtering relevant from irrelevant information
                      </li>
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Processing Speed: </span>
                        Rate of cognitive operations
                      </li>
                    </ul>
                  </div>
                  {/* --- End MCI Box --- */}
                </section>
                <section className="mb-0">
                  <div className="p-4 sm:p-6 bg-gray-100  rounded-2xl">
                    <h3 className="text-lg font-bold text-[#BAA377] mb-3">
                      Language and ommunication:
                    </h3>

                    <ul className="list-disc ml-5 space-y-2 text-gray-700">
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">Verbal Reasoning: </span>{" "}
                        Logic and comprehension in linguistic contexts
                      </li>
                      <li className="text-base leading-relaxed">
                        <span className="font-bold">
                          Phonological Processing:{" "}
                        </span>{" "}
                        Sound-based language manipulation
                      </li>
                    </ul>
                  </div>
                  {/* --- End MCI Box --- */}
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 12 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 12 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Understanding Cognitive Decline and Dementia
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8 md:p-10">
                {/* --- Clinical Significance of Findings Section --- */}
                <section className="mb-6 border-b border-gray-200 pb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Clinical Significance of Findings
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base mb-4">
                    The pattern of impairment observed—significant memory and
                    reasoning deficits with relative preservation of attention,
                    executive function, and language—is consistent with amnestic
                    presentations commonly seen in early Alzheimer’s disease.
                    <sup className="text-xs">12</sup> This profile suggests:
                  </p>

                  <ul className="list-disc ml-5 space-y-2 text-gray-700">
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">
                        Primary Memory System Involvement:
                      </span>{" "}
                      Hippocampal and medial temporal lobe dysfunction
                    </li>
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">
                        Secondary Reasoning Deficits:
                      </span>{" "}
                      Possible extension to association cortices
                    </li>
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">
                        Preserved Core Functions:
                      </span>{" "}
                      Intact attention and executive networks suggest focal
                      rather than global impairment
                    </li>
                  </ul>
                </section>

                {/* --- Importance of Early Detection Section --- */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Importance of Early Detection
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base mb-4">
                    Early identification of cognitive decline enables:
                    <sup className="text-xs">13</sup>
                  </p>

                  <ul className="list-disc ml-5 space-y-2 text-gray-700">
                    <li className="text-base leading-relaxed">
                      Implementation of evidence-based interventions
                    </li>
                    <li className="text-base leading-relaxed">
                      Safety planning and risk mitigation
                    </li>
                    <li className="text-base leading-relaxed">
                      Caregiver education and support services
                    </li>
                    <li className="text-base leading-relaxed">
                      Advanced directive planning
                    </li>
                    <li className="text-base leading-relaxed">
                      Enrollment in clinical trials and research studies
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl mt-6 rounded-tr-xl tracking-wide">
            Clinical Decision Support
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8 md:p-10">
                {/* --- Importance of Early Detection Section --- */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Referral Guidelines
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base mb-4">
                    Based on assessment findings, specialist evaluation is
                    recommended to:
                  </p>

                  <ul className="list-disc ml-5 space-y-2 text-gray-700">
                    <li className="text-base leading-relaxed">
                      Confirm diagnostic impression through comprehensive
                      neuropsychological testing
                    </li>
                    <li className="text-base leading-relaxed">
                      Evaluate for reversible causes of cognitive impairment
                    </li>
                    <li className="text-base leading-relaxed">
                      Initiate appropriate pharmacological and
                      non-pharmacological interventions
                    </li>
                    <li className="text-base leading-relaxed">
                      Develop comprehensive care plans addressing safety,
                      function, and quality of life
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 13 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 13 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl rounded-tr-xl tracking-wide">
            Clinical Decision Support
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8 md:p-10">
                {/* --- Clinical Significance of Findings Section --- */}
                <section className="mb-6 border-b border-gray-200 pb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Clinical Significance of Findings
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base mb-4">
                    This assessment provides structured documentation
                    supporting:
                  </p>

                  <ul className="list-disc ml-5 space-y-2 text-gray-700">
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">CPT Code 99483:</span>{" "}
                      Cognitive assessment and care plan services
                    </li>
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">
                        Annual Wellness Visit (AWV)
                      </span>{" "}
                      cognitive screening requirements
                    </li>
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">GUIDE Model</span> dementia
                      care coordination programs
                    </li>
                    <li className="text-base leading-relaxed">
                      <span className="font-bold">
                        Medicare Shared Savings Program
                      </span>{" "}
                      quality measures
                    </li>
                  </ul>
                </section>

                {/* --- Importance of Early Detection Section --- */}
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Quality Metrics and Outcomes
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-base mb-4">
                    Regular cognitive assessment supports quality improvement
                    initiatives:
                    <sup className="text-xs">13</sup>
                  </p>

                  <ul className="list-disc ml-5 space-y-2 text-gray-700">
                    <li className="text-base leading-relaxed">
                      Early detection rates for cognitive impairment
                    </li>
                    <li className="text-base leading-relaxed">
                      Timely specialist referral completion
                    </li>
                    <li className="text-base leading-relaxed">
                      Care plan development and implementation
                    </li>
                    <li className="text-base leading-relaxed">
                      Patient and caregiver satisfaction with care coordination
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl mt-6 rounded-tr-xl tracking-wide">
            Glossary of Terms
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                {/* --- List of Definitions --- */}
                <div className="space-y-6 text-gray-700">
                  {/* Definition 1: CaringAI Listen Enhanced Assessment */}
                  <div className="flex items-start">
                    {/* Custom SVG Diamond Icon (Red Outline) */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">
                        CaringAI Listen Enhanced Assessment:
                      </span>{" "}
                      A telephone-based cognitive evaluation system measuring
                      structured cognitive tasks, designed for primary care
                      integration and population-level screening.
                    </p>
                  </div>

                  {/* Definition 2: DSM-5 Criteria */}
                  <div className="flex items-start">
                    {/* Custom SVG Diamond Icon (Blue Outline) */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">DSM-5 Criteria:</span>{" "}
                      Standardized diagnostic criteria from the Diagnostic and
                      Statistical Manual of Mental Disorders, Fifth Edition,
                      used for clinical diagnosis of neurocognitive disorders.
                    </p>
                  </div>

                  {/* Definition 3: Instrumental Activities of Daily Living (IADL) */}
                  <div className="flex items-start">
                    {/* Filled Blue Diamond Icon (SVG) */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">
                        Instrumental Activities of Daily Living (IADL):
                      </span>{" "}
                      Complex daily tasks required for independent community
                      living, including telephone use, shopping, housekeeping,
                      meal preparation, and financial management.
                    </p>
                  </div>

                  {/* Definition 4: Major Neurocognitive Disorder */}
                  <div className="flex items-start">
                    {/* Filled Blue Diamond Icon (SVG) */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">
                        Major Neurocognitive Disorder:
                      </span>{" "}
                      DSM-5 term for dementia, characterized by significant
                      cognitive decline that interferes with independence in
                      everyday activities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* PAGE 14 */}
        <section className="page bg-white max-w-screen-xl min-h-[297mm] p-8">
          <div className="grid grid-cols-3 items-center   justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-40 h-auto flex items-center">
                <img
                  src="/logo/logo__2_-removebg-preview (1).png"
                  alt="CaringAI Listen"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <div className="leading-tight items-center text-center justify-end  ">
              <div className="text-[#BAA377] font-semibold">CaringAI Listen</div>
              <div className="text-[13px] text-slate-500">
                Cognitive Assessment Report
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              <div className="font-medium">Page 14 of 14</div>
            </div>
          </div>
          <hr className="border-0 h-px bg-gray-300 mb-8" />

          <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold  rounded-tl-xl mt-6 rounded-tr-xl tracking-wide">
            Glossary of Terms
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 ">
              <div className="w-full mx-auto bg-white  rounded-xl p-6 sm:p-8 md:p-10">
                <div className="space-y-6 text-gray-700">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377"
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">
                        Mild Cognitive Impairment (MCI):
                      </span>{" "}
                      Cognitive decline greater than expected for age but not
                      severe enough to significantly interfere with daily
                      functioning.
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">Percentile Rank:</span>{" "}
                      Statistical measure indicating the percentage of the
                      comparison group that scored below the patient's
                      performance level.
                    </p>
                  </div>

                  {/* Definition 3: Instrumental Activities of Daily Living (IADL) */}
                  <div className="flex items-start">
                    {/* Filled Blue Diamond Icon (SVG) */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">
                        Geriatric Depression Scale-15:
                      </span>{" "}
                      a validated 15-item screening tool for depression symptoms
                      in older adults with cutoff ≥5 for possible depression.
                    </p>
                  </div>

                  {/* Definition 4: Major Neurocognitive Disorder */}
                  <div className="flex items-start">
                    {/* Filled Blue Diamond Icon (SVG) */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">GAD-7: </span>Generalized
                      Anxiety Disorder-7 scale, a validated screening instrument
                      for anxiety symptoms.
                    </p>
                  </div>
                  <div className="flex items-start">
                    {/* Filled Blue Diamond Icon (SVG) */}
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#BAA377" // Tailwind blue-500
                        stroke="none"
                      >
                        <path d="M23 12L12 23L1 12L12 1L23 12Z"></path>
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold">Triage Categories: </span>
                      Clinical decision support classifications
                      (Refer/Assess/Monitor) that guide next steps in cognitive
                      care pathways.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#334155] text-white p-4 text-center text-xl  font-semibold  rounded-tl-xl mt-6 rounded-tr-xl tracking-wide">
            References
          </div>
          <div className="w-full mx-auto bg-gray-50 border-l border-b border-r  border-gray-300  rounded-br-xl rounded-bl-xl overflow-hidden">
            <div className="p-4 sm:p-6 md:p-6 lg:p-6 bg-gray-50 ">
              <div className="w-full mx-auto bg-white   rounded-xl p-6 sm:p-8 md:p-10">
                {/* --- References List --- */}
                <ol className="list-none space-y-5 text-gray-800 text-sm sm:text-base">
                  {/* Reference 1 */}
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-800 mr-2 flex-shrink-0">
                      1.
                    </span>
                    <p className="leading-relaxed">
                      American Psychiatric Association. Diagnostic and
                      Statistical Manual of Mental Disorders, Fifth Edition
                      (DSM-5). Arlington, VA: American Psychiatric Publishing;
                      2013.
                    </p>
                  </li>

                  {/* Reference 2 */}
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-800 mr-2 flex-shrink-0">
                      2.
                    </span>
                    <p className="leading-relaxed">
                      Centers for Medicare & Medicaid Services. CMS launches
                      model aimed at improving dementia care – GUIDE Model. July
                      2024.
                    </p>
                  </li>

                  {/* Reference 3 */}
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-800 mr-2 flex-shrink-0">
                      3.
                    </span>
                    <p className="leading-relaxed">
                      Lawton MP, Brody EM. Assessment of older people:
                      self-maintaining and instrumental activities of daily
                      living. Gerontologist. 1969;9(3):179–186.
                    </p>
                  </li>

                  {/* Reference 4 */}
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-800 mr-2 flex-shrink-0">
                      4.
                    </span>
                    <p className="leading-relaxed">
                      Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of
                      a brief depression severity measure. J Gen Intern Med.
                      2001;16(9):606–613.
                    </p>
                  </li>

                  {/* Reference 5 */}
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-800 mr-2 flex-shrink-0">
                      5.
                    </span>
                    <p className="leading-relaxed">
                      Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief
                      measure for assessing generalized anxiety disorder: the
                      GAD-7. Arch Intern Med. 2006;166(10):1092–1097.
                    </p>
                  </li>

                  {/* Reference 6 (with URL) */}
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-800 mr-2 flex-shrink-0">
                      6.
                    </span>
                    <p className="leading-relaxed">
                      Centers for Medicare & Medicaid Services. Cognitive
                      Assessment & Care Plan Services CPT Code 99483. Available
                      from:{" "}
                      <a
                        href="https://www.cms.gov/medicare/payment/fee-schedules/physician/cognitive-assessment"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://www.cms.gov/medicare/payment/fee-schedules/physician/cognitive-assessment
                      </a>
                    </p>
                  </li>

                  {/* Reference 7 */}
                  <li className="flex items-start">
                    <span className="font-semibold text-gray-800 mr-2 flex-shrink-0">
                      7.
                    </span>
                    <p className="leading-relaxed">
                      Brooke N, et al. The Six Item Cognitive Impairment Test
                      (6CIT): validation and practical use. Int J Geriatr
                      Psychiatry. 1999;14(11):936–940.
                    </p>
                  </li>
                </ol>
                {/* --- End References List --- */}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CognitiveReportPrint;
