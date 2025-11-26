import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import requestAssessmentService from "../services/requestAssessmentService";
import { AiFillCheckCircle, AiOutlineUnorderedList } from "react-icons/ai";
import { Download } from "lucide-react";
import { MdInfoOutline } from "react-icons/md";
import { ScoreProgressBar } from "../components/ScoreProgressBar";
import { pdf } from "@react-pdf/renderer";
import CognitiveReportPDF from "../components/CognitiveReportPDF";

const questionData = [
  {
    questionCode: "question_iadl_medications",
    questionString: "Can you manage your medications?",
    response: "you want to adjust your Tailwind React code so that the “right cards” (with score: 1) ",
    score: 1,
  },
  {
    questionCode: "question_iadl_finances",
    questionString: "Can you handle your own finances?",
    response: "Myself. Yes. I can handle my own finances. I have no problems with my finances. ",
    score: 1,
  },
  {
    questionCode: "question_6cit_orientation_year",
    questionString: "What year is it now?",
    response: "Twenty twenty five. I know the current year. I can tell you the current year. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
  {
    questionCode: "question_6cit_orientation_month",
    questionString: "What month is it now?",
    response: "It's October. I know the current month. I can tell you the current month. ",
    score: 0,
  },
];
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

  // ✅ PDF download handler using @react-pdf/renderer
  const handleDownloadPDF = async () => {
    if (isGeneratingPDF || loading || !assessmentData) {
      return;
    }

    try {
      setIsGeneratingPDF(true);

      const patientName = patientData.name || "Report";
      const sanitizedName = patientName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      const fileName = `Cognitive_Assessment_Report_${sanitizedName || "Report"}_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;

      // Get logo URL for PDF
      const logoUrl = `${window.location.origin}/logo/logo__2_-removebg-preview (1).png`;

      // Create PDF document with all data
      const doc = (
        <CognitiveReportPDF
          patientData={patientData}
          logoUrl={logoUrl}
          questionData={questionData}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Legacy function - kept for reference but not used
  const sanitizeStylesheets = (clonedDoc) => {
    try {
      // Remove all style tags that contain oklch
      const styleTags = clonedDoc.querySelectorAll("style");
      styleTags.forEach((style) => {
        try {
          const cssText = style.textContent || style.innerHTML || "";
          if (cssText.includes("oklch") || cssText.includes("oklab")) {
            style.remove();
          }
        } catch (e) {
          // Ignore errors
        }
      });

      // Remove stylesheets from link tags that might contain oklch
      const linkTags = clonedDoc.querySelectorAll("link[rel='stylesheet']");
      linkTags.forEach((link) => {
        try {
          link.remove();
        } catch (e) {
          // Ignore errors
        }
      });

      // CRITICAL: Remove oklch from ALL SVG elements before html2canvas processes them
      // This is where the error occurs - SVGElementContainer2 encounters oklch
      // We need to convert computed styles to RGB before html2canvas reads them
      const allSVGElements = clonedDoc.querySelectorAll("svg, path, circle, rect, g, line, polygon, polyline, ellipse, text, tspan");
      allSVGElements.forEach((svgEl) => {
        try {
          // Get the original element from the document to read computed styles
          // Find original by matching position or attributes
          let originalEl = null;
          try {
            // Try to find by matching attributes
            const tagName = svgEl.tagName;
            const parent = svgEl.parentElement;
            if (parent && parent.closest && parent.closest('.page')) {
              const originalParent = document.querySelector('.page');
              if (originalParent) {
                const index = Array.from(parent.children).indexOf(svgEl);
                const originalChildren = Array.from(originalParent.querySelectorAll(tagName));
                if (originalChildren[index]) {
                  originalEl = originalChildren[index];
                }
              }
            }
          } catch (e) {
            // Ignore
          }

          // Convert fill to RGB
          try {
            if (originalEl) {
              const computedFill = window.getComputedStyle(originalEl).fill;
              if (computedFill && (computedFill.includes("oklch") || computedFill.includes("oklab"))) {
                // Remove fill if it contains oklch - html2canvas will use default
                svgEl.removeAttribute("fill");
                svgEl.style.fill = "none";
              } else if (computedFill && computedFill !== "none" && computedFill !== "rgba(0, 0, 0, 0)") {
                // Set RGB fill
                svgEl.setAttribute("fill", computedFill);
                svgEl.style.fill = computedFill;
              }
            } else {
              // Remove oklch from fill attribute
              const fill = svgEl.getAttribute("fill");
              if (fill && (fill.includes("oklch") || fill.includes("oklab"))) {
                svgEl.removeAttribute("fill");
                svgEl.style.fill = "none";
              }
            }
          } catch (e) {
            // Remove fill if conversion fails
            svgEl.removeAttribute("fill");
          }

          // Convert stroke to RGB
          try {
            if (originalEl) {
              const computedStroke = window.getComputedStyle(originalEl).stroke;
              if (computedStroke && (computedStroke.includes("oklch") || computedStroke.includes("oklab"))) {
                svgEl.removeAttribute("stroke");
                svgEl.style.stroke = "none";
              } else if (computedStroke && computedStroke !== "none" && computedStroke !== "rgba(0, 0, 0, 0)") {
                svgEl.setAttribute("stroke", computedStroke);
                svgEl.style.stroke = computedStroke;
              }
            } else {
              const stroke = svgEl.getAttribute("stroke");
              if (stroke && (stroke.includes("oklch") || stroke.includes("oklab"))) {
                svgEl.removeAttribute("stroke");
                svgEl.style.stroke = "none";
              }
            }
          } catch (e) {
            svgEl.removeAttribute("stroke");
          }

          // Remove oklch from style attribute
          const styleAttr = svgEl.getAttribute("style");
          if (styleAttr && (styleAttr.includes("oklch") || styleAttr.includes("oklab"))) {
            const cleanedStyle = styleAttr.split(";").filter(prop =>
              !prop.includes("oklch") && !prop.includes("oklab")
            ).join(";");
            svgEl.setAttribute("style", cleanedStyle);
          }

          // Remove oklch from color attribute
          const color = svgEl.getAttribute("color");
          if (color && (color.includes("oklch") || color.includes("oklab"))) {
            svgEl.removeAttribute("color");
          }
        } catch (e) {
          // Ignore per-element errors
        }
      });

      // Also remove oklch from inline styles on all elements
      const allElements = clonedDoc.querySelectorAll("*");
      allElements.forEach((el) => {
        try {
          if (el.style && el.style.cssText) {
            const styleText = el.style.cssText || "";
            if (styleText.includes("oklch") || styleText.includes("oklab")) {
              const styleProps = styleText.split(";");
              const cleanedProps = styleProps.filter(prop =>
                !prop.includes("oklch") && !prop.includes("oklab")
              );
              el.style.cssText = cleanedProps.join(";");
            }
          }
        } catch (e) {
          // Ignore errors
        }
      });

      // Inject RGB CSS overrides
      const styleElement = clonedDoc.createElement("style");
      styleElement.id = "pdf-rgb-override";

      const rgbOverrides = `
        /* Convert common Tailwind colors to RGB to avoid oklch issues */
        * {
          box-sizing: border-box;
        }
        
        /* Force all SVG colors to RGB */
        svg, svg *, path, circle, rect, g, line {
          fill: currentColor !important;
          stroke: currentColor !important;
        }
        
        .bg-white { background-color: rgb(255, 255, 255) !important; }
        .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
        .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
        .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
        .bg-gray-300 { background-color: rgb(209, 213, 219) !important; }
        .bg-gray-800 { background-color: rgb(31, 41, 55) !important; }
        .bg-gray-900 { background-color: rgb(17, 24, 39) !important; }
        .bg-slate-50 { background-color: rgb(248, 250, 252) !important; }
        .bg-slate-100 { background-color: rgb(241, 245, 249) !important; }
        .bg-slate-200 { background-color: rgb(226, 232, 240) !important; }
        .bg-slate-500 { background-color: rgb(100, 116, 139) !important; }
        .bg-slate-600 { background-color: rgb(71, 85, 105) !important; }
        .bg-slate-700 { background-color: rgb(51, 65, 85) !important; }
        .bg-slate-800 { background-color: rgb(30, 41, 59) !important; }
        .bg-green-50 { background-color: rgb(240, 253, 244) !important; }
        .bg-green-100 { background-color: rgb(220, 252, 231) !important; }
        .bg-green-200 { background-color: rgb(187, 247, 208) !important; }
        .bg-green-300 { background-color: rgb(134, 239, 172) !important; }
        .bg-red-50 { background-color: rgb(254, 242, 242) !important; }
        .bg-red-100 { background-color: rgb(254, 226, 226) !important; }
        .bg-red-200 { background-color: rgb(254, 202, 202) !important; }
        .bg-red-300 { background-color: rgb(252, 165, 165) !important; }
        .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
        .bg-blue-200 { background-color: rgb(191, 219, 254) !important; }
        [class*="bg-[#334155]"] { background-color: rgb(51, 65, 85) !important; }
        [class*="bg-[#192636]"] { background-color: rgb(25, 38, 54) !important; }
        
        .text-white { color: rgb(255, 255, 255) !important; }
        .text-gray-600 { color: rgb(75, 85, 99) !important; }
        .text-gray-700 { color: rgb(55, 65, 81) !important; }
        .text-gray-800 { color: rgb(31, 41, 55) !important; }
        .text-gray-900 { color: rgb(17, 24, 39) !important; }
        .text-slate-500 { color: rgb(100, 116, 139) !important; }
        .text-slate-600 { color: rgb(71, 85, 105) !important; }
        .text-slate-700 { color: rgb(51, 65, 85) !important; }
        .text-green-600 { color: rgb(22, 163, 74) !important; }
        .text-green-700 { color: rgb(21, 128, 61) !important; }
        .text-green-900 { color: rgb(20, 83, 45) !important; }
        .text-red-600 { color: rgb(220, 38, 38) !important; }
        .text-red-700 { color: rgb(185, 28, 28) !important; }
        .text-red-900 { color: rgb(127, 29, 29) !important; }
        .text-blue-600 { color: rgb(37, 99, 235) !important; }
        .text-blue-900 { color: rgb(30, 64, 175) !important; }
        
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
        .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
        .border-green-200 { border-color: rgb(187, 247, 208) !important; }
        .border-green-300 { border-color: rgb(134, 239, 172) !important; }
        .border-red-200 { border-color: rgb(254, 202, 202) !important; }
        .border-red-300 { border-color: rgb(252, 165, 165) !important; }
        .border-blue-200 { border-color: rgb(191, 219, 254) !important; }
      `;

      styleElement.textContent = rgbOverrides;
      clonedDoc.head.insertBefore(styleElement, clonedDoc.head.firstChild);
    } catch (e) {
      console.warn("Error sanitizing stylesheets:", e);
    }
  };

  // Legacy function - kept for reference but not used
  const oldHandleDownloadPDF = async () => {
    if (!reportRef.current) {
      alert("Report content not found. Please refresh the page.");
      return;
    }

    if (isGeneratingPDF || loading) {
      return;
    }

    try {
      setIsGeneratingPDF(true);

      const reportElement = reportRef.current;
      const patientName = patientData.name || "Report";
      const sanitizedName = patientName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      const fileName = `Cognitive_Assessment_Report_${sanitizedName || "Report"}_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;

      // Get only the first page
      const firstPage = reportElement.querySelector(".page");
      if (!firstPage) {
        alert("First page not found in the report. Please refresh the page.");
        setIsGeneratingPDF(false);
        return;
      }

      console.log("Processing first page only");

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Process only the first page
      const page = firstPage;
      const pageNumber = 1;

      console.log(`Processing page ${pageNumber}`);

      // Scroll page into view
      page.scrollIntoView({ behavior: "instant", block: "start" });

      // Wait for browser to fully render
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Get dimensions
      const pageWidth = page.scrollWidth || page.offsetWidth;
      const pageHeight = page.scrollHeight || page.offsetHeight;

      console.log(`Page ${pageNumber} dimensions: ${pageWidth}px x ${pageHeight}px`);

      // Get page-specific CSS
      const getPageCSS = (pageNum) => {
        const commonCSS = `
            /* Common Styles for All Pages */
            .flex {
              display: flex !important;
            }
            
            .grid {
              display: grid !important;
            }
            
            .items-center {
              align-items: center !important;
            }
            
            .justify-between {
              justify-content: space-between !important;
            }
            
            .text-center {
              text-align: center !important;
            }
            
            .text-white {
              color: rgb(255, 255, 255) !important;
            }
            
            .bg-white {
              background-color: rgb(255, 255, 255) !important;
            }
            
            .bg-gray-50 {
              background-color: rgb(249, 250, 251) !important;
            }
          `;

        if (pageNum === 1) {
          // Page 1 CSS - EXACT Tailwind conversion
          return commonCSS + `
              /* Page 1 Custom Styles - Exact Tailwind Conversion */
              .page {
                width: ${pageWidth}px !important;
                height: ${pageHeight}px !important;
                background-color: rgb(255, 255, 255) !important;
                max-width: 1280px !important;
                min-height: 297mm !important;
                padding: 2rem !important;
                margin: 0 !important;
                box-shadow: none !important;
              }
              
              /* Header Grid Layout */
              .sm\\:grid {
                display: grid !important;
              }
              
              .grid-cols-3 {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              }
              
              .items-center {
                align-items: center !important;
              }
              
              .flex {
                display: flex !important;
              }
              
              .justify-between {
                justify-content: space-between !important;
              }
              
              .sm\\:mb-6 {
                margin-bottom: 1.5rem !important;
              }
              
              .gap-3 {
                gap: 0.75rem !important;
              }
              
              .w-40 {
                width: 10rem !important;
              }
              
              .h-auto {
                height: auto !important;
              }
              
              .h-14 {
                height: 3.5rem !important;
              }
              
              .object-contain {
                object-fit: contain !important;
              }
              
              .leading-tight {
                line-height: 1.25 !important;
              }
              
              .text-center {
                text-align: center !important;
              }
              
              .justify-end {
                justify-content: flex-end !important;
              }
              
              .text-\\[\\#BAA377\\] {
                color: rgb(186, 163, 119) !important;
              }
              
              .font-semibold {
                font-weight: 600 !important;
              }
              
              .text-\\[13px\\] {
                font-size: 13px !important;
              }
              
              .text-slate-500 {
                color: rgb(100, 116, 139) !important;
              }
              
              .text-right {
                text-align: right !important;
              }
              
              .text-sm {
                font-size: 0.875rem !important;
              }
              
              .font-medium {
                font-weight: 500 !important;
              }
              
              /* Divider */
              .border-0 {
                border-width: 0 !important;
              }
              
              .h-px {
                height: 1px !important;
              }
              
              .bg-gray-300 {
                background-color: rgb(209, 213, 219) !important;
              }
              
              .mb-8 {
                margin-bottom: 2rem !important;
              }
              
              /* Section Headers - Dark Blue */
              .rounded-xl {
                border-radius: 0.75rem !important;
              }
              
              .overflow-hidden {
                overflow: hidden !important;
              }
              
              .p-4 {
                padding: 1rem !important;
              }
              
              .bg-\\[\\#334155\\] {
                background-color: rgb(51, 65, 85) !important;
              }
              
              .border-b {
                border-bottom-width: 1px !important;
              }
              
              .border-slate-200 {
                border-color: rgb(226, 232, 240) !important;
              }
              
              .text-lg {
                font-size: 1.125rem !important;
              }
              
              .font-\\[600\\] {
                font-weight: 600 !important;
              }
              
              .text-white {
                color: rgb(255, 255, 255) !important;
              }
              
              /* Header text MUST be centered both horizontally and vertically */
              div.bg-\\[\\#334155\\],
              div[class*="334155"] {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                width: 100% !important;
                min-height: 3rem !important;
                padding: 1rem !important;
              }
              
              /* Force all direct children of dark blue headers to be centered */
              div.bg-\\[\\#334155\\] > *,
              div[class*="334155"] > * {
                text-align: center !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              div.bg-\\[\\#334155\\] > div.text-lg,
              div.bg-\\[\\#334155\\] > div.text-white,
              div[class*="334155"] > div.text-lg,
              div[class*="334155"] > div.text-white,
              div.bg-\\[\\#334155\\] > div,
              div[class*="334155"] > div {
                text-align: center !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              /* Ensure text nodes are centered */
              div.bg-\\[\\#334155\\],
              div[class*="334155"] {
                text-align: center !important;
              }
              
              /* Override any conflicting Tailwind classes on header children */
              div.bg-\\[\\#334155\\] > div.items-center,
              div[class*="334155"] > div.items-center {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              /* Ensure all text content in headers is centered */
              div.bg-\\[\\#334155\\] *,
              div[class*="334155"] * {
                text-align: center !important;
              }
              
              /* But exclude table elements */
              div.bg-\\[\\#334155\\] table *,
              div[class*="334155"] table * {
                text-align: inherit !important;
              }
              
              /* Patient Details Content */
              .space-y-3 > * + * {
                margin-top: 0.75rem !important;
              }
              
              .lg\\:grid-cols-4 {
                grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              }
              
              .sm\\:grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              
              .grid-cols-1 {
                grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
              }
              
              .gap-6 {
                gap: 1.5rem !important;
              }
              
              .p-5 {
                padding: 1.25rem !important;
              }
              
              .border-l {
                border-left-width: 1px !important;
              }
              
              .border-r {
                border-right-width: 1px !important;
              }
              
              .rounded-br-xl {
                border-bottom-right-radius: 0.75rem !important;
              }
              
              .rounded-bl-xl {
                border-bottom-left-radius: 0.75rem !important;
              }
              
              .bg-gray-50 {
                background-color: rgb(249, 250, 251) !important;
              }
              
              .text-md {
                font-size: 1rem !important;
              }
              
              .text-slate-800 {
                color: rgb(30, 41, 59) !important;
              }
              
              /* Clinical Triage Section */
              .space-y-5 > * + * {
                margin-top: 1.25rem !important;
              }
              
              .mt-1 {
                margin-top: 0.25rem !important;
              }
              
              .leading-relaxed {
                line-height: 1.625 !important;
              }
              
              .mt-3 {
                margin-top: 0.75rem !important;
              }
              
              .text-slate-700 {
                color: rgb(51, 65, 85) !important;
              }
              
              /* REFER NOW Button - New line below rationale */
              /* Reset rationale paragraph to block */
              .bg-gray-50 > div > p.mt-3.text-slate-700 {
                display: block !important;
                width: 100% !important;
                margin-bottom: 0 !important;
              }
              
              /* Container for button - new line, left-aligned */
              .bg-gray-50 > div > p.mt-3.text-slate-700 + div.mt-4,
              .mt-4 {
                display: flex !important;
                flex-direction: row !important;
                justify-content: flex-start !important;
                align-items: center !important;
                margin-top: 1rem !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                width: 100% !important;
              }
              
              button.border-rose-600,
              button[class*="border-rose-600"] {
                padding-left: 1rem !important;
                padding-right: 1rem !important;
                padding-top: 0.5rem !important;
                padding-bottom: 0.5rem !important;
                border-radius: 0.375rem !important; /* Slightly rounded, not pill-shaped */
                border-width: 1px !important;
                border-style: solid !important;
                border-color: rgb(225, 29, 72) !important;
                color: rgb(31, 41, 55) !important; /* Dark gray/black text */
                background-color: rgb(255, 255, 255) !important;
                font-size: 0.875rem !important;
                font-weight: 500 !important;
                text-transform: uppercase !important;
                display: inline-flex !important;
                justify-content: center !important;
                align-items: center !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                text-align: center !important;
                white-space: nowrap !important;
              }
              
              /* Ensure all borders are visible */
              .border-l,
              .border-r,
              .border-b,
              .border-t,
              .border {
                border-style: solid !important;
                border-width: 1px !important;
              }
              
              .border-slate-200 {
                border-color: rgb(226, 232, 240) !important;
                border-style: solid !important;
                border-width: 1px !important;
              }
              
              .border-gray-200 {
                border-color: rgb(229, 231, 235) !important;
                border-style: solid !important;
                border-width: 1px !important;
              }
              
              .border-gray-300 {
                border-color: rgb(209, 213, 219) !important;
                border-style: solid !important;
                border-width: 1px !important;
              }
              
              /* Ensure content boxes have visible borders */
              .rounded-xl,
              .rounded-2xl {
                border: 1px solid rgb(226, 232, 240) !important;
              }
              
              .bg-gray-50 {
                border-left: 1px solid rgb(226, 232, 240) !important;
                border-right: 1px solid rgb(226, 232, 240) !important;
                border-bottom: 1px solid rgb(226, 232, 240) !important;
              }
              
              table {
                border: 1px solid rgb(226, 232, 240) !important;
                border-collapse: collapse !important;
              }
              
              table thead th {
                border: 1px solid rgb(226, 232, 240) !important;
              }
              
              table tbody td {
                border: 1px solid rgb(229, 231, 235) !important;
              }
              
              table tbody tr {
                border-bottom: 1px solid rgb(229, 231, 235) !important;
              }
              
              /* Table Styles */
              .sm\\:p-6 {
                padding: 1.5rem !important;
              }
              
              .p-3 {
                padding: 0.75rem !important;
              }
              
              .text-xl {
                font-size: 1.25rem !important;
              }
              
              .text-gray-900 {
                color: rgb(17, 24, 39) !important;
              }
              
              .mb-4 {
                margin-bottom: 1rem !important;
              }
              
              .overflow-x-auto {
                overflow-x: auto !important;
              }
              
              table {
                width: 100% !important;
                border-collapse: collapse !important;
              }
              
              .min-w-full {
                min-width: 100% !important;
              }
              
              table thead tr {
                background-color: rgb(51, 65, 85) !important;
                color: rgb(255, 255, 255) !important;
                text-align: left !important;
              }
              
              table thead th {
                padding: 1rem !important;
                font-weight: 500 !important;
                text-align: left !important;
              }
              
              /* Status column header - CENTERED */
              table thead th:nth-child(2) {
                text-align: center !important;
              }
              
              table tbody {
                border-top-width: 1px !important;
              }
              
              .divide-y > * + * {
                border-top-width: 1px !important;
              }
              
              .divide-gray-200 > * + * {
                border-color: rgb(229, 231, 235) !important;
              }
              
              table tbody td {
                padding: 1.25rem !important;
                text-align: left !important;
              }
              
              /* Status column cells - CENTERED */
              table tbody td:nth-child(2) {
                text-align: center !important;
                display: table-cell !important;
                vertical-align: middle !important;
              }
              
              /* Center content inside Status cells */
              table tbody td:nth-child(2) > * {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 0.25rem !important;
                margin-left: auto !important;
                margin-right: auto !important;
              }
              
              .text-emerald-600 {
                color: rgb(5, 150, 105) !important;
              }
              
              .mt-8 {
                margin-top: 2rem !important;
              }
              
              .rounded-2xl {
                border-radius: 1rem !important;
              }
              
              .text-base {
                font-size: 1rem !important;
              }
              
              .border {
                border-width: 1px !important;
              }
              
              .border-gray-200 {
                border-color: rgb(229, 231, 235) !important;
              }
              
              .rounded-lg {
                border-radius: 0.5rem !important;
              }
              
              .text-gray-800 {
                color: rgb(31, 41, 55) !important;
              }
              
              /* Ensure all section headers are centered */
              div.bg-\\[\\#334155\\],
              div[class*="334155"] {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                width: 100% !important;
                min-height: 3rem !important;
              }
              
              div.bg-\\[\\#334155\\] > *,
              div[class*="334155"] > * {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                width: 100% !important;
                height: 100% !important;
              }
            `;
        } else if (pageNum === 2) {
          // Page 2 CSS (user provided)
          return commonCSS + `
              /* Page 2 Custom Styles */
              .page {
                background-color: white !important;
                max-width: 1280px !important;
                min-height: 297mm !important;
                padding: 2rem !important;
                margin: auto !important;
              }
              
              /* Header */
              .header-grid {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                align-items: center !important;
                justify-content: space-between !important;
                margin-bottom: 1.5rem !important;
              }
              
              .header-left {
                display: flex !important;
                align-items: center !important;
                gap: 0.75rem !important;
              }
              
              .logo-container {
                width: 10rem !important;
                height: auto !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .logo {
                height: 3.5rem !important;
                width: auto !important;
                object-fit: contain !important;
              }
              
              .header-center {
                text-align: center !important;
                line-height: 1.2 !important;
              }
              
              .title {
                color: rgb(186, 163, 119) !important;
                font-weight: 600 !important;
              }
              
              .subtitle {
                font-size: 13px !important;
                color: rgb(100, 116, 139) !important;
              }
              
              .header-right {
                text-align: right !important;
                font-size: 0.875rem !important;
                color: rgb(100, 116, 139) !important;
              }
              
              .page-info {
                font-weight: 500 !important;
              }
              
              .divider {
                border: none !important;
                height: 1px !important;
                background-color: rgb(209, 213, 219) !important;
                margin-bottom: 2rem !important;
              }
              
              /* Section Title */
              .section-title {
                background-color: rgb(51, 65, 85) !important;
                color: white !important;
                padding: 1rem !important;
                text-align: center !important;
                font-size: 1.25rem !important;
                font-weight: 600 !important;
                border-top-left-radius: 0.75rem !important;
                border-top-right-radius: 0.75rem !important;
                letter-spacing: 0.05em !important;
              }
              
              /* Content Container */
              .content-container {
                background-color: rgb(249, 250, 251) !important;
                border: 1px solid rgb(209, 213, 219) !important;
                border-top: none !important;
                border-radius: 0 0 0.75rem 0.75rem !important;
                overflow: hidden !important;
              }
              
              /* General Sections */
              .section-padding {
                padding: 1.5rem !important;
              }
              
              .section-padding.no-top {
                padding-top: 0 !important;
              }
              
              .card {
                background-color: white !important;
                border-radius: 0.75rem !important;
                border: 1px solid rgb(229, 231, 235) !important;
              }
              
              .card-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: start !important;
                padding: 1rem !important;
              }
              
              .card-title {
                font-size: 1.125rem !important;
                font-weight: 700 !important;
                color: rgb(186, 163, 119) !important;
              }
              
              .icon-wrapper {
                padding: 0.5rem !important;
                background-color: rgb(249, 250, 251) !important;
                border: 1px solid rgb(229, 231, 235) !important;
                border-radius: 9999px !important;
              }
              
              .icon {
                height: 1.5rem !important;
                width: 1.5rem !important;
                color: rgb(156, 163, 175) !important;
              }
              
              /* Lists */
              .list {
                list-style-type: disc !important;
                margin-left: 1.25rem !important;
                margin-right: 0.75rem !important;
                padding: 0 1rem 1rem !important;
                color: rgb(55, 65, 81) !important;
              }
              
              .list li {
                font-size: 1rem !important;
                line-height: 1.6 !important;
              }
              
              .bold {
                font-weight: 700 !important;
              }
              
              .small-sup {
                font-size: 0.75rem !important;
              }
              
              /* Section heading */
              .section-heading {
                font-size: 1.25rem !important;
                font-weight: 600 !important;
                color: rgb(31, 41, 55) !important;
                margin-bottom: 1rem !important;
              }
              
              .priority-title {
                font-size: 1.125rem !important;
                font-weight: 700 !important;
                color: rgb(186, 163, 119) !important;
              }
              
              .space-y > * + * {
                margin-top: 1.5rem !important;
              }
            `;
        } else {
          // Default CSS for other pages
          return commonCSS + `
              .page {
                width: ${pageWidth}px !important;
                height: ${pageHeight}px !important;
                background: #ffffff !important;
                padding: 32px !important;
                margin: 0 !important;
                box-shadow: none !important;
              }
            `;
        }
      };

      // Capture with custom CSS injection
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 30000,
        removeContainer: false,
        width: pageWidth,
        height: pageHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc, clonedElement) => {
          // Remove oklch stylesheets
          sanitizeStylesheets(clonedDoc);

          // Get page-specific CSS
          const pageSpecificCSS = getPageCSS(pageNumber);

          // Inject custom CSS with page-specific styles
          const customStyle = clonedDoc.createElement("style");
          customStyle.textContent = `
            /* Common Styles for All Pages */
            * {
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            ${pageSpecificCSS}
            
            ${pageNumber === 1 ? `
            /* Page 1 Specific Styles */
            
            /* Header Styles */
            .page img {
              max-height: 56px !important;
              width: auto !important;
            }
            
            /* Section Headers - Dark Blue */
            [class*="bg-[#334155]"],
            [style*="background-color: rgb(51, 65, 85)"] {
              background-color: rgb(51, 65, 85) !important;
            }
            
            /* Ensure all dark blue headers */
            .p-4.bg-\\[\\#334155\\],
            div[class*="334155"] {
              background-color: rgb(51, 65, 85) !important;
            }
            
            /* Center text in section headers (dark blue boxes) - Force all headers to center HORIZONTALLY AND VERTICALLY */
            div[class*="334155"],
            .p-4[class*="334155"],
            div[style*="background-color: rgb(51, 65, 85)"] {
              text-align: center !important;
              display: flex !important;
              align-items: center !important; /* Vertical center */
              justify-content: center !important; /* Horizontal center */
              width: 100% !important;
              min-height: fit-content !important;
            }
            
            /* Center all direct children of headers - HORIZONTALLY AND VERTICALLY */
            div[class*="334155"] > *,
            .p-4[class*="334155"] > *,
            div[style*="background-color: rgb(51, 65, 85)"] > * {
              text-align: center !important;
              display: flex !important;
              align-items: center !important; /* Vertical center */
              justify-content: center !important; /* Horizontal center */
              width: 100% !important;
              height: 100% !important;
              margin: 0 auto !important;
            }
            
            /* Center nested text elements */
            div[class*="334155"] *,
            .p-4[class*="334155"] *,
            div[style*="background-color: rgb(51, 65, 85)"] * {
              text-align: center !important;
            }
            
            /* Specifically target header text divs - CENTER BOTH WAYS */
            div[class*="text-lg"][class*="text-white"],
            div.text-white {
              text-align: center !important;
              display: flex !important;
              align-items: center !important; /* Vertical center */
              justify-content: center !important; /* Horizontal center */
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
            }
            
            /* Ensure header containers have proper height for vertical centering */
            div[class*="334155"].p-4,
            .p-4[class*="334155"] {
              min-height: 3rem !important;
              height: auto !important;
            }
            
            /* Text Colors */
            .text-white {
              color: rgb(255, 255, 255) !important;
            }
            
            .text-slate-800 {
              color: rgb(30, 41, 59) !important;
            }
            
            .text-slate-700 {
              color: rgb(51, 65, 85) !important;
            }
            
            .text-slate-500 {
              color: rgb(100, 116, 139) !important;
            }
            
            /* Background Colors */
            .bg-gray-50 {
              background-color: rgb(249, 250, 251) !important;
            }
            
            .bg-white {
              background-color: rgb(255, 255, 255) !important;
            }
            
            /* Borders */
            .border-slate-200 {
              border-color: rgb(226, 232, 240) !important;
            }
            
            /* Buttons */
            .border-rose-600 {
              border-color: rgb(225, 29, 72) !important;
            }
            
            .text-rose-600 {
              color: rgb(225, 29, 72) !important;
            }
            
            /* Green checkmarks */
            svg[fill="currentColor"],
            svg[class*="text-green"] {
              color: rgb(34, 197, 94) !important;
              fill: rgb(34, 197, 94) !important;
            }
            
            /* Font weights */
            .font-\\[600\\],
            .font-semibold {
              font-weight: 600 !important;
            }
            
            .font-medium {
              font-weight: 500 !important;
            }
            
            /* Rounded corners */
            .rounded-xl {
              border-radius: 0.75rem !important;
            }
            
            .rounded-br-xl {
              border-bottom-right-radius: 0.75rem !important;
            }
            
            .rounded-bl-xl {
              border-bottom-left-radius: 0.75rem !important;
            }
            
            /* Flexbox Layouts */
            .flex {
              display: flex !important;
            }
            
            .items-center {
              align-items: center !important;
            }
            
            .items-start {
              align-items: flex-start !important;
            }
            
            .justify-between {
              justify-content: space-between !important;
            }
            
            .justify-end {
              justify-content: flex-end !important;
            }
            
            .gap-2 {
              gap: 0.5rem !important;
            }
            
            .gap-3 {
              gap: 0.75rem !important;
            }
            
            .gap-6 {
              gap: 1.5rem !important;
            }
            
            /* Grid Layouts */
            .grid {
              display: grid !important;
            }
            
            .grid-cols-1 {
              grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }
            
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            
            .grid-cols-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
            
            .grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            }
            
            .sm\\:grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            
            .lg\\:grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            }
            
            /* Spacing */
            .p-4 {
              padding: 1rem !important;
            }
            
            .p-5 {
              padding: 1.25rem !important;
            }
            
            .mb-8 {
              margin-bottom: 2rem !important;
            }
            
            .mb-6 {
              margin-bottom: 1.5rem !important;
            }
            
            .mb-4 {
              margin-bottom: 1rem !important;
            }
            
            .mb-3 {
              margin-bottom: 0.75rem !important;
            }
            
            .mt-8 {
              margin-top: 2rem !important;
            }
            
            .mt-4 {
              margin-top: 1rem !important;
            }
            
            .mt-3 {
              margin-top: 0.75rem !important;
            }
            
            .mt-1 {
              margin-top: 0.25rem !important;
            }
            
            .space-y-3 {
              --tw-space-y-reverse: 0;
              margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse))) !important;
              margin-bottom: calc(0.75rem * var(--tw-space-y-reverse)) !important;
            }
            
            .space-y-5 {
              --tw-space-y-reverse: 0;
              margin-top: calc(1.25rem * calc(1 - var(--tw-space-y-reverse))) !important;
              margin-bottom: calc(1.25rem * var(--tw-space-y-reverse)) !important;
            }
            
            .space-y-3 > * + * {
              margin-top: 0.75rem !important;
            }
            
            .space-y-5 > * + * {
              margin-top: 1.25rem !important;
            }
            
            /* Text alignment */
            .text-center {
              text-align: center !important;
            }
            
            .text-left {
              text-align: left !important;
            }
            
            .text-right {
              text-align: right !important;
            }
            
            /* Leading */
            .leading-tight {
              line-height: 1.25 !important;
            }
            
            .leading-relaxed {
              line-height: 1.625 !important;
            }
            
            /* Ensure all elements are visible */
            * {
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            /* Hide download button if present */
            .download-pdf-button,
            .print\\:hidden {
              display: none !important;
            }
            
            /* Ensure flex children maintain their layout */
            .flex > * {
              flex-shrink: 0 !important;
            }
            
            /* Grid gap */
            .grid.gap-6 > * {
              margin: 0 !important;
            }
            
            /* Table styles - align data correctly */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: auto !important;
            }
            
            /* Table header row - dark blue background but column headers are left-aligned */
            table thead {
              background-color: rgb(51, 65, 85) !important;
            }
            
            table thead th {
              text-align: left !important;
              font-weight: 600 !important;
              padding: 0.5rem !important;
              color: rgb(255, 255, 255) !important;
            }
            
            /* Don't center table headers - they are column headers, not section headers */
            table thead[class*="334155"],
            table thead th {
              text-align: left !important;
              display: table-cell !important;
              justify-content: flex-start !important;
            }
            
            table tbody td {
              text-align: left !important;
              vertical-align: top !important;
              padding: 0.5rem !important;
            }
            
            /* Table cells alignment - ensure proper spacing */
            table td:first-child {
              text-align: left !important;
              padding-left: 0 !important;
            }
            
            table td:nth-child(2) {
              text-align: left !important;
            }
            
            table td:last-child {
              text-align: left !important;
              padding-right: 0 !important;
            }
            
            /* Ensure table rows display correctly */
            table tr {
              display: table-row !important;
            }
            
            table td,
            table th {
              display: table-cell !important;
            }
            
            /* Center REFER NOW button */
            button[class*="border-rose-600"],
            button.text-rose-600,
            button[class*="rose-600"] {
              display: block !important;
              margin-left: auto !important;
              margin-right: auto !important;
              text-align: center !important;
            }
            
            /* Ensure button container centers the button */
            .mt-4:has(button),
            div.mt-4 {
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              width: 100% !important;
            }
            
            /* Alternative button centering */
            .mt-4 > button {
              margin: 0 auto !important;
            }
            ` : ''}
          `;
          clonedDoc.head.appendChild(customStyle);

          // Ensure element is visible
          clonedElement.style.display = "block";
          clonedElement.style.visibility = "visible";
          clonedElement.style.opacity = "1";
          clonedElement.style.backgroundColor = "#ffffff";
          clonedElement.style.width = pageWidth + "px";
          clonedElement.style.height = pageHeight + "px";

          // Preserve computed styles for flex/grid layouts
          const preserveComputedStyles = (originalEl, clonedEl) => {
            try {
              const computed = window.getComputedStyle(originalEl);

              // Preserve display properties
              if (computed.display === "flex" || computed.display === "grid") {
                clonedEl.style.display = computed.display;
              }

              // Preserve flex properties
              if (computed.display === "flex") {
                clonedEl.style.flexDirection = computed.flexDirection || "row";
                clonedEl.style.flexWrap = computed.flexWrap || "nowrap";
                clonedEl.style.justifyContent = computed.justifyContent || "flex-start";
                clonedEl.style.alignItems = computed.alignItems || "stretch";
                clonedEl.style.gap = computed.gap || "0";
              }

              // Preserve grid properties
              if (computed.display === "grid") {
                clonedEl.style.gridTemplateColumns = computed.gridTemplateColumns || "none";
                clonedEl.style.gridTemplateRows = computed.gridTemplateRows || "none";
                clonedEl.style.gap = computed.gap || "0";
              }
            } catch (e) {
              // Ignore errors
            }
          };

          // Apply computed styles to cloned elements
          // Match elements by their position in the DOM tree
          const walkElements = (originalParent, clonedParent) => {
            const originalChildren = Array.from(originalParent.children);
            const clonedChildren = Array.from(clonedParent.children);

            originalChildren.forEach((originalChild, index) => {
              if (clonedChildren[index]) {
                const clonedChild = clonedChildren[index];
                preserveComputedStyles(originalChild, clonedChild);
                // Recursively process children
                walkElements(originalChild, clonedChild);
              }
            });
          };

          // Start walking from the page element
          walkElements(page, clonedElement);

          // Position REFER NOW button - New line below rationale, left-aligned
          const referButton = clonedElement.querySelector('button[class*="border-rose-600"]') ||
            clonedElement.querySelector('button.text-rose-600') ||
            clonedElement.querySelector('button[class*="rose-600"]') ||
            Array.from(clonedElement.querySelectorAll('button')).find(btn =>
              btn.textContent && btn.textContent.trim().includes('REFER NOW')
            );
          if (referButton) {
            // Style button - rectangular with slightly rounded corners, dark text
            referButton.style.display = "inline-flex";
            referButton.style.marginLeft = "0";
            referButton.style.marginRight = "0";
            referButton.style.marginTop = "0";
            referButton.style.marginBottom = "0";
            referButton.style.textAlign = "center";
            referButton.style.justifyContent = "center";
            referButton.style.alignItems = "center";
            referButton.style.borderRadius = "0.375rem"; // Slightly rounded, not pill-shaped
            referButton.style.paddingLeft = "1rem";
            referButton.style.paddingRight = "1rem";
            referButton.style.paddingTop = "0.5rem";
            referButton.style.paddingBottom = "0.5rem";
            referButton.style.width = "auto";
            referButton.style.whiteSpace = "nowrap";
            referButton.style.backgroundColor = "rgb(255, 255, 255)";
            referButton.style.borderStyle = "solid";
            referButton.style.borderWidth = "1px";
            referButton.style.borderColor = "rgb(225, 29, 72)";
            referButton.style.color = "rgb(31, 41, 55)"; // Dark gray/black text
            referButton.style.textTransform = "uppercase";

            // Ensure button container is on new line, left-aligned
            const buttonContainer = referButton.parentElement;
            if (buttonContainer) {
              buttonContainer.style.display = "flex";
              buttonContainer.style.flexDirection = "row";
              buttonContainer.style.justifyContent = "flex-start"; // Left-align
              buttonContainer.style.alignItems = "center";
              buttonContainer.style.marginTop = "1rem";
              buttonContainer.style.marginLeft = "0";
              buttonContainer.style.marginRight = "0";
              buttonContainer.style.width = "100%";
            }

            // Ensure rationale paragraph is block (full width, on its own line)
            const rationaleParagraph = buttonContainer?.previousElementSibling;
            if (rationaleParagraph && rationaleParagraph.tagName === 'P') {
              rationaleParagraph.style.display = "block";
              rationaleParagraph.style.width = "100%";
              rationaleParagraph.style.marginBottom = "0";
            }
          }

          // Ensure all borders are visible
          const allBorders = clonedElement.querySelectorAll('[class*="border"]');
          allBorders.forEach(el => {
            const classes = el.className.split(' ');
            classes.forEach(cls => {
              if (cls.includes('border-l') || cls.includes('border-r') ||
                cls.includes('border-b') || cls.includes('border-t') ||
                (cls.includes('border') && !cls.includes('border-0'))) {
                if (!el.style.borderStyle || el.style.borderStyle === 'none') {
                  el.style.borderStyle = "solid";
                }
                if (!el.style.borderWidth || el.style.borderWidth === '0px') {
                  el.style.borderWidth = "1px";
                }
              }
            });
          });

          // Ensure content boxes have visible borders
          const contentBoxes = clonedElement.querySelectorAll('.rounded-xl, .rounded-2xl, .bg-gray-50');
          contentBoxes.forEach(box => {
            if (box.classList.contains('bg-gray-50')) {
              if (!box.style.borderLeft || box.style.borderLeft === 'none') {
                box.style.borderLeft = "1px solid rgb(226, 232, 240)";
              }
              if (!box.style.borderRight || box.style.borderRight === 'none') {
                box.style.borderRight = "1px solid rgb(226, 232, 240)";
              }
              if (!box.style.borderBottom || box.style.borderBottom === 'none') {
                box.style.borderBottom = "1px solid rgb(226, 232, 240)";
              }
            } else {
              if (!box.style.border || box.style.border === 'none') {
                box.style.border = "1px solid rgb(226, 232, 240)";
              }
            }
          });

          // Ensure table borders are visible
          const tables = clonedElement.querySelectorAll('table');
          tables.forEach(table => {
            table.style.border = "1px solid rgb(226, 232, 240)";
            table.style.borderCollapse = "collapse";
          });

          const tableCells = clonedElement.querySelectorAll('table th, table td');
          tableCells.forEach(cell => {
            if (!cell.style.border || cell.style.border === 'none' || cell.style.border === '0px') {
              cell.style.border = "1px solid rgb(229, 231, 235)";
            }
          });

          const tableRows = clonedElement.querySelectorAll('table tbody tr');
          tableRows.forEach(row => {
            if (!row.style.borderBottom || row.style.borderBottom === 'none') {
              row.style.borderBottom = "1px solid rgb(229, 231, 235)";
            }
          });

          // Center table Status column (for checkmarks) - BOTH HEADER AND DATA
          const statusHeader = clonedElement.querySelector('table thead th:nth-child(2)');
          if (statusHeader) {
            statusHeader.style.textAlign = "center";
            statusHeader.style.display = "table-cell";
          }

          const statusCells = clonedElement.querySelectorAll('table tbody td:nth-child(2)');
          statusCells.forEach(cell => {
            cell.style.textAlign = "center";
            cell.style.display = "table-cell"; // Keep table-cell for proper table layout
            cell.style.verticalAlign = "middle";
            // Center any content inside (checkmarks, text)
            const content = cell.querySelector('*');
            if (content) {
              content.style.display = "inline-flex";
              content.style.justifyContent = "center";
              content.style.alignItems = "center";
              content.style.marginLeft = "auto";
              content.style.marginRight = "auto";
              content.style.gap = "0.25rem";
            }
          });

          // Ensure all section headers have centered text - More aggressive approach
          // Exclude table headers (thead) from centering
          const sectionHeaders = clonedElement.querySelectorAll('[class*="334155"]:not(thead):not(table thead):not(table th), div[style*="background-color: rgb(51, 65, 85)"]:not(thead):not(table thead):not(table th)');
          sectionHeaders.forEach(header => {
            // Skip if it's inside a table
            if (header.closest('table')) {
              return;
            }

            // Force parent to center BOTH HORIZONTALLY AND VERTICALLY
            header.style.textAlign = "center";
            header.style.display = "flex";
            header.style.alignItems = "center"; // Vertical center (top to bottom)
            header.style.justifyContent = "center"; // Horizontal center (left to right)
            header.style.width = "100%";
            header.style.minHeight = "3rem"; // Ensure minimum height for vertical centering
            header.style.padding = "1rem"; // Ensure padding is maintained
            header.style.margin = "0"; // Remove any margins
            header.style.position = "relative"; // Ensure proper positioning

            // Center all child elements recursively - BOTH HORIZONTALLY AND VERTICALLY
            const centerAllChildren = (element) => {
              element.style.textAlign = "center";
              if (element.children.length > 0) {
                Array.from(element.children).forEach(child => {
                  // Skip table cells
                  if (child.tagName === 'TH' || child.tagName === 'TD') {
                    return;
                  }
                  // Force text alignment and flex centering
                  child.style.textAlign = "center";
                  child.style.display = "flex";
                  child.style.alignItems = "center"; // Vertical center (top to bottom)
                  child.style.justifyContent = "center"; // Horizontal center (left to right)
                  child.style.width = "100%";
                  child.style.height = "100%"; // Take full height for vertical centering
                  child.style.margin = "0"; // Remove all margins
                  child.style.padding = "0"; // Remove padding to avoid offset
                  child.style.position = "relative";

                  // Also ensure text nodes are centered
                  if (child.textContent) {
                    child.style.textAlign = "center";
                  }

                  centerAllChildren(child);
                });
              } else {
                // If no children, ensure text is centered
                if (element.textContent) {
                  element.style.textAlign = "center";
                }
              }
            };

            centerAllChildren(header);

            // Also directly center any text content in the header
            if (header.textContent) {
              header.style.textAlign = "center";
            }

            // Force all direct children to be centered
            Array.from(header.children).forEach(child => {
              if (child.tagName !== 'TH' && child.tagName !== 'TD') {
                child.style.display = "flex";
                child.style.alignItems = "center";
                child.style.justifyContent = "center";
                child.style.textAlign = "center";
                child.style.width = "100%";
                child.style.height = "100%";
                child.style.margin = "0";
                child.style.padding = "0";
              }
            });
          });

          // Ensure table headers are left-aligned (not centered), except Status column
          const tableHeaders = clonedElement.querySelectorAll('table thead th');
          tableHeaders.forEach((th, index) => {
            // Status column (2nd column) should be centered
            if (index === 1) {
              th.style.textAlign = "center";
              th.style.display = "table-cell";
              th.style.verticalAlign = "middle";
            } else {
              th.style.textAlign = "left";
              th.style.display = "table-cell";
              th.style.justifyContent = "flex-start";
            }
          });

          // Also find and center text elements directly (but exclude table elements)
          const headerTextElements = clonedElement.querySelectorAll('div.text-white, div[class*="text-white"], div[class*="text-lg"], div[class*="font-[600]"], div[class*="font-semibold"]');
          headerTextElements.forEach(textEl => {
            // Skip if inside a table
            if (textEl.closest('table')) {
              return;
            }

            const parent = textEl.closest('[class*="334155"], div[style*="background-color: rgb(51, 65, 85)"]');
            if (parent && !parent.closest('table')) {
              // Force centering
              textEl.style.textAlign = "center";
              textEl.style.display = "flex";
              textEl.style.alignItems = "center"; // Vertical center (top to bottom)
              textEl.style.justifyContent = "center"; // Horizontal center (left to right)
              textEl.style.width = "100%";
              textEl.style.height = "100%"; // Take full height for vertical centering
              textEl.style.marginLeft = "auto";
              textEl.style.marginRight = "auto";
              textEl.style.marginTop = "auto";
              textEl.style.marginBottom = "auto";

              // Ensure parent is also flex
              if (parent && parent !== textEl) {
                parent.style.display = "flex";
                parent.style.alignItems = "center";
                parent.style.justifyContent = "center";
                parent.style.width = "100%";
              }
            }
          });

          // Additional pass: Find all divs with bg-[#334155] and ensure their direct children are centered
          const darkBlueHeaders = clonedElement.querySelectorAll('div[class*="334155"]:not(table th):not(table td), div[style*="background-color: rgb(51, 65, 85)"]:not(table th):not(table td)');
          darkBlueHeaders.forEach(header => {
            if (header.closest('table')) {
              return;
            }

            // Ensure header itself is flex centered
            header.style.display = "flex";
            header.style.alignItems = "center";
            header.style.justifyContent = "center";
            header.style.textAlign = "center";
            header.style.width = "100%";
            header.style.minHeight = "3rem";
            header.style.margin = "0";
            header.style.padding = "1rem";

            // Center all direct children - remove any conflicting styles
            Array.from(header.children).forEach(child => {
              if (child.tagName !== 'TH' && child.tagName !== 'TD') {
                // Remove any existing display/alignment that might conflict
                child.style.display = "flex";
                child.style.alignItems = "center";
                child.style.justifyContent = "center";
                child.style.textAlign = "center";
                child.style.width = "100%";
                child.style.height = "100%";
                child.style.margin = "0";
                child.style.padding = "0";
                child.style.position = "relative";

                // Remove any conflicting classes by overriding styles
                if (child.classList.contains('items-center')) {
                  child.style.alignItems = "center";
                }
                if (child.classList.contains('text-center')) {
                  child.style.textAlign = "center";
                }

                // Also center any text nodes
                if (child.textContent) {
                  child.style.textAlign = "center";
                }

                // Center all nested children recursively
                const centerNested = (el) => {
                  Array.from(el.children).forEach(nested => {
                    nested.style.display = "flex";
                    nested.style.alignItems = "center";
                    nested.style.justifyContent = "center";
                    nested.style.textAlign = "center";
                    nested.style.width = "100%";
                    nested.style.height = "100%";
                    nested.style.margin = "0";
                    nested.style.padding = "0";
                    centerNested(nested);
                  });
                };
                centerNested(child);
              }
            });

            // Also ensure the header's text content is centered
            if (header.textContent) {
              header.style.textAlign = "center";
            }
          });

          // Final pass: Specifically target elements with items-center class inside headers
          const itemsCenterElements = clonedElement.querySelectorAll('[class*="items-center"]');
          itemsCenterElements.forEach(el => {
            const headerParent = el.closest('[class*="334155"], div[style*="background-color: rgb(51, 65, 85)"]');
            if (headerParent && !headerParent.closest('table')) {
              el.style.display = "flex";
              el.style.alignItems = "center";
              el.style.justifyContent = "center";
              el.style.textAlign = "center";
              el.style.width = "100%";
              el.style.height = "100%";
              el.style.margin = "0";
              el.style.padding = "0";
            }
          });

          // Handle images
          const images = clonedElement.querySelectorAll("img");
          images.forEach((img) => {
            if (img.complete && img.naturalWidth > 0) {
              img.style.display = "";
              img.style.visibility = "visible";
              img.style.opacity = "1";
            } else {
              img.style.display = "none";
            }
          });
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        alert("Failed to capture first page. Please try again.");
        setIsGeneratingPDF(false);
        return;
      }

      console.log(`Page ${pageNumber} canvas dimensions: ${canvas.width}px x ${canvas.height}px`);

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png", 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Actual content dimensions (scale: 2)
      const actualWidthPx = imgWidth / 2;
      const actualHeightPx = imgHeight / 2;

      // Convert pixels to mm (96 DPI)
      const pixelsToMM = 25.4 / 96;
      const widthMM = actualWidthPx * pixelsToMM;
      const heightMM = actualHeightPx * pixelsToMM;

      console.log(`Page ${pageNumber} content size: ${widthMM.toFixed(2)}mm x ${heightMM.toFixed(2)}mm`);

      // Scale to fit A4 while maintaining aspect ratio
      const scaleX = pdfWidth / widthMM;
      const scaleY = pdfHeight / heightMM;
      const scale = Math.min(scaleX, scaleY);

      const finalWidth = widthMM * scale;
      const finalHeight = heightMM * scale;

      // Center on page
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      // Add image to PDF
      pdf.addImage(
        imgData,
        "PNG",
        xOffset,
        yOffset,
        finalWidth,
        finalHeight,
        undefined,
        "SLOW"
      );

      console.log(`Page ${pageNumber} added to PDF successfully`);

      // Save PDF
      pdf.save(fileName);
      console.log("First page PDF generated successfully");

    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error(error.stack);
      alert(`Failed to generate PDF. Please try again.\n\nError: ${error?.message || error}`);
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
          data-testid="download-pdf-button"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF || loading}
          className="download-pdf-button flex items-center gap-2 px-4 py-3  bg-color bg-hover text-white cursor-pointer rounded-md shadow-lg   transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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

          {/* Cognitive Assessment Results Section */}
          <div className="mt-8">
            <div className="bg-[#334155] text-white p-4 text-center text-xl font-semibold rounded-tl-xl rounded-tr-xl tracking-wide">
              Cognitive Assessment Results
            </div>
            <div className="w-full mx-auto bg-gray-50 border-l border-b border-r border-gray-300 rounded-br-xl rounded-bl-xl overflow-hidden">
              <div className="p-6 sm:p-8 bg-gray-50">
                <div className="space-y-2 ">
                  {questionData.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl py-2 overflow-hidden transition-all  "
                    >
                      {/* Card Header */}
                      <div className="  px-6   ">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">

                            {item.questionString && (
                              <p className="text-base font-semibold text-gray-900 leading-relaxed">
                                Q. {item.questionString}
                              </p>
                            )}
                          </div>
                          <div
                            className={`px-4 py-2 rounded-lg font-bold text-sm  ${item.score === 1
                              ? "  text-[#334155]   "
                              : item.score === 0
                                ? "  text-red-700   "
                                : "  text-gray-700    "
                              }`}
                          >
                            Score: {item.score}
                          </div>
                        </div>
                      </div>

                      <div className="px-3 space-y-4">
                        <div className="  ">
                          <div className="flex items-start gap-3">

                            <div className="flex-1">
                              <div
                                className={`px-4 bg-white rounded-lg ml-3 ${item.score === 1
                                  ? "bg-gray-50 text-gray-900"
                                  : item.score === 0
                                    ? "bg-red-50   text-red-900"
                                    : "bg-gray-50   text-gray-700"
                                  }`}
                              >
                                <p className="text-sm font-medium leading-relaxed">
                                  - {item.response || "No response recorded"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    presentations commonly seen in early Alzheimer's disease.
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
