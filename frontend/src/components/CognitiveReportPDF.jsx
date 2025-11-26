import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Note: Page numbers are now dynamic using @react-pdf/renderer's render prop
// No need for TOTAL_PAGES constant as it's handled automatically

// PDF-compatible Progress Bar Component
const PDFProgressBar = ({ current, total, label = "Score" }) => {
  const percentage = (current / total) * 100;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
      {/* Progress Bar Container */}
      <View style={{ flex: 1, marginRight: 16 }}>
        {/* Progress Bar */}
        <View style={{
          height: 12,
          backgroundColor: "#e5e7eb",
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 8,
        }}>
          <View style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: "#BAA377",
          }} />
        </View>
        {/* Scale Markers */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          {Array.from({ length: total + 1 }, (_, i) => (
            <Text key={i} style={{
              fontSize: 8,
              color: "#6b7280",
              textAlign: "center",
              flex: 1,
            }}>
              {i}
            </Text>
          ))}
        </View>
      </View>

      {/* Score Box */}
      <View style={{
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#f3f4f6",
        width: 80,
        alignItems: "center",
      }}>
        <Text style={{
          color: "#BAA377",
          fontWeight: "500",
          fontSize: 10,
          marginBottom: 4,
        }}>
          {label}
        </Text>
        <Text style={{
          fontSize: 14,
          fontWeight: "700",
          color: "#111827",
        }}>
          {current}/{total}
        </Text>
      </View>
    </View>
  );
};

// ✅ PDF Styles - Comprehensive styles for all pages
const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    paddingTop: 100, // Extra top padding to account for fixed header
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 44,
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 120,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  headerCenter: {
    alignItems: "center",
    textAlign: "center",
    flex: 1,
    justifyContent: "center",
  },
  brandName: {
    color: "#BAA377",
    fontWeight: "700",
    fontSize: 10,
    marginBottom: 2,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 8,
    fontWeight: "400",
  },
  headerRight: {
    textAlign: "right",
    flex: 1,
    minWidth: 100,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginBottom: 16,
    width: "100%",
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#334155",
    color: "#ffffff",
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionContent: {
    backgroundColor: "#f9fafb",
    paddingTop: 16,
    spaceY: 8,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "23%",
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
    fontWeight: "500",
    color: "#0f172a",
  },
  textContent: {
    marginTop: 4,
    lineHeight: 1.6,
    color: "#0f172a",
    fontSize: 9,
  },
  rationale: {
    marginTop: 12,
    lineHeight: 1.6,
    color: "#334155",
    fontSize: 9,
  },
  bold: {
    fontWeight: "600",
  },
  buttonBadge: {
    marginTop: 16,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dc2626",
    color: "#dc2626",
    fontSize: 10,
    fontWeight: "500",
    alignSelf: "flex-start",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#334155",
    color: "#ffffff",
    flexDirection: "row",
  },
  tableHeaderCell: {
    padding: 16,
    fontWeight: "500",
    fontSize: 10,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    padding: 20,
    fontSize: 10,
    flex: 1,
    color: "#374151",
  },
  tableCellBold: {
    fontWeight: "600",
    color: "#111827",
  },
  tableCellGreen: {
    color: "#059669",
    fontWeight: "600",
  },
  interpretationBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
  },
  interpretationTitle: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 10,
    marginBottom: 4,
  },
  interpretationText: {
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.6,
  },
  // Page 2+ Styles
  prioritySection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  priorityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  priorityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#BAA377",
    flex: 1,
  },
  priorityList: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingBottom: 16,
  },
  listItem: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 12,
  },
  listItemBold: {
    fontWeight: "700",
  },
  highRiskBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  highRiskTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#BAA377",
    marginBottom: 12,
  },
  // Additional styles for other pages
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  domainItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 6,
  },
  dotOrange: {
    backgroundColor: "#f97316",
  },
  dotGreen: {
    backgroundColor: "#22c55e",
  },
  domainText: {
    flex: 1,
  },
  domainTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  domainDescription: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
  },
  infoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#BAA377",
    marginBottom: 8,
  },
  infoList: {
    // paddingLeft: 20,
  },
  infoListItem: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.2,
    marginBottom: 8,
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#BAA377",
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#BAA377",
  },
  followUpTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  followUpHeader: {
    backgroundColor: "#334155",
    flexDirection: "row",
  },
  followUpHeaderCell: {
    padding: 16,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#BAA377",
  },
  followUpRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  followUpCell: {
    padding: 16,
    fontSize: 10,
    color: "#374151",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  questionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 6,
    overflow: "hidden",
  },
  questionHeader: {
    backgroundColor: "#ffffff",
    paddingTop: 4,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: "#334155",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    paddingTop: 8,
  },
  questionBody: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 12,
  },
  questionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  responseBox: {
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    marginTop: 0,
    marginBottom: 0,
  },
  responseText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
  },
  glossaryItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  glossaryDot: {
    width: 12,
    height: 12,
    marginRight: 12,
    marginTop: 4,
  },
  glossaryText: {
    flex: 1,
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
  },
  referenceItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  referenceNumber: {
    fontSize: 10,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
    width: 20,
  },
  referenceText: {
    flex: 1,
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.6,
  },
  link: {
    color: "#2563eb",
    textDecoration: "underline",
  },
});

