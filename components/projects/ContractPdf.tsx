"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  clientSection: {
    flex: 1,
    marginRight: 20,
  },
  invoiceSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  clientInfo: {
    fontSize: 10,
    marginBottom: 4,
    color: "#333333",
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  invoiceDetails: {
    fontSize: 10,
    marginBottom: 4,
    color: "#333333",
  },
  servicesTable: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tableCell: {
    fontSize: 9,
    color: "#333333",
  },
  descriptionColumn: {
    flex: 3,
    textAlign: "left",
  },
  amountColumn: {
    flex: 1,
    textAlign: "center",
  },
  priceColumn: {
    flex: 1,
    textAlign: "right",
  },
  summarySection: {
    alignItems: "flex-end",
    marginTop: 20,
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#333333",
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  contractorSection: {
    flex: 1,
    marginRight: 20,
  },
  paymentSection: {
    flex: 1,
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: 200,
    height: 60,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
    marginTop: 10,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 5,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#000000",
  },
  contractSubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 30,
    color: "#666666",
  },
  termsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
  },
  termsText: {
    fontSize: 9,
    marginBottom: 8,
    color: "#333333",
    lineHeight: 1.3,
  },
});

interface ContractorData {
  fullName?: string;
  legalName?: string;
  displayName?: string;
  individualId?: string;
  businessId?: string;
  country: string;
  address: string;
  email: string;
}

interface FreelancerData {
  fullName: string;
  freelancerId: string;
  country: string;
  address: string;
  email: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  expectedDeliveryDate: string;
  milestones: Array<{
    title: string;
    description: string;
    percentage: number;
  }>;
}

interface ContractPDFProps {
  contractor: ContractorData;
  freelancer: FreelancerData;
  project: ProjectData;
  contractId: string;
}

export const ContractPDF: React.FC<ContractPDFProps> = ({
  contractor,
  freelancer,
  project,
  contractId,
}) => {
  const formatCurrency = (amount: number) => {
    return `USD ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const contractorName =
    contractor.legalName ||
    contractor.displayName ||
    contractor.fullName ||
    "N/A";
  const contractorId =
    contractor.businessId || contractor.individualId || "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Contract Title */}
        <Text style={styles.contractTitle}>PROJECT CONTRACT</Text>
        <Text style={styles.contractSubtitle}>
          Contract ID: {contractId} | Date:{" "}
          {formatDate(new Date().toISOString())}
        </Text>

        {/* Header Section */}
        <View style={styles.header}>
          {/* Contractor Information */}
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>CONTRACTOR</Text>
            <Text style={styles.clientInfo}>{contractorName}</Text>
            <Text style={styles.clientInfo}>{contractor.address}</Text>
            <Text style={styles.clientInfo}>{contractor.country}</Text>
            <Text style={styles.clientInfo}>ID: {contractorId}</Text>
            <Text style={styles.clientInfo}>Email: {contractor.email}</Text>
          </View>

          {/* Freelancer Information */}
          <View style={styles.invoiceSection}>
            <Text style={styles.sectionTitle}>FREELANCER</Text>
            <Text style={styles.clientInfo}>{freelancer.fullName}</Text>
            <Text style={styles.clientInfo}>{freelancer.address}</Text>
            <Text style={styles.clientInfo}>{freelancer.country}</Text>
            <Text style={styles.clientInfo}>ID: {freelancer.freelancerId}</Text>
            <Text style={styles.clientInfo}>Email: {freelancer.email}</Text>
          </View>
        </View>

        {/* Project Information */}
        <View style={styles.servicesTable}>
          <Text style={styles.sectionTitle}>PROJECT DETAILS</Text>
          <Text style={styles.clientInfo}>Project: {project.title}</Text>
          <Text style={styles.clientInfo}>
            Description: {project.description}
          </Text>
          <Text style={styles.clientInfo}>
            Expected Delivery: {formatDate(project.expectedDeliveryDate)}
          </Text>
        </View>

        {/* Milestones Table */}
        <View style={styles.servicesTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.amountColumn]}>
              Percentage
            </Text>
            <Text style={[styles.tableHeaderText, styles.priceColumn]}>
              Amount
            </Text>
          </View>

          {project.milestones.map((milestone, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionColumn]}>
                {milestone.title}
                {milestone.description && (
                  <Text style={{ fontSize: 8, color: "#666666" }}>
                    {"\n"}- {milestone.description}
                  </Text>
                )}
              </Text>
              <Text style={[styles.tableCell, styles.amountColumn]}>
                {milestone.percentage}%
              </Text>
              <Text style={[styles.tableCell, styles.priceColumn]}>
                {formatCurrency(
                  (project.totalAmount * milestone.percentage) / 100
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total project cost:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(project.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
          <Text style={styles.termsText}>
            1. The Contractor agrees to pay the Freelancer the total amount of{" "}
            {formatCurrency(project.totalAmount)} for the completion of the
            project &quot;{project.title}&quot;.
          </Text>
          <Text style={styles.termsText}>
            2. Payment will be made according to the milestone schedule outlined
            above.
          </Text>
          <Text style={styles.termsText}>
            3. The Freelancer agrees to deliver the project by{" "}
            {formatDate(project.expectedDeliveryDate)}.
          </Text>
          <Text style={styles.termsText}>
            4. Both parties agree to maintain confidentiality regarding project
            details.
          </Text>
          <Text style={styles.termsText}>
            5. Any disputes will be resolved through mutual agreement or
            arbitration.
          </Text>
          <Text style={styles.termsText}>
            6. This contract is binding upon both parties upon signature.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.contractorSection}>
            <Text style={styles.signatureLabel}>Contractor Signature</Text>
            <View style={styles.signatureBox} />
            <Text style={styles.clientInfo}>{contractorName}</Text>
            <Text style={styles.clientInfo}>Date: _______________</Text>
          </View>

          <View style={styles.paymentSection}>
            <Text style={styles.signatureLabel}>Freelancer Signature</Text>
            <View style={styles.signatureBox} />
            <Text style={styles.clientInfo}>{freelancer.fullName}</Text>
            <Text style={styles.clientInfo}>Date: _______________</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
