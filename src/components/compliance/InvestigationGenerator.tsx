
import React from "react";
import { FlaggedTransaction } from "./FlaggedTransactions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { toast } from "sonner";

interface InvestigationGeneratorProps {
  transaction: FlaggedTransaction;
}

const InvestigationGenerator: React.FC<InvestigationGeneratorProps> = ({ transaction }) => {
  const generateInvestigationPDF = () => {
    // Create new PDF document
    const doc = new jsPDF();
    const currentDate = format(new Date(), "yyyy-MM-dd");
    const pageWidth = doc.internal.pageSize.width;
    
    // Add header with logo placeholder
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.text("COMPLIANCE INVESTIGATION REPORT", pageWidth/2, 25, { align: "center" });
    
    // Add report information
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("CONFIDENTIAL", pageWidth/2, 50, { align: "center" });
    doc.text("This document is part of an official investigation", pageWidth/2, 58, { align: "center" });
    
    // Add investigation details
    doc.setFontSize(14);
    doc.text("Investigation Details", 14, 75);
    
    doc.setFontSize(11);
    const details = [
      ["Report Generated:", currentDate],
      ["Investigation ID:", `INV-${Date.now().toString().substring(6)}`],
      ["Entity Under Investigation:", transaction.entity],
      ["Investigation Reason:", "Non-compliance with foreign exchange regulations"],
      ["Investigation Status:", "Initiated"],
      ["Risk Level:", transaction.severity.toUpperCase()]
    ];
    
    // Add details table
    autoTable(doc, {
      startY: 80,
      body: details,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 100 }
      }
    });
    
    // Add transaction details section
    doc.setFontSize(14);
    doc.text("Transaction Information", 14, 130);
    
    // Add transaction table
    const transactionData = [
      ["Date:", transaction.date],
      ["Amount:", new Intl.NumberFormat("en-US", { style: "currency", currency: transaction.currency }).format(transaction.amount)],
      ["Bank:", transaction.bank],
      ["Product:", transaction.product],
      ["Transaction Type:", transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)]
    ];
    
    autoTable(doc, {
      startY: 135,
      body: transactionData,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 100 }
      }
    });
    
    // Add allegations section
    doc.setFontSize(14);
    doc.text("Allegations & Concerns", 14, 175);
    
    doc.setFontSize(11);
    const allegations = transaction.reason.split(". ").filter(s => s.trim().length > 0);
    
    let yPosition = 185;
    allegations.forEach((allegation, index) => {
      doc.text(`${index + 1}. ${allegation}${allegation.endsWith(".") ? "" : "."}`, 14, yPosition);
      yPosition += 8;
    });
    
    // Add investigation procedure section
    yPosition += 10;
    doc.setFontSize(14);
    doc.text("Investigation Procedure", 14, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    const procedures = [
      "Review of all transaction records from financial institutions",
      "Cross-verification with customs data",
      "Request for supporting documentation from the entity",
      "Verification of export proceeds or import payments",
      "Interview with entity representatives"
    ];
    
    procedures.forEach((procedure, index) => {
      doc.text(`${index + 1}. ${procedure}`, 14, yPosition);
      yPosition += 8;
    });
    
    // Add footer with page number
    // Fix for getNumberOfPages issue - use internal.pages length instead
    const pageCount = doc.internal.pages.length - 1; // -1 because first page is at index 0
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount} | CONFIDENTIAL | Generated on ${currentDate}`, pageWidth/2, 290, { align: "center" });
    }
    
    // Save PDF
    doc.save(`investigation-${transaction.entity.replace(/\s+/g, "-").toLowerCase()}-${currentDate}.pdf`);
    
    toast.success("Investigation report generated", {
      description: "PDF has been downloaded to your computer"
    });
  };

  return (
    <div className="flex justify-end mt-4">
      <button 
        onClick={generateInvestigationPDF}
        className="hidden"
        id="generate-investigation-pdf"
      >
        Generate PDF
      </button>
    </div>
  );
};

export default InvestigationGenerator;