// Helper component for page header - uses dynamic page number with fixed prop
const PageHeader = ({ logoUrl }) => (
  <View fixed style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: 20, paddingLeft: 20, paddingRight: 20, paddingBottom: 0 }}>
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {logoUrl ? (
          <Image src={logoUrl} style={styles.logo} />
        ) : (
          <Text style={{ fontSize: 10, color: "#BAA377", fontWeight: "600" }}>CaringAI</Text>
        )}
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.brandName}>CaringAI Listen</Text>
        <Text style={styles.subtitle}>Cognitive Assessment Report</Text>
      </View>
      <View style={styles.headerRight}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "500",
            textAlign: "right",
          }}
          render={({ pageNumber }) => (
            <Text>
              <Text style={{ color: "#BAA377" }}>Page : </Text>
              <Text style={{ color: "#BAA377" }}>{pageNumber}</Text>
            </Text>
          )}
        />
      </View>
    </View>
    <View style={styles.divider} />
  </View>
);

// ✅ PDF Document Component with all 14 pages
const CognitiveReportPDF = ({ patientData, logoUrl, questionData = [] }) => (
  <Document>
    {/* PAGE 1 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      {/* Patient Details Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Patient Details</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Patient Name:</Text>
              <Text style={styles.value}>{patientData?.name || "N/A"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>{patientData?.dateOfBirth || "N/A"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{patientData?.gender || "N/A"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Group:</Text>
              <Text style={styles.value}>{patientData?.ageGroup || "N/A"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Assessment Date:</Text>
              <Text style={styles.value}>{patientData?.assessmentDate || "N/A"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Assessment ID:</Text>
              <Text style={styles.value}>{patientData?.assessmentId || "N/A"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Report Generated:</Text>
              <Text style={styles.value}>{patientData?.reportGenerated || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Clinical Triage Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Clinical Triage Recommendation</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={[styles.textContent, styles.bold]}>
            Cognitive Status Interpretation
          </Text>
          <Text style={styles.textContent}>
            Recommend urgent neurological or geriatric psychiatry evaluation for
            multi-domain cognitive impairment with safety concerns; initiate
            dementia care management services immediately.
          </Text>
          <Text style={styles.rationale}>
            <Text style={styles.bold}>Rationale:</Text> Assessment findings
            indicate probable Major Neurocognitive Disorder with multi-domain
            cognitive impairment affecting attention, executive function, and
            memory creating immediate safety risks requiring urgent specialist
            evaluation and dementia care management coordination.
          </Text>
          <View style={styles.buttonBadge}>
            <Text>REFER NOW</Text>
          </View>
        </View>
      </View>

      {/* DSM-5 Criteria Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Cognitive Status Interpretation</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={[styles.interpretationTitle, { fontSize: 12, marginBottom: 16 }]}>
            DSM-5 Criteria Assessment
          </Text>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Criteria</Text>
              <Text style={styles.tableHeaderCell}>Status</Text>
              <Text style={styles.tableHeaderCell}>Supporting Evidence</Text>
            </View>

            {/* Table Rows */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>
                A. Cognitive Deficits
              </Text>
              <Text style={[styles.tableCell, styles.tableCellGreen]}>✅ MET</Text>
              <Text style={styles.tableCell}>
                Significant impairment in Memory (14th percentile) and Reasoning
                (14th percentile) domains
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>
                B. Functional Impact
              </Text>
              <Text style={[styles.tableCell, styles.tableCellGreen]}>✅ MET</Text>
              <Text style={styles.tableCell}>
                IADL score 6/8 – Mild Functional decline affecting telephone use
                and shopping independently
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>
                C. Not Due to Delirium
              </Text>
              <Text style={[styles.tableCell, styles.tableCellGreen]}>✅ MET</Text>
              <Text style={styles.tableCell}>
                No acute confusion or fluctuating consciousness reported
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>
                D. Not Due to Mental Disorder
              </Text>
              <Text style={[styles.tableCell, styles.tableCellGreen]}>✅ MET</Text>
              <Text style={styles.tableCell}>
                Minimal depression (GDS-15: 2/15) and anxiety (GAD-7: 1/21)
                symptoms
              </Text>
            </View>
          </View>

          {/* Clinical Interpretation */}
          <View style={styles.interpretationBox}>
            <Text style={styles.interpretationTitle}>Clinical Interpretation</Text>
            <Text style={styles.interpretationText}>
              <Text style={styles.bold}>
                Probable Major Neurocognitive Disorder
              </Text>{" "}
              — Patient meets all DSM-5 criteria for Major NCD with evidence of
              significant cognitive decline that interferes with independence in
              everyday activities.
            </Text>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 2 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      {/* Care Plan Recommendations Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Care Plan Recommendations</Text>
        </View>
        <View style={styles.sectionContent}>
          {/* High-Risk Areas */}
          <View style={styles.highRiskBox}>
            <Text style={styles.highRiskTitle}>
              High-Risk Areas Requiring Immediate Attention:
            </Text>
            <View style={styles.priorityList}>
              <Text style={styles.listItem}>
                <Text style={styles.listItemBold}>Financial management:</Text>{" "}
                Mathematical reasoning and executive deficits increase vulnerability
              </Text>
              <Text style={styles.listItem}>
                <Text style={styles.listItemBold}>Medication management:</Text>{" "}
                Memory and attention deficits affect adherence and safety
              </Text>
            </View>
          </View>

          {/* Recommended Immediate Actions */}
          <Text style={[styles.interpretationTitle, { fontSize: 12, marginBottom: 16 }]}>
            Recommended Immediate Actions
          </Text>

          {/* Priority 1 */}
          <View style={styles.prioritySection}>
            <View style={styles.priorityHeader}>
              <Text style={styles.priorityTitle}>
                Priority 1: Safety Assessment{" "}
                <Text style={{ fontWeight: "700" }}>(Within 1–2 weeks)</Text>
              </Text>
            </View>
            <View style={styles.priorityList}>
              <Text style={styles.listItem}>
                Comprehensive evaluation of driving capacity given attention and
                executive deficits
              </Text>
              <Text style={styles.listItem}>
                Medication management review with pharmacist consultation
              </Text>
              <Text style={styles.listItem}>
                Financial management assessment and potential protective measures
              </Text>
              <Text style={styles.listItem}>
                Home safety evaluation focusing on cognitive demands
              </Text>
            </View>
          </View>

          {/* Priority 2 */}
          <View style={styles.prioritySection}>
            <View style={styles.priorityHeader}>
              <Text style={styles.priorityTitle}>
                Priority 2: Specialist Referral{" "}
                <Text style={{ fontWeight: "700" }}>(Within 2–4 weeks)</Text>
              </Text>
            </View>
            <View style={styles.priorityList}>
              <Text style={styles.listItem}>
                Neurological or geriatric psychiatry evaluation for diagnostic
                confirmation
              </Text>
              <Text style={styles.listItem}>
                Neuropsychological testing for comprehensive cognitive assessment
              </Text>
              <Text style={styles.listItem}>
                Medical workup to exclude reversible causes of cognitive impairment
              </Text>
            </View>
          </View>

          {/* Priority 3 */}
          <View style={styles.prioritySection}>
            <View style={styles.priorityHeader}>
              <Text style={styles.priorityTitle}>
                Priority 3: Care Coordination{" "}
                <Text style={{ fontWeight: "700" }}>(Within 1–3 months)</Text>
              </Text>
            </View>
            <View style={styles.priorityList}>
              <Text style={styles.listItem}>
                Multidisciplinary care team development
              </Text>
              <Text style={styles.listItem}>
                Caregiver education and support resource identification
              </Text>
              <Text style={styles.listItem}>
                Implementation of cognitive and functional support strategies
              </Text>
              <Text style={styles.listItem}>
                Regular monitoring schedule establishment
                <Text style={{ fontSize: 10 }}>20</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 3 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Cognitive Domain Performance Summary</Text>
        </View>
        <View style={styles.sectionContent}>
          {/* Domains of Concern */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Domains of Concern</Text>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotOrange]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Complex Attention (18th percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Below typical range in attentional control
                </Text>
              </View>
            </View>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotOrange]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Working Memory (8th percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Below typical range in delayed recall
                </Text>
              </View>
            </View>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotOrange]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Executive Function (12th percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Below typical range in logical reasoning tasks
                </Text>
              </View>
            </View>
          </View>

          {/* Preserved Domains */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preserved Domains</Text>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotGreen]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Working Memory (22nd percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Within typical range
                </Text>
              </View>
            </View>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotGreen]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Attention (22nd percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Within typical range
                </Text>
              </View>
            </View>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotGreen]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Executive Function (22nd percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Within typical range
                </Text>
              </View>
            </View>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotGreen]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Language (42nd percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Within typical range
                </Text>
              </View>
            </View>
            <View style={styles.domainItem}>
              <View style={[styles.dot, styles.dotGreen]} />
              <View style={styles.domainText}>
                <Text style={styles.domainTitle}>
                  Orientation (31st percentile)-
                </Text>
                <Text style={styles.domainDescription}>
                  Within typical range
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 4 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Care Plan Recommendations</Text>
        </View>
        <View style={styles.sectionContent}>
          {/* IADL Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Instrumental Activities of Daily Living (IADL): 6/8
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Functional Status:</Text> Mild functional decline with selective dependencies
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Areas of Independence:</Text> Housekeeping, laundry, meal preparation, medication management, handling finances, transportation
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Areas Requiring Support:</Text> Telephone use, shopping assistance needed
              </Text>
            </View>
            <PDFProgressBar current={6} total={8} label="Score" />
          </View>

          {/* Mental Health Screening */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mental Health Screening:</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              <View style={[styles.scoreBox, { flex: 1, minWidth: "45%", flexDirection: "column", alignItems: "flex-start", marginBottom: 0 }]}>
                <Text style={[styles.scoreLabel, { marginRight: 0, marginBottom: 4 }]}>Score</Text>
                <Text style={styles.scoreValue}>2/15</Text>
                <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                  Depression (GDS-15)
                </Text>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>
                  2/15 – Minimal symptoms⁴
                </Text>
              </View>
              <View style={[styles.scoreBox, { flex: 1, minWidth: "45%", flexDirection: "column", alignItems: "flex-start", marginBottom: 0 }]}>
                <Text style={[styles.scoreLabel, { marginRight: 0, marginBottom: 4 }]}>Score</Text>
                <Text style={styles.scoreValue}>1/21</Text>
                <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                  Anxiety (GAD-7)
                </Text>
                <Text style={{ fontSize: 10, color: "#6b7280" }}>
                  1/21 – Minimal symptoms⁵
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Follow-up Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Follow-up Schedule</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.followUpTable}>
            <View style={styles.followUpHeader}>
              <Text style={styles.followUpHeaderCell}>Timeframe</Text>
              <Text style={styles.followUpHeaderCell}>Action Required</Text>
              <Text style={[styles.followUpHeaderCell, { borderRightWidth: 0 }]}>Provider</Text>
            </View>
            <View style={styles.followUpRow}>
              <Text style={styles.followUpCell}>1–2 weeks</Text>
              <Text style={styles.followUpCell}>Safety Assessment</Text>
              <Text style={[styles.followUpCell, { borderRightWidth: 0 }]}>Primary Care/Care Management</Text>
            </View>
            <View style={styles.followUpRow}>
              <Text style={styles.followUpCell}>2–4 weeks</Text>
              <Text style={styles.followUpCell}>Specialist Referral</Text>
              <Text style={[styles.followUpCell, { borderRightWidth: 0 }]}>Neurology/Geriatrics</Text>
            </View>
            <View style={styles.followUpRow}>
              <Text style={styles.followUpCell}>1–3 months</Text>
              <Text style={styles.followUpCell}>Care Plan Development</Text>
              <Text style={[styles.followUpCell, { borderRightWidth: 0 }]}>Primary Care/Care Management</Text>
            </View>
            <View style={styles.followUpRow}>
              <Text style={styles.followUpCell}>6–12 months</Text>
              <Text style={styles.followUpCell}>Cognitive reassessment</Text>
              <Text style={[styles.followUpCell, { borderRightWidth: 0 }]}>CaringAI/Specialist</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 5 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Detailed Assessment Results</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>Executive Summary:</Text>
          <Text style={styles.textContent}>
            This comprehensive cognitive assessment utilizes a battery of standardized tasks across five major cognitive domains: **Complex Attention, Executive Function, Language, Learning & Memory, and Orientation.** The assessment reveals a pattern of selective cognitive impairment with specific deficits in complex attention, memory systems, and executive function while demonstrating relative preservation in the other domains. This profile requires immediate clinical attention and comprehensive care planning.
          </Text>

          <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 16 }}>
            <Text style={[styles.cardTitle, { color: "#BAA377", fontSize: 12 }]}>
              Domains of Concern
            </Text>

            <Text style={[styles.domainTitle, { fontSize: 12, marginTop: 12 }]}>
              Complex Attention Domain
            </Text>
            <Text style={styles.textContent}>
              Complex attention encompasses the ability to sustain focus, divide attention between tasks, and manage cognitive load during demanding activities. This domain showed significant impairment across multiple measures, indicating **substantial difficulties** with attentional control and executive strain.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Count Backward 20 to 1 (6CIT)
              </Text>
              <View style={styles.infoList}>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Score:</Text> 18th percentile ( Below Typical Range )
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Task Description:</Text> Assesses sustained attention and executive control by requiring participants to maintain focus while manipulating numerical sequences in working memory.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Clinical Significance:</Text> The impaired performance indicates dysfunction in prefrontal–parietal attention networks and suggests difficulties with tasks requiring sustained cognitive effort.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Functional Impact:</Text> The inability to successfully complete backward counting reflects compromised executive attention systems that are crucial for daily activities requiring focus and mental manipulation.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Recommended Interventions:</Text> Break down complex tasks into smaller components; review medication management and financial decision-making risks with caregiver oversight.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 6 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Cognitive Domain Analysis</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>Learning & Memory Domain</Text>
          <Text style={styles.textContent}>
            Memory assessment revealed significant impairment in episodic memory formation and retention, characteristic of medial temporal lobe dysfunction.⁴
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              Delayed Address Recall (6CIT)
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Score:</Text> 8th percentile ( Below Typical Range )
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Task Description:</Text> Assesses the ability to remember a list of words after a delay, often impaired early in Alzheimer's disease
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Clinical Significance:</Text> This finding suggests significant difficulties with episodic memory consolidation and retrieval
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Functional Impact:</Text> This level of impairment significantly affects daily functioning, including difficulty remembering recent conversations, appointments, and important information necessary for independent living.
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Recommended Interventions:</Text> Implement external memory aids including calendars and pill organizers; review medication management systems.
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 16 }}>
            <Text style={styles.cardTitle}>Executive Function Domain</Text>
            <Text style={styles.textContent}>
              Executive function encompasses higher-order cognitive processes including working memory, cognitive flexibility, and abstract reasoning. This domain demonstrated significant impairment across multiple measures, indicating **substantial dysfunction** in prefrontal cortical systems.⁶
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Digit Span Backwards (Supplemental)
              </Text>
              <View style={styles.infoList}>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Score:</Text> 12th percentile ( Below Typical Range )
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Task Description:</Text> Backward digit counting requires working memory manipulation and executive control, representing more demanding cognitive processing than forward counting.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Clinical Significance:</Text> Impaired performance indicates dysfunction in dorsolateral prefrontal cortex and associated working memory networks.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Functional Impact:</Text> This deficit significantly impacts the ability to complete multi-step tasks and maintain complex information in mind while manipulating it.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Recommended Interventions:</Text> Establish structured daily routines; provide stepwise instructions for complex activities.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 7 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Cognitive Domain Analysis</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={[styles.cardTitle, { color: "#BAA377" }]}>Preserved Domains</Text>

          <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 16 }}>
            <Text style={styles.domainTitle}>Orientation Domain</Text>
            <Text style={styles.textContent}>
              Orientation assessment revealed disorientation to temporal information, indicating dysfunction in basic orientation systems.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Year / Month / Day of Week (6CIT)
              </Text>
              <View style={styles.infoList}>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Score:</Text> 31st percentile ( Within Typical Range )
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Task Description:</Text> Temporal orientation requires intact memory systems and awareness of current context.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Clinical Significance:</Text> Performance indicates preserved function in systems responsible for maintaining awareness of time and date.
                </Text>
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.domainTitle}>Language Domain</Text>
            <Text style={styles.textContent}>
              Language assessment revealed mixed performance, with specific deficits in fluency measures while maintaining some basic language comprehension and expression abilities.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Sentence Repetition (2 phrases)
              </Text>
              <View style={styles.infoList}>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Score:</Text> 42nd percentile ( Within Typical Range )
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Task Description:</Text> Sentence repetition requires repeating two short sentence prompts.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Clinical Significance:</Text> Performance suggests preserved function in language processing networks requiring both comprehension and expression abilities.
                </Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Functional Impact:</Text> This indicates preserved effective communication, following spoken instructions for daily interactions.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 8 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Functional Assessment Details</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>
            Instrumental Activities of Daily Living (IADL)
          </Text>
          <Text style={styles.textContent}>
            The IADL scale evaluates an individual's ability to perform complex daily tasks necessary for independent living. This assessment is crucial for determining the level of support needed and monitoring changes over time.⁷
          </Text>

          <PDFProgressBar current={6} total={8} />

          {/* IADL Activities List - 3 Columns */}
          <View style={{ flexDirection: "row", marginTop: 16, justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Column 1 */}
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8, lineHeight: 1.5 }}>•</Text>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>Housekeeping activities</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8, lineHeight: 1.5 }}>•</Text>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>Medication management</Text>
              </View>
            </View>

            {/* Column 2 */}
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8, lineHeight: 1.5 }}>•</Text>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>Financial handling</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8, lineHeight: 1.5 }}>•</Text>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>Laundry management</Text>
              </View>
            </View>

            {/* Column 3 */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8, lineHeight: 1.5 }}>•</Text>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>Meal preparation</Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8, lineHeight: 1.5 }}>•</Text>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>Transportation arrangements</Text>
              </View>
            </View>
          </View>







        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Functional Assessment Details</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 16 }}>
            <Text style={styles.cardTitle}>
              Areas Requiring Support (2/8 domains):
            </Text>
            <PDFProgressBar current={6} total={8} />
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Telephone Use:</Text> Patient does not independently use telephone
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Shopping:</Text> Requires accompaniment for shopping activities
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.cardTitle}>Clinical Interpretation:</Text>
            <Text style={styles.textContent}>
              The IADL score of 6/8 indicates **"low function, dependent"** status, suggesting that while basic self-care may be preserved, complex instrumental activities require increasing support. This level of functional decline is consistent with the cognitive impairments observed and supports the diagnosis of **Major Neurocognitive Disorder**.
            </Text>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 9 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Mental Health Assessment Details</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>Depression Screening (GDS-15)</Text>
          <Text style={styles.textContent}>
            The Geriatric Depression Scale-15 is a validated 15-item screening tool for depression in older adults with cutoff ≥5 indicating possible depression and ≥10 indicating likely depression.⁴
          </Text>

          <View style={styles.infoBox}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ minWidth: 120, marginRight: 24 }}>
                <View style={[styles.scoreBox, {
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#faf8f3",
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 16,
                  paddingRight: 16,
                  marginBottom: 8
                }]}>
                  <Text style={[styles.scoreLabel, { marginRight: 4, fontSize: 10 }]}>Score</Text>
                  <Text style={[styles.scoreValue, { fontSize: 12, color: "#BAA377" }]}>2/15</Text>
                </View>
                <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 0 }}>
                  (Minimal symptoms)
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { fontSize: 12, marginBottom: 8 }]}>Reported Symptoms:</Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>Mild endorsement on 2 items</Text>
                  <Text style={styles.infoListItem}>All other items: No symptoms reported</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.cardTitle}>Clinical Interpretation:</Text>
            <Text style={styles.textContent}>
              The minimal depression score suggests that cognitive symptoms are not primarily attributable to mood disorder, supporting the differential diagnosis of neurocognitive disorder.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Mental Health Assessment Details</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>Anxiety Screening (GAD-7)</Text>
          <Text style={styles.textContent}>
            The Generalized Anxiety Disorder-7 scale screens for anxiety symptoms and severity.⁹
          </Text>

          <View style={styles.infoBox}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ minWidth: 120, marginRight: 24 }}>
                <View style={[styles.scoreBox, {
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#faf8f3",
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 16,
                  paddingRight: 16,
                  marginBottom: 8
                }]}>
                  <Text style={[styles.scoreLabel, { marginRight: 4, fontSize: 10 }]}>Score</Text>
                  <Text style={[styles.scoreValue, { fontSize: 12, color: "#BAA377" }]}>1/21</Text>
                </View>
                <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 0 }}>
                  (Minimal symptoms)
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { fontSize: 12, marginBottom: 8 }]}>Reported Symptoms:</Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>
                    Trouble controlling worry (several days in past 2 weeks)
                  </Text>
                  <Text style={styles.infoListItem}>All other items: Not at all</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.cardTitle}>Clinical Interpretation:</Text>
            <Text style={styles.textContent}>
              Minimal anxiety symptoms further support that cognitive impairments are not primarily due to psychiatric comorbidities.
            </Text>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 10 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Understanding Cognitive Decline and Dementia</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>Cognitive Assessment in Clinical Practice</Text>
          <Text style={styles.textContent}>
            Cognitive decline represents a spectrum from normal aging through **Mild Cognitive Impairment (MCI)** to **Major Neurocognitive Disorder (dementia)**. Early identification is crucial for implementing appropriate interventions and support systems.¹⁰
          </Text>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.cardTitle}>DSM-5 Diagnostic Framework</Text>
            <Text style={styles.textContent}>
              The Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5), provides standardized criteria for neurocognitive disorders:
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Mild Neurocognitive Disorder (MCI):
              </Text>
              <View style={styles.infoList}>
                <Text style={styles.infoListItem}>
                  Evidence of modest cognitive decline from previous level of performance
                </Text>
                <Text style={styles.infoListItem}>
                  Cognitive deficits do not interfere with capacity for independence in everyday activities
                </Text>
                <Text style={styles.infoListItem}>
                  May represent prodromal stage of dementia
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Understanding Cognitive Decline and Dementia</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              Major Neurocognitive Disorder (Dementia):
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>
                Evidence of significant cognitive decline from previous level of performance
              </Text>
              <Text style={styles.infoListItem}>
                Cognitive deficits interfere with independence in everyday activities
              </Text>
              <Text style={styles.infoListItem}>
                Represents substantial functional impairment requiring care planning
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 11 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Understanding Cognitive Decline and Dementia</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>Cognitive Domains Assessed</Text>
          <Text style={styles.textContent}>
            CaringAI Listen evaluates key cognitive domains identified as early markers of neurodegenerative disease:¹¹.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Memory Systems:</Text>
            <View style={styles.infoList}>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Episodic Memory:</Text> Storage and retrieval of personal experiences and events
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Working Memory:</Text> Temporary maintenance and manipulation of information
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Spatial Memory:</Text> Navigation and location-based memory systems
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Executive Functions:</Text>
            <View style={styles.infoList}>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Planning and Organization:</Text> Goal-directed behavior and strategy development
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Inhibitory Control:</Text> Suppression of inappropriate responses
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Cognitive Flexibility:</Text> Adaptation to changing task demands
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Attention and Processing:</Text>
            <View style={styles.infoList}>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Sustained Attention:</Text> Maintenance of focus over time
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Selective Attention:</Text> Filtering relevant from irrelevant information
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Processing Speed:</Text> Rate of cognitive operations
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Language and Communication:</Text>
            <View style={styles.infoList}>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Verbal Reasoning:</Text> Logic and comprehension in linguistic contexts
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 10, color: "#374151", marginRight: 8 }}>•</Text>
                <Text style={styles.infoListItem}>
                  <Text style={styles.bold}>Phonological Processing:</Text> Sound-based language manipulation
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Cognitive Assessment Results Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Cognitive Assessment Results</Text>
        </View>
        <View style={styles.sectionContent}>
          {questionData && questionData.length > 0 ? (
            questionData.map((item, index) => (
              <View key={index} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {/* <Text style={styles.questionNumber}>{index + 1}</Text> */}
                    {item.questionString && (
                      <Text style={{ fontSize: 10, color: "#111827", fontWeight: "600", marginLeft: 12 }}>
                        Q. {item.questionString}
                      </Text>
                    )}
                  </View>
                  <View style={{
                    paddingTop: 6,
                    paddingBottom: 6,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderRadius: 8,

                  }}>
                    <Text style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: item.score === 1 ? "#4b5563" : item.score === 0 ? "#dc2626" : "#4b5563",
                    }}>
                      Score: {item.score}
                    </Text>
                  </View>
                </View>
                <View style={styles.questionBody}>

                  <View style={[styles.responseBox,]}>
                    <Text style={[styles.responseText, { color: "#111827", marginLeft: 4 }]}>
                      - {item.response || "No response recorded"}
                    </Text>
                  </View>


                </View>
              </View>
            ))
          ) : (
            <Text style={styles.textContent}>No question data available</Text>
          )}
        </View>
      </View>
    </Page>

    {/* PAGE 12 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Understanding Cognitive Decline and Dementia</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 16 }}>
            <Text style={styles.cardTitle}>Clinical Significance of Findings</Text>
            <Text style={styles.textContent}>
              The pattern of impairment observed—significant memory and reasoning deficits with relative preservation of attention, executive function, and language—is consistent with amnestic presentations commonly seen in early Alzheimer's disease.¹² This profile suggests:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Primary Memory System Involvement:</Text> Hippocampal and medial temporal lobe dysfunction
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Secondary Reasoning Deficits:</Text> Possible extension to association cortices
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Preserved Core Functions:</Text> Intact attention and executive networks suggest focal rather than global impairment
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.cardTitle}>Importance of Early Detection</Text>
            <Text style={styles.textContent}>
              Early identification of cognitive decline enables:¹³
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>Implementation of evidence-based interventions</Text>
              <Text style={styles.infoListItem}>Safety planning and risk mitigation</Text>
              <Text style={styles.infoListItem}>Caregiver education and support services</Text>
              <Text style={styles.infoListItem}>Advanced directive planning</Text>
              <Text style={styles.infoListItem}>Enrollment in clinical trials and research studies</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Clinical Decision Support</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.cardTitle}>Referral Guidelines</Text>
          <Text style={styles.textContent}>
            Based on assessment findings, specialist evaluation is recommended to:
          </Text>
          <View style={styles.infoList}>
            <Text style={styles.infoListItem}>
              Confirm diagnostic impression through comprehensive neuropsychological testing
            </Text>
            <Text style={styles.infoListItem}>
              Evaluate for reversible causes of cognitive impairment
            </Text>
            <Text style={styles.infoListItem}>
              Initiate appropriate pharmacological and non-pharmacological interventions
            </Text>
            <Text style={styles.infoListItem}>
              Develop comprehensive care plans addressing safety, function, and quality of life
            </Text>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 13 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Clinical Decision Support</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 16 }}>
            <Text style={styles.cardTitle}>Clinical Significance of Findings</Text>
            <Text style={styles.textContent}>
              This assessment provides structured documentation supporting:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>CPT Code 99483:</Text> Cognitive assessment and care plan services
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Annual Wellness Visit (AWV)</Text> cognitive screening requirements
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>GUIDE Model</Text> dementia care coordination programs
              </Text>
              <Text style={styles.infoListItem}>
                <Text style={styles.bold}>Medicare Shared Savings Program</Text> quality measures
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.cardTitle}>Quality Metrics and Outcomes</Text>
            <Text style={styles.textContent}>
              Regular cognitive assessment supports quality improvement initiatives:¹³
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>Early detection rates for cognitive impairment</Text>
              <Text style={styles.infoListItem}>Timely specialist referral completion</Text>
              <Text style={styles.infoListItem}>Care plan development and implementation</Text>
              <Text style={styles.infoListItem}>Patient and caregiver satisfaction with care coordination</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Glossary of Terms</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>CaringAI Listen Enhanced Assessment:</Text> A telephone-based cognitive evaluation system measuring structured cognitive tasks, designed for primary care integration and population-level screening.
            </Text>
          </View>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>DSM-5 Criteria:</Text> Standardized diagnostic criteria from the Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, used for clinical diagnosis of neurocognitive disorders.
            </Text>
          </View>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>Instrumental Activities of Daily Living (IADL):</Text> Complex daily tasks required for independent community living, including telephone use, shopping, housekeeping, meal preparation, and financial management.
            </Text>
          </View>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>Major Neurocognitive Disorder:</Text> DSM-5 term for dementia, characterized by significant cognitive decline that interferes with independence in everyday activities.
            </Text>
          </View>
        </View>
      </View>
    </Page>

    {/* PAGE 14 */}
    <Page size="A4" style={styles.page} wrap>
      <PageHeader logoUrl={logoUrl} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>Glossary of Terms</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>Mild Cognitive Impairment (MCI):</Text> Cognitive decline greater than expected for age but not severe enough to significantly interfere with daily functioning.
            </Text>
          </View>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>Percentile Rank:</Text> Statistical measure indicating the percentage of the comparison group that scored below the patient's performance level.
            </Text>
          </View>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>Geriatric Depression Scale-15:</Text> a validated 15-item screening tool for depression symptoms in older adults with cutoff ≥5 for possible depression.
            </Text>
          </View>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>GAD-7:</Text> Generalized Anxiety Disorder-7 scale, a validated screening instrument for anxiety symptoms.
            </Text>
          </View>
          <View style={styles.glossaryItem}>
            <View style={[styles.glossaryDot, { backgroundColor: "#BAA377" }]} />
            <Text style={styles.glossaryText}>
              <Text style={styles.bold}>Triage Categories:</Text> Clinical decision support classifications (Refer/Assess/Monitor) that guide next steps in cognitive care pathways.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text>References</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceNumber}>1.</Text>
            <Text style={styles.referenceText}>
              American Psychiatric Association. Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5). Arlington, VA: American Psychiatric Publishing; 2013.
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceNumber}>2.</Text>
            <Text style={styles.referenceText}>
              Centers for Medicare & Medicaid Services. CMS launches model aimed at improving dementia care – GUIDE Model. July 2024.
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceNumber}>3.</Text>
            <Text style={styles.referenceText}>
              Lawton MP, Brody EM. Assessment of older people: self-maintaining and instrumental activities of daily living. Gerontologist. 1969;9(3):179–186.
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceNumber}>4.</Text>
            <Text style={styles.referenceText}>
              Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606–613.
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceNumber}>5.</Text>
            <Text style={styles.referenceText}>
              Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092–1097.
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceNumber}>6.</Text>
            <Text style={styles.referenceText}>
              Centers for Medicare & Medicaid Services. Cognitive Assessment & Care Plan Services CPT Code 99483. Available from: https://www.cms.gov/medicare/payment/fee-schedules/physician/cognitive-assessment
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={styles.referenceNumber}>7.</Text>
            <Text style={styles.referenceText}>
              Brooke N, et al. The Six Item Cognitive Impairment Test (6CIT): validation and practical use. Int J Geriatr Psychiatry. 1999;14(11):936–940.
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default CognitiveReportPDF;
